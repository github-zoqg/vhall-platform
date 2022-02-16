export function getItemEntity({ comp, key, text, payload, showIcon = false, visible = true }) {
  return {
    comp,
    key,
    text,
    payload,
    visible,
    showIcon
  };
}
