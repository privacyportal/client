import { createPKCS12, id_pbeWithSHAAnd3_KeyTripleDES_CBC, X509Certificate } from '@privacyportal/client-certs';

async function makePKCS12(params) {
  const { providerName, providerURL, passphrase, iterations, privateKey, chain } = params;

  return await createPKCS12({
    password: passphrase,
    contentEncryptionAlgorithm: id_pbeWithSHAAnd3_KeyTripleDES_CBC, // supported by macOS Keychain + Windows + Openssl
    macDigestAlgorithm: 'SHA-1', // supported by macOS Keychain + Windows + Openssl
    iterations,
    providerName,
    providerURL,
    privateKey: privateKey.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\r?\n)/g, ''),
    endEntityCert: new X509Certificate(chain[0]),
    intermediateCert: chain[1] ? new X509Certificate(chain[1]) : undefined,
    rootCert: chain[2] ? new X509Certificate(chain[2]) : undefined
  });
}

self.addEventListener(
  'message',
  async function (event) {
    try {
      console.log(event.data);
      const pkcs12_data = await makePKCS12(event.data);
      self.postMessage({ pkcs12_data });
    } catch (error) {
      // // Uncomment to debug
      // debugger;

      // break out of the promise and bubble up error
      setTimeout(function () {
        throw 'error';
      });
    }
  },
  false
);
