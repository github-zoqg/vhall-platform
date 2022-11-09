export function setLocal(key, value) {
  value = value || '';
  localStorage.setItem(`media-check.${key}`, value);
}

export function getLocal(key) {
  return localStorage.getItem(`media-check.${key}`) || '';
}
