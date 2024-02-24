import { derived, writable } from 'svelte/store';

export const relayAccounts = writable([]);
export const activeAccountsById = writable([]);
export const fwdToFilters = derived(activeAccountsById, ($activeAccountsById) => {
  return [
    { value: undefined, text: 'All Personal Addresses' },
    ...Object.keys($activeAccountsById).map((acct_id) => ({
      value: acct_id,
      text: $activeAccountsById[acct_id].email
    }))
  ];
});
