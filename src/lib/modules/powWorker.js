import { parseJwtBody } from './auth';

function buf2hex(arrayBuffer) {
  return [...new Uint8Array(arrayBuffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function makePOW(token) {
  let pow;
  try {
    const { algorithm, challenge, check } = parseJwtBody(token);

    const powCheck = new RegExp(check);

    pow = 0;
    const encoder = new TextEncoder();

    let timer = setTimeout(() => {
      pow = undefined;
    }, 5000);

    while (true) {
      const digest = buf2hex(await self.crypto.subtle.digest(algorithm, encoder.encode(`${challenge}${pow}`)));

      if (powCheck.test(digest)) {
        clearTimeout(timer);
        break;
      }

      if (pow === undefined) break;
      pow++;
    }
  } catch {
    // pow failed
    pow = undefined;
  }

  return { pow, token };
}

self.addEventListener(
  'message',
  async function (event) {
    try {
      console.log(event.data);
      self.postMessage({
        pow_data: await makePOW(event.data)
      });
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
