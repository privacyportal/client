import { CONNECTION_STATUS } from '$lib/stores/pdfPreview';
import { byteStream } from 'it-byte-stream';
import { createDecompressionStream } from '../compression/compressionUtils';
import { createFile } from '../export';
import { decodeData, encodeData } from './libp2pUtil';

const CMD_TIMEOUT = 30000;
export const START_BYTE_INDEX_SIZE = 30;

export function encodeStartByteIndex(startByteIndex) {
  return encodeData(Number(startByteIndex).toString(16).padStart(START_BYTE_INDEX_SIZE, '0'));
}

export function decodeStartByteIndex(bytes) {
  return Number(`0x${decodeData(bytes)}`);
}

export async function handleFileTransferProtocol({ node, peerAddress, expectedSize, connectionStatus, fileTransferProgress = undefined }) {
  return new Promise(async (resolve, reject) => {
    try {
      let stream;
      const data = [];
      let bytesReceived = 0;
      let size = 0;
      let retries = 10;

      const decompressionStream = await createDecompressionStream();

      const compressedReadable = new ReadableStream({
        async start(controller) {
          while (bytesReceived < expectedSize) {
            try {
              console.log('dialProtocol:', peerAddress.toString());
              connectionStatus.set(CONNECTION_STATUS[1]);
              stream = await node.dialProtocol(peerAddress, [bytesReceived ? '/file-transfer-continue/1.0.0' : '/file-transfer/1.0.0'], { runOnLimitedConnection: false });
              connectionStatus.set(CONNECTION_STATUS[2]);

              if (bytesReceived) {
                const signal = AbortSignal.timeout(CMD_TIMEOUT);
                signal.addEventListener('abort', () => {
                  stream?.abort(new Error('command timeout'));
                });
                // send the starting byte
                await byteStream(stream).write(encodeStartByteIndex(bytesReceived), { signal });
              }

              for await (const chunk of stream.source) {
                const bytes = chunk.subarray();
                controller.enqueue(bytes);
                bytesReceived += bytes.byteLength;
              }

              // Close the stream when done
              controller.close();
              connectionStatus.set(CONNECTION_STATUS[0]);
              return;
            } catch (err) {
              connectionStatus.set(CONNECTION_STATUS[1]);
              if (stream) {
                try {
                  await stream.abort(err);
                } catch (abortErr) {
                  console.error(abortErr);
                }
              }
              if (retries-- <= 1) {
                controller.abort(err);
                break;
              }
            }
          }
        }
      });

      const collectChunksStream = new WritableStream({
        write(chunk, controller) {
          // verify compressed data does not exceed the expectedSize (pre-compression)
          if (expectedSize !== undefined) {
            size += chunk.byteLength;
            if (size > expectedSize) {
              controller.error(new Error('File corrupted during transfer. Please try again.'));
            }
            if (fileTransferProgress) {
              fileTransferProgress.set(Math.round((100 * size) / expectedSize));
            }
          }
          // Collect each chunk in the array
          data.push(chunk);
        },
        close() {
          if (expectedSize !== undefined && size !== expectedSize) {
            throw new Error('File corrupted during transfer. Please try again.');
          }
        }
      });

      await compressedReadable
        .pipeThrough(decompressionStream)
        .pipeTo(collectChunksStream)
        .catch(async (err) => {
          console.error(err, { streamStatus: stream?.status });
          if (stream) {
            try {
              await stream.close();
            } catch (streamCloseErr) {
              console.error(streamCloseErr);
            }
          }
          throw err;
        });

      // try to close stream
      if (stream?.status === 'open') {
        await stream.close().catch(console.error);
      }

      const file = createFile({
        filename: 'ephemeral.pdf',
        data,
        type: 'application/pdf'
      });

      return resolve(file);
    } catch (err) {
      reject(err);
    }
  });
}
