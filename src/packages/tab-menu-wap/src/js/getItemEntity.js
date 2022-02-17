const typeMap = new Map([
  [1, 'comCustomMenuWap'], // 自定义
  [2, 'comDocWap'], // 文档
  [3, 'comChatWap'], // 聊天
  [4, 'comIntroWap'], //简介
  [5, 'comGoodSaasWap'], //商品
  [6, 'comRecommendWap'], //广告、推荐
  [7, 'comChapter'] // 章节
]);

export function getItemEntity({
  type = 2,
  id = '', // MENU ID
  name,
  payload = {},
  status = '1',
  showIcon = false
}) {
  const cuid = typeMap.get(type);
  const visible = status == 1 || status == 3 ? true : false;

  return {
    type,
    cuid,
    id,
    contentId: id, // 等同于 id
    text: name,
    payload,
    status,
    visible,
    showIcon
  };
}
