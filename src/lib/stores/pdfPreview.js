import { writable } from 'svelte/store';

export const fileTransferProgress = writable(0);
export const showPrintServiceDialog = writable(false);
export const printServiceDialogProgress = writable(0);
export const printServiceDialogOnCancel = writable(() => {});