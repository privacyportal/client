import { goto } from '$app/navigation';
import { parseJwtBody } from '$lib/modules/auth';
import { AT_HEADER } from '$lib/modules/constants';
import { refreshSession } from '$lib/modules/requests';
import { clear as storageClear, read as storageRead } from '$lib/modules/storage';
import { derived, writable } from 'svelte/store';
import { minuteTimer } from './timers';

export const session = writable(undefined);
export const isEnhancedProtection = derived(
  [session, minuteTimer],
  ([$session, $minuteTimer]) => $session?.access?.beta === true || ($session?.access?.beta || $session?.access?.ep || 0) >= $minuteTimer
);
export const isBetaEnhancedProtection = derived([session, minuteTimer], ([$session, $minuteTimer]) => $session?.access?.beta === true || ($session?.access?.beta || 0) >= $minuteTimer);

export const MONTHLY_PRICE = 400;

export const certificates = writable([]);
export const issueCertLoading = writable(false);

export function endSession(redirect = true) {
  storageClear();
  session.set(null);
  if (redirect) goto('/');
}

export async function loadSession() {
  const token = storageRead(AT_HEADER);
  if (token) {
    const sessionInfo = parseJwtBody(token);
    if (sessionInfo.exp > Date.now() + 3000) {
      session.set(sessionInfo);
    } else {
      // refresh session
      await refreshSession();
      // reload token
      const newToken = storageRead(AT_HEADER);
      if (token === newToken) {
        // no new token is found => continue with the existing token
        const sessionInfo = parseJwtBody(token);
        session.set(sessionInfo);
      }
    }
  } else {
    session.set(null);
  }
}

// dark mode theme
export const isDarkBrowserColorScheme = writable(false);

export const isDarkMode = derived([session, isDarkBrowserColorScheme], ([$session, $isDarkBrowserColorScheme]) => {
  if ($session?.pref?.dm === 'dark') return true;
  if ($session?.pref?.dm === 'light') return false;
  return $isDarkBrowserColorScheme;
});
