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

export function formatDuration(duration) {
  let result = [];
  const isFuture = duration >= 0;
  duration = Math.abs(duration);

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
