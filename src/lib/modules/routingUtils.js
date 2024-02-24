import { goto } from '$app/navigation';

export function gotoExt(path) {
  return () => {
    window.location.href = path;
  };
}

export function gotoPage(path) {
  return () => {
    goto(path, { replaceState: true });
  };
}
