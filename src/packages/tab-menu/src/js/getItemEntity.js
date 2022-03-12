let localId = 0;

const STATUS_MAP = {
  VISIBLE: 1, //  显示
  HIDDEN: 2, // 隐藏
  LIVING: 3, // 直播或回放显示
  RECORD: 3, // 直播或回放显示
  PREDITION_FINISH_VISIBLE: 4 // 预告结束显示
};

export function getItemEntity(
  {
    type = 2,
    id = `local_${localId++}`, //menu id
    name,
    status = '1',
    visible = true
  },
  typeMap
) {
  const item = typeMap.find(config => config.type === type);
  if (!item) return false;
  item.visible = visible;
  const text = type === 1 ? name : item.text;
  let { tipsVisible = false, iconVisible = false } = item;

  // status:1 显示 status:2 隐藏 status:3 直播回放显示 status4:预告结束显示
  if (status == STATUS_MAP.HIDDEN) visible = false;

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
