import '$lib/modules/polyfills/asyncIterableStreamPolyfill';
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex as toHex } from '@noble/hashes/utils';

export default async function hashFile(file) {
  const hash = sha256.create();
  for await (const chunk of file.stream()) {
    hash.update(chunk);
  }
  return toHex(hash.digest());
}
