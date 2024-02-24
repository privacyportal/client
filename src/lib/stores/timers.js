import { writable } from 'svelte/store';

export const minuteTimer = writable(Date.now());
setInterval(() => minuteTimer.set(Date.now()), 60_000);
