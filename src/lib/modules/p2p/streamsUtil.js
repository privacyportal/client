import { Uint8ArrayList } from 'uint8arraylist';
import { CMD_TIMEOUT, MAX_MESSAGE_SIZE } from './libp2pUtil';

export function createFixedSizeMessageTransform(messageSize = MAX_MESSAGE_SIZE, options) {
  const { startByteIndex } = { startByteIndex: 0, ...options };
  let remainingBytesToSkip = startByteIndex;
  let buffer = new Uint8Array(0);

  return new TransformStream({
    transform: (chunk, controller) => {
      // Ensure chunk is a Uint8Array
      if (!(chunk instanceof Uint8Array)) {
        chunk = new Uint8Array(chunk);
      }

      if (remainingBytesToSkip > 0) {
        if (chunk.length <= remainingBytesToSkip) {
          remainingBytesToSkip -= chunk.length;
          return;
        } else {
          const newBuffer = new Uint8Array(chunk.length - remainingBytesToSkip);
          newBuffer.set(chunk.slice(remainingBytesToSkip));
          buffer = newBuffer;
          remainingBytesToSkip = 0;
        }
      } else {
        // Combine the incoming chunk with any existing buffered data
        const newBuffer = new Uint8Array(buffer.length + chunk.length);
        newBuffer.set(buffer);
        newBuffer.set(chunk, buffer.length);
        buffer = newBuffer;
      }

      // Process the buffer into fixed-size messages
      while (buffer.length >= messageSize) {
        const message = buffer.slice(0, messageSize);
        controller.enqueue(message);
        buffer = buffer.slice(messageSize);
      }
    },
    flush: (controller) => {
      // Handle any remaining data
      if (buffer.length > 0) {
        controller.enqueue(buffer);
      }
    }
  });
}

export function createAbortSignal(stream, timeout) {
  const signal = AbortSignal.timeout(timeout ?? CMD_TIMEOUT);
  signal.addEventListener('abort', () => {
    stream?.abort(new Error('command timeout'));
  });
  return signal;
}

export async function writeChunkToWebrtcStream(webrtcStream, chunk, timeout = undefined) {
  // Keep trying to send until successful
  while (webrtcStream.writeStatus === 'writable') {
    // Try to send the data immediately
    const sent = webrtcStream.send(chunk);

    if (sent) {
      return; // Successfully sent, we're done
    }

    // If send returned false, wait for drain event then try again
    try {
      await webrtcStream.onDrain({ signal: createAbortSignal(webrtcStream, timeout) });
      // After drain, the loop continues and we retry the same chunk
    } catch (error) {
      // If onDrain rejects, the stream was closed or reset
      throw new Error(`Failed to write: ${error.message}`);
    }
  }
  throw new Error(`Failed to write. Stream is closed for writing.`);
}

export function toWritableStream(webrtcStream) {
  let closeError = null;

  const closeHandler = (evt) => {
    closeError = evt.error || new Error('Stream closed unexpectedly');
  };

  webrtcStream.addEventListener('close', closeHandler);

  return new WritableStream({
    async write(chunk, controller) {
      if (closeError) {
        throw closeError || new Error('Cannot write to closed stream');
      }

      const signal = new AbortController();

      await Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => {
            signal.abort();
            reject(new Error('write timeout'));
          }, 30000)
        ),
        new Promise((resolve, reject) => {
          // Keep retrying the same chunk until it's sent
          const tryToSend = () => {
            if (signal.aborted) return;
            if (closeError) return reject(closeError || new Error('Stream closed during write'));

            try {
              const sent = webrtcStream.send(chunk);
              if (sent) {
                return resolve(); // Success - chunk was sent
              }

              // Buffer full - wait for drain then retry the same chunk
              webrtcStream.onDrain({ signal: createAbortSignal(webrtcStream, 5000) }).then(tryToSend);
            } catch (err) {
              reject(closeError || err);
            }
          };

          tryToSend();
        })
      ]).catch((err) => {
        controller.error(err);
        webrtcStream.abort(err);
      });
    },

    async close() {
      if (closeError) {
        if (closeError) throw closeError;
        return;
      }

      try {
        await webrtcStream.close();
      } catch (error) {
        closeError = error;
        throw error;
      } finally {
        webrtcStream.removeEventListener('close', closeHandler);
      }
    },

    abort(reason) {
      if (closeError) return;
      closeError = reason instanceof Error ? reason : new Error(String(reason));
      webrtcStream.abort(closeError);
      webrtcStream.removeEventListener('close', closeHandler);
    }
  });
}

export async function readMessageFromWebrtcStream(webrtcStream, bytes) {
  return new Promise((resolve, reject) => {
    let cleanup;

    const readBuffer = new Uint8ArrayList();
    let timeout;

    const closeHandler = (evt) => {
      cleanup();
      reject(evt.error || new Error('stream interrupted.'));
    };

    const messageHandler = (evt) => {
      clearTimeout(timeout);
      readBuffer.append(evt.data.subarray());
      if (readBuffer.byteLength >= bytes) {
        cleanup();
        resolve(readBuffer.sublist(0, bytes));
      } else {
        timeout = setTimeout(() => closeHandler(new Error('Timeout')), CMD_TIMEOUT);
      }
    };

    cleanup = () => {
      webrtcStream.removeEventListener('message', messageHandler);
      webrtcStream.removeEventListener('close', closeHandler);
      webrtcStream.removeEventListener('remoteCloseWrite', closeHandler);
      clearTimeout(timeout);
    };

    webrtcStream.addEventListener('message', messageHandler);
    webrtcStream.removeEventListener('close', closeHandler);
    webrtcStream.removeEventListener('remoteCloseWrite', closeHandler);
    timeout = setTimeout(() => closeHandler(new Error('Timeout')), CMD_TIMEOUT);
  });
}

export function toReadableStream(webrtcStream) {
  let isStreamClosed = false;

  return new ReadableStream({
    start(controller) {
      const messageHandler = (evt) => {
        if (isStreamClosed) return;

        try {
          controller.enqueue(evt.data);
        } catch (error) {
          console.error('Error enqueueing data:', error);
          controller.error(error);
          cleanup();
        }
      };

      const closeHandler = (evt) => {
        if (isStreamClosed) return;
        isStreamClosed = true;

        if (evt.error) {
          controller.error(evt.error);
        } else {
          controller.close();
        }
        cleanup();
      };

      const remoteCloseWriteHandler = () => {
        if (isStreamClosed) return;
        isStreamClosed = true;

        controller.close();
        cleanup();
      };

      const cleanup = () => {
        webrtcStream.removeEventListener('message', messageHandler);
        webrtcStream.removeEventListener('close', closeHandler);
        webrtcStream.removeEventListener('remoteCloseWrite', remoteCloseWriteHandler);
      };

      // Store cleanup for cancel method
      this.cleanup = cleanup;

      // Add event listeners
      webrtcStream.addEventListener('message', messageHandler);
      webrtcStream.addEventListener('close', closeHandler);
      webrtcStream.addEventListener('remoteCloseWrite', remoteCloseWriteHandler);
    },

    cancel() {
      isStreamClosed = true;
      if (this.cleanup) {
        this.cleanup();
      }
    }
  });
}
