import { E2EE_AUTH_HASH_HEADER, STORAGE_E2EE_SERVICE_KEYS } from '$lib/modules/constants';
import { e2eeMasterKey, e2eeServiceKeys, storeMasterKey } from '$lib/stores/account';
import {
  bufferToHex,
  deriveWrappingKeyFromBuffer,
  deriveWrappingKeyFromPassword,
  exportPublicKey,
  exportSymmetricKey,
  generateHmacKey,
  generateRandomBuffer,
  generateWrappingKey,
  generateX25519KeyPair,
  hmacString,
  unwrapWrappingKey,
  wrapKey
} from '@privacyportal/client-e2ee';
import { get } from 'svelte/store';
import { base64ToBase64Url, base64ToBuffer, bufferToBase64, clearBuffer } from '../auth';
import { CustomError } from '../errors';
import { addE2EEKey, addE2EEServiceKey, getE2EEServiceKeys, requestE2EEKeysChallenge, updateE2EEKey } from '../requests';
import { formatCredentialHeaders } from '../sendRequest';
import { sessionRead, sessionWrite } from '../storage';

type Passkey = { id: string; salt?: string };
type MasterKey = { ct: string; salt: string; auth_salt?: string };

export async function wrapMasterKeyWithPassword(masterKey: CryptoKey, password: string, salt: BufferSource) {
  // wrapping key
  const wrappingKey = await deriveWrappingKeyFromPassword(password, salt);
  if (!wrappingKey) throw new Error('Configuration failed.');

  // wrapped master key
  const wrappedMasterKey = await wrapKey('raw', wrappingKey, masterKey);
  return wrappedMasterKey;
}

export async function unwrapMasterKeyWithPassword(mkey: MasterKey, password: string): Promise<CryptoKey> {
  const wrappingKey = await deriveWrappingKeyFromPassword(password, base64ToBuffer(mkey.salt, { url: true }));
  const masterKey = await unwrapWrappingKey(wrappingKey, mkey.ct, { extractable: true }).catch(() => {
    throw new CustomError({ message: 'Password Incorrect.' });
  });
  return masterKey;
}

export async function unwrapMasterKeyWithPasskey(mkey: MasterKey, prfSecretBuffer: BufferSource): Promise<CryptoKey> {
  const wrappingKey = await deriveWrappingKeyFromBuffer(prfSecretBuffer, base64ToBuffer(mkey.salt, { url: true }));
  const masterKey = await unwrapWrappingKey(wrappingKey, mkey.ct, { extractable: true }).catch(() => {
    throw new CustomError({ message: 'Authentication Failed.' });
  });
  return masterKey;
}

export async function setupE2EE(user_id, password: string) {
  // generate salt
  const wrappingSalt = generateRandomBuffer();
  const authSalt = generateRandomBuffer();

  // generate keys
  const encKeyPair = await generateX25519KeyPair();
  const searchKey = await generateHmacKey();
  const masterKey = await generateWrappingKey();

  // public keys
  const epk = await exportPublicKey(encKeyPair.publicKey);

  // private / secret keys
  const esk = await wrapKey('pkcs8', masterKey, encKeyPair.privateKey);

  // search key
  const srchk = await wrapKey('raw', masterKey, searchKey);

  // wrap masterKey with password + salt
  const wrappedMasterKey = await wrapMasterKeyWithPassword(masterKey, password, wrappingSalt);
  const authKey = await deriveWrappingKeyFromPassword(password, authSalt, { hash: 'SHA-256', iterations: 200000, exportable: true });
  const authHash = await exportSymmetricKey(authKey);

  // create master key hash
  const masterKeyBuffer = await exportSymmetricKey(masterKey, { toBuffer: true });
  const masterKeyHash = await hmacString(bufferToHex(masterKeyBuffer), user_id);

  const data = {
    epk,
    esk,
    srchk,
    master_key: {
      type: 'pwd',
      ct: wrappedMasterKey,
      salt: bufferToBase64(wrappingSalt, { url: true }),
      hash: bufferToBase64(masterKeyHash, { url: true }),
      auth_hash: authHash,
      auth_salt: bufferToBase64(authSalt, { url: true })
    }
  };

  await addE2EEKey({ data }, { extraHeaders: {} });

  // store master key
  e2eeMasterKey.set(masterKey);
  storeMasterKey(masterKey);

  return data.master_key;
}

async function deriveAuthHashFromPassword(password: string, auth_salt: string | BufferSource) {
  const authSaltBuffer = typeof auth_salt === 'string' ? base64ToBuffer(auth_salt, { url: true }) : auth_salt;
  const oldAuthKey = await deriveWrappingKeyFromPassword(password, authSaltBuffer, { hash: 'SHA-256', iterations: 200000, exportable: true });
  return await exportSymmetricKey(oldAuthKey);
}

async function generateE2EEPwdSetupData(user_id: string, masterKey: CryptoKey, password: string) {
  // generate new salt and wrap master key with new password
  const salt = generateRandomBuffer();
  const wrappedMasterKey = await wrapMasterKeyWithPassword(masterKey, password, salt);

  // generate new auth_salt and derive new auth_hash from new password
  const authSalt = generateRandomBuffer();
  const authHash = await deriveAuthHashFromPassword(password, authSalt);

  // create master key hash
  const masterKeyBuffer = await exportSymmetricKey(masterKey, { toBuffer: true });
  const masterKeyHash = await hmacString(bufferToHex(masterKeyBuffer), user_id);

  return {
    master_key: {
      type: 'pwd',
      ct: wrappedMasterKey,
      salt: bufferToBase64(salt, { url: true }),
      hash: bufferToBase64(masterKeyHash, { url: true }),
      auth_salt: bufferToBase64(authSalt, { url: true }),
      auth_hash: authHash
    }
  };
}

export async function updateE2EESetup(user_id: string, pwd_mkey: MasterKey, oldPassword: string, password: string) {
  // unwrap master key using existing password
  const masterKey = await unwrapMasterKeyWithPassword(pwd_mkey, oldPassword);

  // wrap and hash master key with password
  const data = await generateE2EEPwdSetupData(user_id, masterKey, password);

  // derive auth_hash from existing password and auth_salt
  const oldAuthHash = await deriveAuthHashFromPassword(oldPassword, pwd_mkey.auth_salt);

  await updateE2EEKey({ data }, { extraHeaders: { [E2EE_AUTH_HASH_HEADER]: oldAuthHash } });

  return data.master_key;
}

export async function updateE2EESetupWithPasskey(user_id: string, password: string) {
  // unwrap master key using existing password
  const { wrappingKey, mkey, credential } = await requestAndDerivePassKeyWrappingKey();
  if (!wrappingKey || !mkey) throw new CustomError({ message: 'Update failed.' });
  const masterKey = await unwrapWrappingKey(wrappingKey, mkey.ct, { extractable: true }).catch(() => {
    throw new CustomError({ message: 'Authentication Failed.' });
  });

  // wrap and hash master key with password
  const data = await generateE2EEPwdSetupData(user_id, masterKey, password);

  await updateE2EEKey({ data }, { extraHeaders: formatCredentialHeaders(credential) });

  return data.master_key;
}

export async function addE2EEKeyWithPasskey(user_id: string, password: string, pwd_mkey: MasterKey, enabled_passkeys: Passkey[], passkeyId: string) {
  // lookup master key or unwrap it using existing password
  const masterKey = await unwrapMasterKeyWithPassword(pwd_mkey, password);

  const { salt, wrappingKey, credential } = await requestAndDerivePassKeyWrappingKey(enabled_passkeys, passkeyId);
  if (!wrappingKey) throw new CustomError({ message: 'Configuration failed.' });

  // wrapped master key
  const wrappedMasterKey = await wrapKey('raw', wrappingKey, masterKey);

  // create master key hash
  const masterKeyBuffer = await exportSymmetricKey(masterKey, { toBuffer: true });
  const masterKeyHash = await hmacString(bufferToHex(masterKeyBuffer), user_id);

  const data = {
    master_key: {
      type: 'passkey',
      ct: wrappedMasterKey,
      salt,
      hash: bufferToBase64(masterKeyHash, { url: true }),
      id: passkeyId
    }
  };

  // derive auth_hash from existing password and auth_salt
  const authHash = await deriveAuthHashFromPassword(password, pwd_mkey.auth_salt);

  await addE2EEKey(
    { data },
    {
      extraHeaders: {
        [E2EE_AUTH_HASH_HEADER]: authHash,
        ...formatCredentialHeaders(credential)
      }
    }
  );

  return data.master_key;
}

export async function addE2EEKeyWithPasskey_PreAuthenticated(user_id: string, password: string, pwd_mkey: MasterKey, masterKey: CryptoKey, passkeyId: string, prfSecretBuffer: BufferSource) {
  const salt = generateRandomBuffer();
  const wrappingKey = await deriveWrappingKeyFromBuffer(prfSecretBuffer, salt);

  // wrapped master key
  const wrappedMasterKey = await wrapKey('raw', wrappingKey, masterKey);

  // create master key hash
  const masterKeyBuffer = await exportSymmetricKey(masterKey, { toBuffer: true });
  const masterKeyHash = await hmacString(bufferToHex(masterKeyBuffer), user_id);

  const data = {
    master_key: {
      type: 'passkey',
      ct: wrappedMasterKey,
      salt: bufferToBase64(salt, { url: true }),
      hash: bufferToBase64(masterKeyHash, { url: true }),
      id: passkeyId
    }
  };

  // derive auth_hash from existing password and auth_salt
  const authHash = await deriveAuthHashFromPassword(password, pwd_mkey.auth_salt);

  await addE2EEKey({ data }, { extraHeaders: { [E2EE_AUTH_HASH_HEADER]: authHash } });

  return data.master_key;
}

export async function requestAndDerivePassKeyWrappingKey(enabled_passkeys?: Passkey[], passkeyId?: string) {
  const res = await requestE2EEKeysChallenge({ ...(passkeyId && { passkey_id: passkeyId }) });
  console.log(res.data);

  const assertionOptions = res.data.assertion_opts;
  assertionOptions.challenge = base64ToBuffer(assertionOptions.challenge);

  assertionOptions.allowCredentials = assertionOptions.allowCredentials.map((item) => ({
    ...item,
    id: base64ToBuffer(item.id)
  }));

  if (!assertionOptions?.allowCredentials?.length || !assertionOptions?.extensions?.prf?.eval?.first) {
    throw new CustomError({ message: 'Configuration Failed. Please try again later.' });
  }

  assertionOptions.extensions.prf.eval.first = base64ToBuffer(assertionOptions.extensions.prf.eval.first);

  console.log(assertionOptions);
  const credential = await navigator.credentials.get({
    publicKey: assertionOptions
  });

  // Uncomment to Retrieve PRF results
  let prfSecretBuffer = credential.getClientExtensionResults()?.prf?.results?.first;

  // If the credential used is already configured, use the existing salt
  const { ct, ...passkey } = (enabled_passkeys || res.data?.enabled_passkeys).find((key) => base64ToBase64Url(key.id) === credential.id) ?? {};
  const salt = passkey?.salt ? base64ToBuffer(passkey.salt, { url: true }) : generateRandomBuffer();
  const wrappingKey = await deriveWrappingKeyFromBuffer(prfSecretBuffer, salt);

  clearBuffer(prfSecretBuffer);
  prfSecretBuffer = undefined;

  return {
    ...(passkey && { passkey }),
    salt: bufferToBase64(salt, { url: true }),
    ...(passkey && ct && { mkey: { passkey_id: passkey.id, salt: passkey.salt, ct } }),
    wrappingKey,
    credential
  };
}

export async function loadServiceKeys(service: string) {
  if (get(e2eeServiceKeys)?.service?.name !== service) {
    // try to load from session storage
    const storedServiceKeys = sessionRead(STORAGE_E2EE_SERVICE_KEYS);
    if (storedServiceKeys?.service?.name === service) {
      e2eeServiceKeys.set(storedServiceKeys);
    } else {
      const { data } = await getE2EEServiceKeys({ service });

      if (!data.service) {
        // service key not yet configured
        const { publicKey } = await generateX25519KeyPair();
        const res = await addE2EEServiceKey(
          {
            service,
            data: {
              pubkey: await exportPublicKey(publicKey)
            }
          },
          {
            extraHeaders: {}
          }
        );

        // override service
        Object.assign(data, res.data);
      }

      // load service key
      const keysToStore = {
        acc: data.acc,
        service: {
          name: service,
          ...data.service
        },
        srch: data.srch
      };
      e2eeServiceKeys.set(keysToStore);
      sessionWrite(STORAGE_E2EE_SERVICE_KEYS, keysToStore);
    }
  }
}
