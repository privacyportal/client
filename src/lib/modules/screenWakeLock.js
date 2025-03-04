export async function requestScreenWakeLock() {
  let lock;
  if ('wakeLock' in navigator) {
    try {
      lock = await navigator.wakeLock.request('screen');
    } catch (err) {
      // do nothing
    }
  }
  return lock;
}

export async function releaseScreenWakeLock(wakeLock) {
  if (wakeLock) {
    await wakeLock.release();
  }
  return undefined;
}
