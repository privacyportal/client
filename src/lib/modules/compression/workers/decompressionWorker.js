import { typedArrayToArrayBuffer } from '$lib/modules/utils';
import { Gunzip } from 'fflate';

const decompressor = new Gunzip();
decompressor.ondata = (chunk, final) => {
  const chunkArrayBuffer = typedArrayToArrayBuffer(chunk)
  self.postMessage({ chunk: chunkArrayBuffer, final }, [chunkArrayBuffer]);
}

self.onmessage = function (event) {
  try {
    decompressor.push(new Uint8Array(event.data.chunk), event.data.final);
  } catch (error) {
    // Uncomment to debug
    // debugger;

    // break out of the promise and bubble up error
    setTimeout(function () {
      throw 'error';
    });
  }
}