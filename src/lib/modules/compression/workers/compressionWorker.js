import { typedArrayToArrayBuffer } from '$lib/modules/utils';
import { Deflate } from 'fflate';

const compressor = new Deflate();
compressor.ondata = function (chunk, final) {
  const chunkArrayBuffer = typedArrayToArrayBuffer(chunk);
  self.postMessage({ chunk: chunkArrayBuffer, final }, [chunkArrayBuffer]);
};

self.onmessage = function (event) {
  try {
    compressor.push(new Uint8Array(event.data.chunk), event.data.final);
  } catch (error) {
    // // Uncomment to debug
    // debugger;

    // break out of the promise and bubble up error
    setTimeout(function () {
      throw 'error';
    });
  }
};
