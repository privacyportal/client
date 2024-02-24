import { derived, writable } from 'svelte/store';

export const profiles = writable([]);
export const defaultProfile = derived(profiles, ($profiles) => ($profiles || []).find((p) => p.enabled));

export const smimeProfileToExport = writable();
export const smimeProfiles = writable([]);
export const issueCertLoading = writable(false);

export const certificateState = writable({});

export function addToCertificateState(id, obj) {
  certificateState.update((exports) => {
    exports[id] = Object.assign(exports[id] || {}, obj);
    return exports;
  });
}

export const pgpProfiles = writable([]);
export const isCreatingPGPProfile = writable(false);
