/**
 * pc观看端默认白色主题
 */

/* 字体颜色
--------------------- */
const color_text_primary = '#FFFFFF';
const color_text_grey = '#262626';
const color_text_red = '#fb2626';
const color_text_custom = '#fb2626';
const color_text_custom_sub = '#ffd1c9';
const color_text_black = 'rgba(38, 38, 38, 1)';
const color_text_1 = 'rgba(0, 0, 0, 1)';
const color_text_regular = 'rgba(0, 0, 0, 0.65)';
const color_text_secondary = 'rgba(0, 0, 0, 0.45)';
const color_text_2 = 'rgba(255, 255, 255, 0.45)';
const color_text_placeholder = 'rgba(0, 0, 0, 0.35)';
const color_text_disabled = 'rgba(0, 0, 0, 0.25)';
const color_text_link = '#3562fa';

/* 背景颜色
--------------------- */
const color_background_0 = '#1a1a1a';
const color_background_1 = '#2a2a2a';
const color_background_2 = 'rgba(0, 0, 0, 0.08)';
const color_background_3 = '#C0C4CC';
const color_background_4 = 'transparent';
const color_background_5 = 'rgba(0, 0, 0, 0.06)';
const color_background_6 = 'rgba(0, 0, 0, 0.04)';
const color_background_7 = '#f5f5f5';
const color_background_8 = '#f7f7f7';

export default {
  '--theme-background-color': color_background_0,
  // 头部组件 VmpHeaderWatch
  '--header-background-color-base': color_background_4,
  '--header-font-color-primary': color_text_primary,
  '--header-font-color-regular': color_text_secondary,
  '--header-font-color-link': color_text_link,
  '--header-font-color-main': color_text_1,
  '--header-tab-bg-color-hover': color_background_8,
  '--header-tab-font-color-hover': color_background_0,
  '--header-tab-item-font-color': color_text_custom,
  '--header-tab-item-dropdown-color': color_text_primary,
  //菜单组件
  '--tab-menu-bg-border': color_background_7,
  '--tab-bg-color-hover': color_background_8,
  // 聊天组件 VmpChat
  '--chat-font-color-msg-nickname': color_text_secondary,
  '--chat-font-color-msg-text': color_text_black,
  '--chat-font-color-msg-time': color_text_primary,
  '--chat-background-color-base': color_text_primary,
  '--chat-background-color-secondary': color_background_2,
  '--chat-background-color-input': color_background_5,
  '--chat-font-color-input': color_text_grey,
  '--chat-font-color-filter': color_text_regular,
  '--chat-font-color-filter-checked': color_text_grey,
  '--chat-bg-color-filter-checked': color_background_8,
  '--chat-bg-color-checkbox': color_text_disabled,
  '--chat-bg-color-checkbox-checked': color_text_custom,
  //主题色
  '--theme-color': color_text_custom,
  '--theme-color-sub': color_text_custom_sub,
  //footer
  '--footer-color-font': color_text_secondary,
  //菜单-内容
  //简介
  '--theme-tab-content-intro-font': color_text_grey,
  //商品
  '--theme-tab-content-good-name-font': color_text_grey,
  '--theme-tab-content-good-describe-font': color_text_regular,
  '--theme-tab-content-good-discountPrice-font': color_text_secondary,
  '--theme-tab-content-good-priceTag-bg': '#fff2f0',
  '--theme-tab-content-good-price-font': color_text_grey,
  '--theme-tab-content-good-buy-font': color_text_regular,
  '--theme-tab-content-good-buyBorder-font': color_text_secondary,
  '--theme-tab-content-good-bg': color_text_primary,
  '--theme-tab-content-good-hover-bg': color_background_6,
  '--theme-tab-content-good-split-bg': color_background_5,
  //排行榜
  '--theme-tab-content-rank-title-font': color_text_grey,
  '--theme-tab-content-rank-rule-font': color_text_regular,
  '--theme-tab-content-rank-rule-content-font': color_text_grey,
  '--theme-tab-content-rank-rule-content-bg': color_background_7,
  '--theme-tab-content-rank-content-font': color_text_grey,
  '--theme-tab-content-rank-content-invite-font': color_text_secondary,
  '--theme-tab-content-rank-content-invite-btn-font': color_text_primary,
  '--theme-tab-content-rank-content-invite-btn-border': color_text_regular,
  '--theme-tab-content-rank-split-bg': color_background_5,
  '--theme-tab-content-rank-finish-font': color_text_disabled,
  '--theme-tab-content-rank-noData-font': color_text_secondary,
  //图文组件
  '--theme-tab-content-word-font': color_text_grey,
  //直播
  '--theme-tab-content-live-title-font': color_text_grey,
  '--theme-tab-content-live-info-font': color_text_regular,
  '--theme-tab-content-live-card-bg': color_text_primary,
  //专题
  '--theme-tab-content-project-title-font': color_text_grey,
  '--theme-tab-content-project-info-font': color_text_regular,
  '--theme-tab-content-project-card-bg': color_text_primary,
  //自定义菜单
  '--theme-tab-content-title-font': color_text_grey,
  //分割线
  '--theme-tab-content-split-bg': color_background_5,
  //推荐
  '--theme-tab-content-recommend-title-font': color_text_grey,
  '--theme-tab-content-recommend-buy-font': color_text_grey,
  '--theme-tab-content-recommend-buy-border': color_text_secondary,
  '--theme-tab-content-recommend-bg': color_text_primary,
  '--theme-tab-content-recommend-hover-bg': color_background_6,
  '--theme-tab-content-recommend-border': color_background_5,
  '--theme-tab-content-recommend-noData-font': color_text_disabled,
  //文档
  '--theme-tab-content-doc-font': color_text_secondary,
  //问答
  '--theme-tab-content-qa-text-font': color_text_secondary,
  '--theme-tab-content-qa-replyText-font': color_text_grey,
  '--theme-tab-content-qa-replyText-bg': color_background_5,
  '--theme-tab-content-qa-qaLabel-font': '#fc9600',
  '--theme-tab-content-qa-onlyMe-font': color_text_secondary,
  //私聊
  '--theme-tab-content-private-name-font': color_text_secondary,
  '--theme-tab-content-private-content-font': color_text_grey,
  '--theme-tab-content-private-time-font': color_text_secondary,
  //组件
  '--theme-component-subscribe': color_text_red,
  '--theme-component-subscribe-text': 'rgba(89, 89, 89, 1)',
  '--theme-component-subscribe-num': 'rgba(38, 38, 38, 1)',
  //报名表单
  '--theme-component-sign-up-tab-font': color_text_regular,
  '--theme-component-sign-up-tab-bg': color_background_6
};
