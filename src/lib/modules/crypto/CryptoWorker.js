import { decryptEncapsulatedData, encryptAndEncapsulateData, generateSearchHash } from '@privacyportal/client-e2ee';

let masterKey, wrappingKey, serviceKeys;

function normalizeText(text) {
  return text.toLowerCase().normalize('NFKC');
}

async function handleInit(params) {
  masterKey = params.masterKey;
  wrappingKey = params.wrappingKey;
  serviceKeys = params.serviceKeys;
}

async function handleEncrypt({ input }) {
  return await encryptAndEncapsulateData(serviceKeys.acc.id, serviceKeys.service.id, wrappingKey, input);
}

async function handleSearchHash({ input }) {
  return await generateSearchHash(serviceKeys.service.id, masterKey, serviceKeys.srch.sk, normalizeText(input));
}

async function handleDecrypt({ item }) {
  if (item?.ct) {
    const { decrypted, foreign } = await decryptEncapsulatedData(wrappingKey, serviceKeys.acc.sk, masterKey, item.ct);
    Object.assign(item, JSON.parse(decrypted), { foreign });
  }
  return item;
}

self.addEventListener(
  'message',
  async function (event) {
    try {
      console.log(event.data);
      let result, error;
      try {
        switch (event.data?.action) {
          case 'init': {
            result = await handleInit(event.data?.params);
            break;
          }
          case 'encrypt': {
            result = await handleEncrypt(event.data?.params);
            break;
          }
          case 'decrypt': {
            result = await handleDecrypt(event.data?.params);
            break;
          }
          case 'srch_hash': {
            result = await handleSearchHash(event.data?.params);
            break;
          }
          default:
            throw new Error('Unsupported action.');
        }
      } catch (err) {
        error = err;
      }
      self.postMessage({ id: event.data.id, ...(result && { result }), ...(error && { error }) });
    } catch (error) {
      // // Uncomment to debug
      // debugger;

      // break out of the promise and bubble up error
      setTimeout(function () {
        throw 'error';
      });
    }
  },
  false
);
