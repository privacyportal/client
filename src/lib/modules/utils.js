const UUID_REGEX = new RegExp('^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$');
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatDate(timestamp, options) {
  if (timestamp === undefined && options?.default) return options.default;
  return new Date(timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: options?.dateOnly ? undefined : 'short'
  });
}

export function formatDuration(duration, options) {
  const { daysOnly, raw } = { ...options };

  let result = [];
  const isFuture = duration >= 0;
  duration = Math.abs(duration);

  if (!daysOnly) {
    // calculate years
    const years = Math.floor(duration / YEAR);
    duration %= YEAR;
    if (years) result.push(years > 1 ? `${years} years` : `1 year`);

    if (result.length === 0) {
      // calculate months
      const months = Math.floor(duration / MONTH);
      duration %= MONTH;
      if (months) result.push(months > 1 ? `${months} months` : `1 month`);
    }
  }

  if (result.length === 0) {
    const days = Math.floor(duration / DAY);
    duration %= DAY;
    if (days) result.push(days > 1 ? `${days} days` : `1 day`);
  }

  if (result.length === 0) {
    const hours = Math.floor(duration / HOUR);
    duration %= HOUR;
    if (hours) result.push(hours > 1 ? `${hours} hours` : `1 hour`);
  }

  if (result.length === 0) {
    const minutes = Math.floor(duration / MINUTE);
    duration %= HOUR;
    if (minutes) result.push(minutes > 1 ? `${minutes} minutes` : `1 minute`);
  }

  if (result.length === 0) {
    const seconds = Math.floor(duration / SECOND);
    duration %= SECOND;
    if (seconds) result.push('less than a minute');
  }

  if (raw) return result.join(' ');
  return isFuture ? `in ${result.join(' ')}` : `${result.join(' ')} ago`;
}

export function replaceStateWithQuery(values) {
  const url = new URL(window.location.toString());
  for (let [k, v] of Object.entries(values)) {
    if (!v) {
      url.searchParams.delete(k);
    } else {
      url.searchParams.set(encodeURIComponent(k), encodeURIComponent(v));
    }
  }
  history.replaceState({}, '', url);
}

export function convertToHostname(url) {
  let result = null;
  if (url) {
    try {
      if (!url.startsWith('http')) url = `https://${url}`;
      if (!url.includes('.')) url = `${url}.com`;
      const { hostname } = new URL(url);
      result = hostname.replace(/^(?:www|app|forums?|blogs?)\./, '');
    } catch {
      // do nothing
    }
  }
  return result;
}

export function writeValueToClipboard(value) {
  setTimeout(async () => await navigator.clipboard.writeText(value));
}

export function getMonthStartTS() {
  let d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export function addMonthsToTimestamp(timestamp, amount = 1) {
  const d = new Date(timestamp);
  d.setUTCMonth(d.getUTCMonth() + amount);
  return d.getTime();
}

export function getMonthNameFromTS(timestamp, style = 'short') {
  const date = new Date(timestamp);
  return date.toLocaleString('default', { month: style });
}

export function timestampToSecs(timestamp) {
  return Math.floor(timestamp / 1000);
}

export function getSizeUnit(size) {
  if (size > 1073741824) return { label: 'GB', divider: 1073741824 };
  if (size > 1048576) return { label: 'MB', divider: 1048576 };
  return { label: 'KB', divider: 1024 };
}

export function fmtFloat(value, decimals = 1) {
  return parseFloat(value.toFixed(decimals));
}

export function fmtPrice(value, decimals = 0, unit = '€') {
  return `${unit}${(value / 100.0).toFixed(decimals)}`;
}

export function fmtSize(value, decimals = 0) {
  const { label, divider } = getSizeUnit(value);
  return `${(value / divider).toFixed(decimals)}${label}`;
}

export function fmtCount(count) {
  if (count > 1e9) return `${fmtFloat(count / 1e9)}G`;
  if (count > 1e6) return `${fmtFloat(count / 1e6)}M`;
  if (count > 1e3) return `${fmtFloat(count / 1e3)}K`;
  return count;
}

export function capitalize(input) {
  return input?.[0].toUpperCase() + input?.slice(1);
}

export function isValidUUID(input) {
  return UUID_REGEX.test(input);
}

export function randomFourDigitsCode() {
  const min = 0;
  const max = 9999;

  // Get a random number in the range of 0 to the largest possible integer (2^53 - 1)
  const randomBuffer = new Uint32Array(1);
  let randomNumber = window.crypto.getRandomValues(randomBuffer)[0];

  // Now map this number to our desired range, avoiding modulo bias
  const maxRange = 2 ** 32; // Since we're using Uint32Array, max possible value is 2^32 - 1
  const remainder = maxRange % max;

  // Keep trying until we get a number that isn't in the biased range
  for (let attempts = 0; attempts < 20; attempts++) {
    randomNumber = window.crypto.getRandomValues(randomBuffer)[0];
    if (randomNumber > remainder) {
      // we found a safe number
      return (min + (randomNumber % max)).toString().padStart(4, '0');
    }
  }

  // it's very unlikely to reach this point given for a 4 digit max compared to the 32 bits number
  return (min + (randomNumber % max)).toString().padStart(4, '0');
}

export function typedArrayToArrayBuffer(uintXArray) {
  if (uintXArray.buffer.byteLength === uintXArray.byteLength) return uintXArray.buffer;
  return uintXArray.buffer.slice(uintXArray.byteOffset, uintXArray.byteLength + uintXArray.byteOffset);
}