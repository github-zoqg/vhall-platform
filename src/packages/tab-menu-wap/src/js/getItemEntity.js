const typeMap = new Map([
  [1, { cuid: 'comCustomMenuWap' }], // 自定义
  [2, { cuid: 'comDocWap', text: 'menu.menu_1001' }], // 文档
  [3, { cuid: 'comChatWap', text: 'menu.menu_1002' }], // 聊天
  [4, { cuid: 'comIntroWap', text: 'menu.menu_1003' }], //简介
  [5, { cuid: 'comGoodSaasWap', text: 'menu.menu_1004' }], //商品
  [6, { cuid: 'comRecommendWap', text: 'menu.menu_1005' }], //广告、推荐
  [7, { cuid: 'comChapter', text: 'menu.menu_1013' }], // 章节
  [8, { cuid: 'comMemberListWap', text: '成员' }] // 成员
]);

export function getItemEntity({
  type = 2,
  id = '', // MENU ID
  name,
  payload = {},
  status = '1',
  tipsVisible = false,
  iconVisible = false
}) {
  const item = typeMap.get(type);

  // set Text
  // let text = '';
  // if (type === 1) {
  //   text = name;
  // } else {
  //   text = item.text; // 带翻译的
  // }
  const text = name;

  // set Visible
  // let visible = status == 1 || status == 3 ? true : false;
  let visible = true;
  // if (type === 2) visible = false;

  return {
    type,
    cuid: item.cuid,
    id,
    contentId: id, // 等同于 id
    text,
    payload,
    status,
    visible,
    tipsVisible,
    iconVisible
  };
}
