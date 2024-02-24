export function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function read(key) {
  const value = localStorage.getItem(key);
  if (value) return JSON.parse(value);
  return null;
}

export function clear() {
  localStorage.clear();
  sessionStorage.clear();
}

export function storeKeyFromObject(key, object) {
  if (key in object) {
    write(key, object[key]);
    return true;
  }
  return false;
}

export function sessionWrite(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function sessionRead(key) {
  const value = sessionStorage.getItem(key);
  if (value) return JSON.parse(value);
  return null;
}
