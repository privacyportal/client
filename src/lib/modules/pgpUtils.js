export function isPublicPGPKey(value) {
  return /^(?:\r?\n)*-{5}BEGIN PGP PUBLIC KEY BLOCK-{5}(?:\r?\n)*(?:[=a-zA-Z0-9+/]+(?:\r?\n)*)+-{5}END PGP PUBLIC KEY BLOCK-{5}(?:\r?\n)*/g.test(value);
}
