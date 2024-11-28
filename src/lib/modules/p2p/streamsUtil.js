import { MAX_MESSAGE_SIZE } from "./libp2pUtil";

export function createFixedSizeMessageTransform(messageSize = MAX_MESSAGE_SIZE) {
  let buffer = new Uint8Array(0);

  return new TransformStream({
    transform: (chunk, controller) => {
      // Ensure chunk is a Uint8Array
      if (!(chunk instanceof Uint8Array)) {
        chunk = new Uint8Array(chunk);
      }

      // Combine the incoming chunk with any existing buffered data
      const newBuffer = new Uint8Array(buffer.length + chunk.length);
      newBuffer.set(buffer);
      newBuffer.set(chunk, buffer.length);

      buffer = newBuffer;

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
