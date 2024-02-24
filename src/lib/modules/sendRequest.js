import { goto } from '$app/navigation';
import { clear as storageClear, read as storageRead, storeKeyFromObject } from '$lib/modules/storage';
import { session } from '$lib/stores/account';
import { showSnackbar } from '$lib/stores/snackbar';
import FileSaver from 'file-saver';
import { base64ToBuffer, bufferToBase64, parseJwtBody } from './auth';
import { AT_HEADER, ENDPOINT, RT_HEADER } from './constants';
import { CustomError, DEFAULT_ERROR_MESSAGE } from './errors';

export default async function sendRequest(params, options = { displayError: true, fullError: false, downloadFile: undefined, accessToken: undefined }) {
  const { method, path, extraHeaders, data, rawBody } = params;

  const { displayError, fullError, handleUnauthorized, downloadFile, accessToken } = options;

  const body = rawBody ? data : JSON.stringify(data);

  const headers = {
    ...(!rawBody && { 'Content-Type': 'application/json' }),
    ...extraHeaders
  };

  if (accessToken) {
    // override token with custom token
    Object.assign(headers, {
      Authorization: `Bearer ${accessToken}`
    });
  } else {
    // use token from storage
    const AT_HEADER_VALUE = storageRead(AT_HEADER);
    const RT_HEADER_VALUE = storageRead(RT_HEADER);

    if (AT_HEADER_VALUE && RT_HEADER_VALUE) {
      Object.assign(headers, {
        Authorization: `Bearer ${AT_HEADER_VALUE}`,
        [RT_HEADER]: RT_HEADER_VALUE
      });
    }
  }

  const url = `${ENDPOINT}${path}`;
  const res = await fetch(url, {
    method,
    body,
    headers
  }).catch((_) => ({ ok: false }));

  if (!res.ok) {
    let errorMessage = { message: DEFAULT_ERROR_MESSAGE };
    if (res.status === 401) {
      const { data, message, status } = await res.json().catch((_) => {});
      if (data?.assertion_opts) {
        const assertionOptions = data.assertion_opts;
        assertionOptions.challenge = base64ToBuffer(assertionOptions.challenge);
        if (assertionOptions.allowCredentials) {
          assertionOptions.allowCredentials = assertionOptions.allowCredentials.map((item) => ({
            ...item,
            id: base64ToBuffer(item.id)
          }));
        }

        console.log(assertionOptions);

        // action requires credential => sign challenge
        const credential = await navigator.credentials.get({
          publicKey: assertionOptions
        });

        // re-send request with credential
        return await sendRequest(
          {
            method,
            path,
            ...(params?.data ? { data: params.data } : {}),
            extraHeaders: {
              credentialId: credential.id,
              rawId: bufferToBase64(credential.rawId),
              // response below
              authenticatorData: bufferToBase64(credential.response.authenticatorData),
              clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
              signature: bufferToBase64(credential.response.signature),
              userHandle: bufferToBase64(credential.response.userHandle)
            }
          },
          options
        );
      } else if (data) {
        errorMessage = { message, ...(fullError && { status, body: { data } }) };
      } else if (handleUnauthorized) {
        handleUnauthorized();
        return;
      } else {
        // Unauthorized => sign out
        session.set(null);
        storageClear();
        errorMessage = { message: 'Session timed out.' };
        goto('/');

        if (fullError) {
          // return the error info
          throw new CustomError({ message: DEFAULT_ERROR_MESSAGE, status: res.status, body: data });
        }
      }
    } else {
      try {
        const resBody = await res.json();
        errorMessage = {
          message: resBody.message,
          ...(fullError && { status: res.status, body: resBody })
        };
      } catch {
        // in case body is empty such as for HTTP 404
      }
    }

    if (displayError && !fullError) showSnackbar({ text: errorMessage.message, type: 'error' });
    throw new CustomError(errorMessage);
  }

  if (downloadFile) {
    try {
      const blob = await res.blob();
      FileSaver.saveAs(blob, downloadFile);
    } catch {
      if (displayError) showSnackbar({ text: 'File download failed. Please try again later.', type: 'error' });
    }
  } else {
    const result = {
      status: res.status,
      data: await res.json(),
      headers: Object.assign(...[...res.headers.entries()].map((entry) => ({ [entry[0]]: entry[1] })))
    };

    if (result.headers['x-pp-so']) {
      // server triggered sign out
      session.set(null);
      storageClear();
      goto('/');
      return;
    }

    // handle token updates
    // store RT token
    storeKeyFromObject(RT_HEADER, result.headers);

    // store AT token
    if (storeKeyFromObject(AT_HEADER, result.headers)) {
      const token = result.headers[AT_HEADER];
      const sessionInfo = parseJwtBody(token);
      session.set(sessionInfo);
    }

    return result;
  }
}
