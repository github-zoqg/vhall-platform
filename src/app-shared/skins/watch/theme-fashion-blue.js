/**
 * pc观看端时尚蓝色主题
 */

/* 字体颜色
--------------------- */
const color_text_primary = '#FFFFFF';
const color_text_grey = '#262626';
const color_text_red = '#fb2626';
const color_text_custom = '#3552ea';
const color_text_custom_sub = '#dee8ff';
const color_text_regular = 'rgba(0, 0, 0, 0.65)';
const color_text_secondary = 'rgba(0, 0, 0, 0.45)';
const color_text_placeholder = 'rgba(0, 0, 0, 0.35)';
const color_text_1 = 'rgba(0, 0, 0, 1)';
const color_text_2 = 'rgba(255, 255, 255, 0.45)';
const color_text_3 = 'rgba(0, 0, 0, 0.85)';
const color_text_black = 'rgba(38, 38, 38, 1)';
const color_text_disabled = 'rgba(0, 0, 0, 0.25)';
const color_text_link = '#3562fa';
const color_text_chat_exam = 'rgba(38, 38, 38, 1)';

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
const color_background_9 = '#f0f0f0';
const color_background_10 = 'rgba(0, 0, 0, 0.15)';
const color_background_11 = '#f0f6ff';
const color_background_12 = '#f0f5ff';
const color_background_13 = '#DEE8FF';
const color_background_14 =
  'linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0) 100%)';

export default {
  '--theme-background-color': color_background_0,
  // 头部组件 VmpHeaderWatch
  '--header-background-color-base': color_background_14,
  '--header-font-color-primary': color_text_primary,
  '--header-font-color-regular': color_text_2,
  '--header-font-color-link': color_text_link,
  '--header-font-color-rehearsal': '#FB3A32',
  '--header-font-color-main': color_text_primary,
  '--header-tab-bg-color-hover': color_background_8,
  '--header-tab-font-color-hover': color_background_0,
  '--header-tab-item-font-color': color_text_primary,
  '--header-tab-item-dropdown-color': color_text_primary,
  '--header-tab-item-dropdown-bg': color_text_primary,
  '--header-tab-item-dropdown-font': color_text_secondary,
  //菜单组件
  '--tab-menu-bg-border': color_background_13,
  '--tab-bg-color-hover': color_background_8,
  // 聊天组件 VmpChat
  '--chat-font-color-msg-nickname': color_text_secondary,
  '--chat-font-color-msg-text': color_text_black,
  '--chat-font-color-msg-time': color_text_primary,
  '--chat-background-color-base': color_background_12,
  '--chat-background-color-secondary': color_background_2,
  '--chat-background-color-input': color_background_5,
  '--chat-font-color-input': color_text_grey,
  '--chat-font-color-filter': color_text_regular,
  '--chat-font-color-filter-checked': color_text_grey,
  '--chat-bg-color-filter-checked': color_background_8,
  '--chat-bg-color-checkbox': color_text_disabled,
  '--chat-bg-color-checkbox-checked': color_text_custom,
  '--chat-scrollbar-thumb-bg': color_text_disabled,
  '--chat-font-color-reply-name': 'rgba(0, 0, 0, 0.45)',
  '--chat-exam-font-color-msg-text': color_text_chat_exam,
  // 互动工具icon
  '--footer-icon-tip-border-color': '#f0f5ff',
  //footer
  '--footer-color-font': 'rgba(0, 0, 0, 0.45)',
  //主题色
  '--theme-color': color_text_custom,
  '--theme-color-sub': color_text_custom_sub,
  '--theme-menu-bg': color_background_11,
  //分组
  '--group-name-icon-font-color': color_text_regular,
  '--group-name-font-color': color_text_secondary,
  '--group-item-hover-color': color_background_2,
  '--group-turnOff-font-color': color_text_3,
  '--group-more-font-color': color_text_3,
  '--group-more-hover-color': color_background_9,
  '--group-online-font-color': color_text_3,
  '--group-online-icon-color': color_text_3,
  '--group-refresh-font-color': color_text_secondary,
  '--group-btn-bg-color': color_background_5,
  '--group-btn-font-color': color_text_secondary,
  '--group-btn-hover-color': color_background_10,
  '--group-btn-hover-font-color': color_text_3,
  '--group-btn-active-color': color_text_disabled,
  '--group-btn-active-font-color': color_text_3,
  '--group-more-mute-font-color': color_text_3,
  '--group-search-font-color': color_text_3,
  '--group-search-bg-color': color_text_disabled,
  '--group-search-placeholder-color': color_text_secondary,
  '--group-search-input-font-color': color_text_3,
  '--group-search-input-bg-color': color_background_5,
  '--group-search-input-bg2-color': color_text_primary,
  '--group-search-confirm-font-color': color_text_3,
  //侧边栏
  '--menu-item-font-color': color_text_regular,
  '--menu-item-font-disable-color': color_text_disabled,
  '--menu-item-menu-color': color_background_12,
  //菜单-内容
  '--tab-menu-btn-color': color_text_secondary,
  '--tab-menu-btn-color-hover': color_text_regular,
  //简介
  '--theme-tab-content-intro-font': color_text_grey,
  //商品
  '--theme-tab-content-good-name-font': color_text_grey,
  '--theme-tab-content-good-describe-font': color_text_regular,
  '--theme-tab-content-good-discountPrice-font': color_text_secondary,
  '--theme-tab-content-good-priceTag-bg': '#fff2f0',
  '--theme-tab-content-good-price-font': color_text_grey,
  '--theme-tab-content-good-buy-font': color_text_regular,
  '--theme-tab-content-good-buy-font-hover': color_text_primary,
  '--theme-tab-content-good-buyBorder-font': color_text_secondary,
  '--theme-tab-content-good-bg': color_background_4,
  '--theme-tab-content-subscribe-good-bg': color_text_primary,
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
  '--theme-tab-content-live-card-bg': color_background_4,
  '--theme-tab-content-live-card-hover-bg': color_background_6,
  //专题
  '--theme-tab-content-project-title-font': color_text_grey,
  '--theme-tab-content-project-info-font': color_text_regular,
  '--theme-tab-content-project-card-bg': color_background_4,
  '--theme-tab-content-project-card-hover-bg': color_background_6,
  //自定义菜单
  '--theme-tab-content-title-font': color_text_grey,
  //分割线
  '--theme-tab-content-split-bg': color_background_5,
  //推荐
  '--theme-tab-content-recommend-title-font': color_text_grey,
  '--theme-tab-content-recommend-buy-font': color_text_grey,
  '--theme-tab-content-recommend-buy-border': color_text_secondary,
  '--theme-tab-content-recommend-bg': color_background_4,
  '--theme-tab-content-recommend-buy-font-hover': color_text_primary,
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
  '--theme-component-sign-up-tab-bg': color_background_6,
  //预约页
  '--theme-subscribe-tab-bg': color_background_12,
  '--theme-subscribe-tab-font': color_text_grey,
  '--theme-subscribe-tab-content-recommend-buy-font': color_text_grey,
  // 章节
  '--chapter-list-bg': '#ffffff',
  '--chapter-font-color-title': 'rgba(0,0,0,0.85)',
  '--chapter-font-color-time': 'rgba(0,0,0,0.45)',
  '--chapter-list-item-bg-active': 'rgba(0,0,0,0.06)',
  '--chapter-font-color-active': '#3552EA',
  // 快问快答
  '--theme-exam-progress-bgColor': 'rgba(0, 0, 0, 0.06)',
  '--theme-exam-progress-active-bgColor': 'rgba(53, 82, 234, 1)',
  '--theme-exam-question-type-bgColor': 'rgba(53, 82, 234, 0.15)',
  '--theme-exam-question-type-color': 'rgba(53, 82, 234, 1)',
  // '--theme-exam-next-button-bg': 'rgba(53, 82, 234, 1)',
  // '--theme-exam-next-button-border': 'rgba(53, 82, 234, 1)',
  // '--theme-exam-next-button-color': 'rgba(255, 255, 255, 1)',
  // '--theme-exam-next-button-active-bg': 'rgba(53, 82, 234, 1)',
  // '--theme-exam-next-button-active-border': 'rgba(53, 82, 234, 1)',
  // '--theme-exam-next-button-active-color': 'rgba(255, 255, 255, 1)',
  '--theme-exam-last-button-bg': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-border': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-color': 'rgba(38, 38, 38, 1)',
  '--theme-exam-last-button-active-bg': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-active-border': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-active-color': 'rgba(38, 38, 38, 1)',
  // 主题按钮
  '--theme-more-status-button-bg': 'rgba(53, 82, 234, 1)',
  '--theme-more-status-button-border': 'rgba(53, 82, 234, 1)',
  '--theme-more-status-button-color': '#ffffff',
  '--theme-more-status-button-hover-bg': 'rgba(35, 57, 196, 1)',
  '--theme-more-status-button-hover-border': 'rgba(35, 57, 196, 1)',
  '--theme-more-status-button-hover-color': '#ffffff',
  '--theme-more-status-button-active-bg': 'rgba(21, 34, 158, 1)',
  '--theme-more-status-button-active-border': 'rgba(21, 34, 158, 1)',
  '--theme-more-status-button-active-color': '#ffffff',
  '--theme-more-status-button-disabled-bg': 'rgba(222, 232, 255, 1)',
  '--theme-more-status-button-disabled-border': 'rgba(222, 232, 255, 1)',
  '--theme-more-status-button-disabled-color': '#ffffff'
};
