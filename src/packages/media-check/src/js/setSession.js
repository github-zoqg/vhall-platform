export function setSession(key, value) {
  value = value || '';
  sessionStorage.setItem(`media-check.${key}`, value);
}

export function getSession(key) {
  sessionStorage.getItem(`media-check.${key}`) || '';
}
