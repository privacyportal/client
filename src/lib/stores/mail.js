import { writable } from 'svelte/store';

export const MAX_LABEL_LENGTH = 50;
export const MAX_NOTE_LENGTH = 300;

export const page = writable(1);
export const addresses = writable([]);
export const selectedAddress = writable(null);
export const newAddressSuggestion = writable(null);

export const relaySettings = writable(null);
