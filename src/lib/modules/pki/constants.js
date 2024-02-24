export const SIGNING_ALGORITHMS = {
  sha256WithRSAEncryption: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048
  }
};
