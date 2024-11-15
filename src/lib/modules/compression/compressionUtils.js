import { typedArrayToArrayBuffer } from "../utils";

// This compressor works with a the compressionWorker
class AsyncAbstractCompressor {
  constructor() {
    this.worker;
    this.next;
  }

  set onData(onDataCb) {
    this.worker.onmessage = (event) => {
      onDataCb(new Uint8Array(event.data.chunk), event.data.final, this.next);
    }
  }

  set onError(onErrorCb) {
    this.worker.onerror = (_) => {
      onErrorCb(new Error('Worker task failed.'));
    }
  }

  push(chunk, next=undefined) {
    this.next = next;
    const chunkArrayBuffer = typedArrayToArrayBuffer(chunk);
    this.worker.postMessage({ chunk: chunkArrayBuffer, final: next !== undefined }, [chunkArrayBuffer]);
  }

  terminate() {
    this.worker.terminate();
  }
}

class AsyncCompressor extends AsyncAbstractCompressor {
  constructor() {
    super();
    this.worker = new Worker(new URL('./workers/compressionWorker.js', import.meta.url), { type: 'module' });
  }
}

class AsyncDecompressor extends AsyncAbstractCompressor {
  constructor() {
    super();
    this.worker = new Worker(new URL('./workers/decompressionWorker.js', import.meta.url), { type: 'module' });
  }
}

function fflateCommonTransformStream(asyncCompressor) {
  return new TransformStream({
    start(controller) {
      asyncCompressor.onData = (chunk, final, next) => {
        // console.log(`[${asyncCompressor.constructor.name}][ondata][${chunk.byteLength}]`, chunk, final);
        controller.enqueue(chunk);
        if (final) {
          asyncCompressor.terminate();
          next();
        }
      }
      asyncCompressor.onError = (err) => {
        controller.error(err);
        asyncCompressor.terminate();
      }
    },
    transform(chunk, controller) {
      // console.log(`[${asyncCompressor.constructor.name}][transform][${chunk.byteLength}]`, chunk);
      try {
        asyncCompressor.push(chunk);
      } catch (err) {
        controller.error(err);
      }
    },
    async flush(controller) {
      await new Promise(resolve => {
        // console.log(`[${asyncCompressor.constructor.name}][flush]`);
        try {
          asyncCompressor.push(new Uint8Array(0), resolve);
        } catch (err) {
          controller.error(err);
        }
      });
      controller.terminate();
    }
  }, new CountQueuingStrategy({ highWaterMark: 1 }), new CountQueuingStrategy({ highWaterMark: 1 }));
}

export function fflateAsyncCompressionStream() {
  return fflateCommonTransformStream(
    new AsyncCompressor()
  )
}

export function fflateAsyncDecompressionStream() {
  return fflateCommonTransformStream(
    new AsyncDecompressor()
  )
}

export async function createCompressionStream() {
  if ('CompressionStream' in window) return new CompressionStream('gzip');

  // fallback to fflate
  return fflateAsyncCompressionStream();
}

export async function createDecompressionStream() {
  if ('DecompressionStream' in window) return new DecompressionStream('gzip');

  // fallback to fflate
  return fflateAsyncDecompressionStream();
}