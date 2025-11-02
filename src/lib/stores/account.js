import { goto } from '$app/navigation';
import { bufferToBase64, parseJwtBody } from '$lib/modules/auth';
import { AT_HEADER, ORIGIN_DOMAIN, STORAGE_E2EE_MKEY } from '$lib/modules/constants';
import CryptoTasks from '$lib/modules/crypto/CryptoTasks';
import { unwrapMasterKeyWithPassword, wrapMasterKeyWithPassword } from '$lib/modules/crypto/e2eeUtil';
import { getE2EEKeys, refreshSession } from '$lib/modules/requests';
import { clear as storageClear, read as storageRead, write as storageWrite } from '$lib/modules/storage';
import { deriveEncryptionWrappingKey, generateRandomBuffer } from '@privacyportal/client-e2ee';
import { derived, get, writable } from 'svelte/store';
import { minuteTimer } from './timers';

export const session = writable(undefined);
export const cryptoTasks = writable(undefined);
export const loadingE2EEMasterKey = writable(false);
export const e2eeMasterKey = writable(undefined);
export const e2eePwdMkey = writable(undefined);
export const e2eeServiceKeys = writable(undefined);
export const isSignedInBasic = derived(session, ($session) => $session?.email && $session?.email_verified !== false);
export const isSignedInUnlocked = derived([session, e2eeMasterKey], ([$session, $e2eeMasterKey]) => $session?.email && $session?.email_verified !== false && (!$session?.e2ee || $e2eeMasterKey));

export const isEnhancedProtection = derived(
  [session, minuteTimer],
  ([$session, $minuteTimer]) => $session?.access?.beta === true || ($session?.access?.beta || $session?.access?.ep || 0) >= $minuteTimer
);
export const isBetaEnhancedProtection = derived([session, minuteTimer], ([$session, $minuteTimer]) => $session?.access?.beta === true || ($session?.access?.beta || 0) >= $minuteTimer);

export const MONTHLY_PRICE = 300;

export const certificates = writable([]);
export const issueCertLoading = writable(false);

export function endSession(redirect = true) {
  storageClear();
  clearE2EEData();
  session.set(null);
  if (redirect) goto('/');
}

export async function loadSession() {
  const token = storageRead(AT_HEADER);
  if (token) {
    const sessionInfo = parseJwtBody(token);
    if (sessionInfo.exp * 1000 > Date.now() + 3000) {
      session.set(sessionInfo);
    } else {
      // refresh session
      await refreshSession();
      // reload token
      const newToken = storageRead(AT_HEADER);
      if (token === newToken) {
        // no new token is found => continue with the existing token
        const sessionInfo = parseJwtBody(token);
        session.set(sessionInfo);
      }
    }
  } else {
    session.set(null);
  }
}

export async function loadMasterKey($session) {
  if ($session?.e2ee) {
    let loaded = false;
    try {
      loadingE2EEMasterKey.set(true);
      const mkey = storageRead(STORAGE_E2EE_MKEY);
      if (mkey) {
        e2eeMasterKey.set(await unwrapMasterKeyWithPassword(mkey, `${ORIGIN_DOMAIN}:${$session.sub}:${$session.sc}`));
        e2eePwdMkey.set(undefined);
        loaded = true;
      }
    } finally {
      loadingE2EEMasterKey.set(false);
      if (!loaded) {
        const res = await getE2EEKeys({ type: 'pwd' });
        e2eePwdMkey.set(res.data?.[0]);
      }
    }
  }
}

export async function storeMasterKey($e2eeMasterKey) {
  const $session = get(session);
  if ($session.sub) {
    const password = `${ORIGIN_DOMAIN}:${$session.sub}:${$session.sc}`;
    const salt = generateRandomBuffer();
    storageWrite(STORAGE_E2EE_MKEY, {
      ct: await wrapMasterKeyWithPassword($e2eeMasterKey, password, salt),
      salt: bufferToBase64(salt, { url: true })
    });
  }
}

// dark mode theme
export const isDarkBrowserColorScheme = writable(false);

export const isDarkMode = derived([session, isDarkBrowserColorScheme], ([$session, $isDarkBrowserColorScheme]) => {
  if ($session?.pref?.dm === 'dark') return true;
  if ($session?.pref?.dm === 'light') return false;
  return $isDarkBrowserColorScheme;
});

export function clearE2EEData() {
  const _cryptoTasks = get(cryptoTasks);
  if (_cryptoTasks) {
    _cryptoTasks.cleanup();
  }
  cryptoTasks.set(undefined);
  e2eePwdMkey.set(undefined);
  e2eeMasterKey.set(undefined);
  e2eeServiceKeys.set(undefined);
}

export function setupCryptoTasks() {
  const $e2eeServiceKeys = get(e2eeServiceKeys);
  if (!$e2eeServiceKeys?.service?.pk || !$e2eeServiceKeys?.acc?.sk) {
    cleanupCryptoTasks();
  } else {
    const $cryptoTasks = get(cryptoTasks);
    if (!$cryptoTasks || $cryptoTasks.serviceName !== $e2eeServiceKeys.service.name) {
      const $e2eeMasterKey = get(e2eeMasterKey);
      deriveEncryptionWrappingKey($e2eeServiceKeys.service.pk, $e2eeServiceKeys.acc.sk, $e2eeMasterKey).then((wrappingKey) => {
        // initialize crypto tasks for background tasks
        cryptoTasks.set(
          new CryptoTasks({
            masterKey: $e2eeMasterKey,
            wrappingKey,
            serviceKeys: $e2eeServiceKeys
          })
        );
      });
    }
  }
}

export function cleanupCryptoTasks() {
  const $cryptoTasks = get(cryptoTasks);
  if ($cryptoTasks) {
    $cryptoTasks.cleanup();
    cryptoTasks.set(undefined);
  }
}
