export function parseJwtBody(token) {
  const body = token.split('.', 3)[1];
  const bodyObj = JSON.parse(atob(body));
  console.log('JWT', bodyObj);
  return {
    ...bodyObj
  };
}

export function bufferToBase64(buffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

export function base64ToBuffer(string) {
  return new Uint8Array(
    atob(string)
      .split('')
      .map((c) => c.charCodeAt(0))
  ).buffer;
}

export function bufferToUUID(buffer) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
    .padStart(32, '0')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

export function base64ToBase64Url(input) {
  return input.replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '');
}

export function base64UrlToBase64(input) {
  return input.replace(/\-/g, '+').replace(/_/g, '/');
}

export function stringToBase64(input, { url } = { url: false }) {
  const base64Value = btoa(input);
  return url ? base64ToBase64Url(base64Value) : base64Value;
}

// works for both base64 and base64url
export function base64ToString(input) {
  return atob(base64UrlToBase64(input));
}
