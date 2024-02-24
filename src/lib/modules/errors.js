import { showSnackbar } from '$lib/stores/snackbar';

export const DEFAULT_ERROR_MESSAGE = 'Unexpected Error. Please try again later.';

export class CustomError extends Error {
  constructor({ message, status, body }) {
    super(message);
    if (status) Object.defineProperty(this, 'status', { value: status });
    if (body) Object.defineProperty(this, 'body', { value: body });
  }
}

export function displayError(error, defaultError = DEFAULT_ERROR_MESSAGE) {
  console.error(error);
  if (error instanceof CustomError) {
    showSnackbar({ text: error.message, type: 'error' });
  } else {
    showSnackbar({ text: defaultError, type: 'error' });
  }
}
