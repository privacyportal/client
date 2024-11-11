import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex as toHex } from '@noble/hashes/utils';

export default async function hashFile(file) {
  const hash = sha256.create();
  const reader = file.stream().getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value);
  }
  return toHex(hash.digest());
}
