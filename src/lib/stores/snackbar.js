import { DEFAULT_ERROR_MESSAGE } from '$lib/modules/errors';
import { writable } from 'svelte/store';

export const messages = writable([]);

export function showSnackbar(params) {
  const isDefaultError = params.text === DEFAULT_ERROR_MESSAGE;
  const id = window.crypto.randomUUID();

  messages.update((arr) => {
    // do not display default error unless it's the only error
    if (isDefaultError && arr.length > 0) return arr;
    // do not display the same message more than once
    if (arr.some((item) => item.text === params.text)) return arr;
    return [...arr, { ...params, id }];
  });

  setTimeout(() => closeSnackbar(id), params?.ttl || 5000);
}

export function closeSnackbar(id) {
  messages.update((arr) => arr.filter((o) => o.id != id));
}

export function closeAllSnackbars() {
  messages.set([]);
}
