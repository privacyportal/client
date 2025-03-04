import { writable } from 'svelte/store';

export const CONNECTION_STATUS = ['NOT_CONNECTED', 'CONNECTING', 'CONNECTED'];

export const connectionStatus = writable(CONNECTION_STATUS[0]);
export const fileTransferProgress = writable(0);
export const showPrintServiceDialog = writable(false);
export const printServiceDialogProgress = writable(0);
export const printServiceDialogOnCancel = writable(() => {});
