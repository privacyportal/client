import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

let isInitialized = false;

function handleInit() {
  if (isInitialized) return;

  const options = {
    translations: zxcvbnEnPackage.translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary
    }
  };

  zxcvbnOptions.setOptions(options);
  isInitialized = true;
}

async function handleCheck({ password }) {
  if (!isInitialized) handleInit();
  return zxcvbn(password);
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
            result = handleInit();
            break;
          }
          case 'check': {
            result = await handleCheck(event.data?.params);
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
