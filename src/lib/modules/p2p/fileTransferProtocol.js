import { createFile } from '../export';

export async function handleFileTransferProtocol({ node, peerAddress, expectedSize, resolveConnected }) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('dialProtocol:', peerAddress.toString());
      const stream = await node.dialProtocol(peerAddress, ['/file-transfer/1.0.0']).catch((err) => {
        console.error('Failed to create new stream:', err);
        throw err;
      });

      // notify that we're connected
      if (resolveConnected !== undefined) {
        resolveConnected();
      }

      const data = [];
      let size = 0;

      const decompressionStream = new DecompressionStream('gzip');

      const compressedReadable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream.source) {
            controller.enqueue(chunk.subarray());
          }
          // Close the stream when done
          controller.close();
        }
      });

      const collectChunksStream = new WritableStream({
        write(chunk) {
          // verify compressed data does not exceed the expectedSize (pre-compression)
          if (expectedSize !== undefined) {
            size += chunk.byteLength;
            if (size > expectedSize) {
              throw new Error('File corrupted during transfer. Please try again.');
            }
          }
          // Collect each chunk in the array
          data.push(chunk);
        }
      });

      await compressedReadable
        .pipeThrough(decompressionStream)
        .pipeTo(collectChunksStream)
        .catch((err) => {
          console.error(err);
          stream.close().catch(console.error);
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
