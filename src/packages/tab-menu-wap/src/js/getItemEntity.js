export function getItemEntity({
  cuid,
  contentId = '',
  text,
  payload,
  showIcon = false,
  visible = true
}) {
  return {
    cuid,
    contentId,
    text,
    payload,
    visible,
    showIcon
  };
}
