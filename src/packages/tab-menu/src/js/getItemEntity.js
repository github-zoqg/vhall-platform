let localId = 0;

export function getItemEntity(
  {
    type = 2,
    id = `local_${localId++}`, //menu id
    name,
    status = '1'
  },
  typeMap
) {
  const item = typeMap.find(config => config.type === type);
  if (!item) return false;

  const text = type === 1 ? name : item.text;
  const { visible = true, tipsVisible = false, iconVisible = false } = item;

  return {
    // 原始字段
    type,
    status,
    id,
    name,

    // 新增字段
    cuid: item.cuid,
    text,
    visible,
    tipsVisible,
    iconVisible
  };
}
