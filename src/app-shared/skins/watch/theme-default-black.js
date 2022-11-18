/**
 * pc观看端默认黑色主题
 */

/* 字体颜色
--------------------- */
const color_text_primary = '#FFFFFF';
const color_text_black = '#000';
const color_text_red = '#fb2626';
const color_text_grey = '#262626';
const color_text_custom = '#fb2626';
const color_text_custom_sub = '#ffd1c9';
const color_text_regular = 'rgba(255, 255, 255, 0.65)';
const color_text_secondary = 'rgba(255, 255, 255, 0.45)';
const color_text_placeholder = 'rgba(255, 255, 255, 0.35)';
const color_text_disabled = 'rgba(255, 255, 255, 0.25)';
const color_text_link = '#3562fa';
const color_text_regular_2 = 'rgba(0, 0, 0, 0.65)';
const color_text_chat_exam = '#E6E6E6';
/* 背景颜色
--------------------- */
const color_background_0 = '#1a1a1a';
const color_background_1 = '#2a2a2a';
const color_background_2 = 'rgba(255, 255, 255, 0.08)';
const color_background_3 = '#C0C4CC';
const color_background_4 = 'transparent';
const color_background_5 = 'rgba(255, 255, 255, 0.06)';
const color_background_6 = 'rgba(255, 255, 255, 0.04)';
const color_background_7 = '#333';
const color_background_8 = 'rgba(0, 0, 0, 0.04)';
const color_background_9 = 'rgba(20, 20, 20, 1)';
const color_background_10 = '#444';
const color_background_11 = '#383838';
const color_background_12 = '#e6e6e6';
const color_background_13 = '#999';
const color_background_14 = '#ccc';
const color_background_15 = '#333';
const color_background_16 = '#ddd';
const color_background_17 = '#434343';
const color_background_18 = '#ababab';
const color_background_19 = '#e2e2e2';
const color_background_20 = 'rgb(117, 117, 117)';
const color_background_21 = '#666';
const color_background_22 = 'rgba(255, 255, 255, 0.9)';
const color_background_23 = '#34363a';
const color_background_24 = '#23232d';
const color_background_25 = '#777';
const color_background_26 = '#969696';
const color_background_27 = '#595959';
const color_background_28 = '#141414';
const color_background_29 = '#f7f7f7';

export default {
  '--theme-background-color': color_background_0,
  // 头部组件 VmpHeaderWatch
  '--header-background-color-base': color_background_1,
  '--header-font-color-primary': color_text_primary,
  '--header-font-color-regular': color_text_secondary,
  '--header-font-color-link': color_text_link,
  '--header-font-color-rehearsal': '#FB3A32',
  '--header-font-color-main': color_text_primary,
  '--header-tab-bg-color-hover': color_background_10,
  '--header-tab-font-color-hover': color_text_secondary,
  '--header-tab-item-font-color': color_text_custom,
  '--header-tab-item-dropdown-color': color_background_11,
  '--header-tab-item-dropdown-bg': color_background_1,
  '--header-tab-item-dropdown-font': color_text_secondary,
  //菜单组件
  '--tab-menu-bg-border': color_background_28,
  '--tab-bg-color-hover': color_background_7,
  // 聊天组件 VmpChat
  '--chat-font-color-msg-nickname': color_text_secondary,
  '--chat-font-color-msg-text': color_text_primary,
  '--chat-font-color-msg-time': color_text_primary,
  '--chat-background-color-base': color_background_1,
  '--chat-background-color-secondary': color_background_2,
  '--chat-background-color-input': color_background_5,
  '--chat-font-color-input': color_background_12,
  '--chat-font-color-filter': color_background_13,
  '--chat-font-color-filter-checked': color_background_13,
  '--chat-bg-color-filter-checked': color_background_11,
  '--chat-bg-color-checkbox': color_background_14,
  '--chat-bg-color-checkbox-checked': color_text_custom,
  '--chat-scrollbar-thumb-bg': color_text_disabled,
  '--chat-font-color-reply-name': 'rgba(255, 255, 255, 0.45)',
  '--chat-exam-font-color-msg-text': color_text_chat_exam,
  // 互动工具icon
  '--footer-icon-tip-border-color': '#262626',
  //footer
  '--footer-color-font': 'rgba(255, 255, 255, 0.45)',
  //主题色
  '--theme-color': color_text_custom,
  '--theme-color-sub': color_text_custom_sub,
  '--theme-menu-bg': color_background_1,
  //分组
  '--group-name-icon-font-color': color_background_14,
  '--group-name-font-color': color_background_13,
  '--group-item-hover-color': color_background_15,
  '--group-turnOff-font-color': color_background_16,
  '--group-more-font-color': color_background_14,
  '--group-more-hover-color': color_background_17,
  '--group-online-font-color': color_background_18,
  '--group-online-icon-color': color_background_19,
  '--group-refresh-font-color': color_background_18,
  '--group-btn-bg-color': color_background_17,
  '--group-btn-font-color': color_background_13,
  '--group-btn-hover-color': color_background_26,
  '--group-btn-hover-font-color': color_text_primary,
  '--group-btn-active-color': color_background_27,
  '--group-btn-active-font-color': color_background_12,
  '--group-more-mute-font-color': color_background_12,
  '--group-search-font-color': color_background_13,
  '--group-search-bg-color': color_background_17,
  '--group-search-placeholder-color': color_background_20,
  '--group-search-input-font-color': color_background_21,
  '--group-search-input-bg-color': color_background_22,
  '--group-search-input-bg2-color': color_background_23,
  '--group-search-confirm-font-color': color_background_21,
  //侧边栏
  '--menu-item-font-color': color_background_13,
  '--menu-item-font-disable-color': color_background_25,
  '--menu-item-menu-color': color_background_1,
  //菜单-内容
  '--tab-menu-btn-color': color_text_secondary,
  '--tab-menu-btn-color-hover': color_text_regular,
  //简介
  '--theme-tab-content-intro-font': color_text_primary,
  //商品
  '--theme-tab-content-good-name-font': color_text_primary,
  '--theme-tab-content-good-describe-font': color_text_regular,
  '--theme-tab-content-good-discountPrice-font': color_text_secondary,
  '--theme-tab-content-good-priceTag-bg': '#fff2f0',
  '--theme-tab-content-good-price-font': color_text_primary,
  '--theme-tab-content-good-buy-font': color_text_primary,
  '--theme-tab-content-good-buyBorder-font': color_text_secondary,
  '--theme-tab-content-good-bg': color_background_4,
  '--theme-tab-content-subscribe-good-bg': color_text_primary,
  '--theme-tab-content-good-hover-bg': color_background_6,
  '--theme-tab-content-good-split-bg': color_background_5,
  '--theme-tab-content-good-buy-font-hover': color_text_primary,
  //排行榜
  '--theme-tab-content-rank-title-font': color_text_primary,
  '--theme-tab-content-rank-rule-font': color_text_regular,
  '--theme-tab-content-rank-rule-content-font': color_text_primary,
  '--theme-tab-content-rank-rule-content-bg': color_background_7,
  '--theme-tab-content-rank-content-font': color_text_primary,
  '--theme-tab-content-rank-content-invite-font': color_text_secondary,
  '--theme-tab-content-rank-content-invite-btn-font': color_text_black,
  '--theme-tab-content-rank-content-invite-btn-border': color_text_regular,
  '--theme-tab-content-rank-split-bg': color_background_5,
  '--theme-tab-content-rank-finish-font': color_text_disabled,
  '--theme-tab-content-rank-noData-font': color_text_secondary,
  //图文组件
  '--theme-tab-content-word-font': color_text_primary,
  //直播
  '--theme-tab-content-live-title-font': color_background_12,
  '--theme-tab-content-live-info-font': color_background_13,
  '--theme-tab-content-live-card-bg': color_background_4,
  '--theme-tab-content-live-card-hover-bg': color_background_6,
  //专题
  '--theme-tab-content-project-title-font': color_background_12,
  '--theme-tab-content-project-info-font': color_background_13,
  '--theme-tab-content-project-card-bg': color_background_4,
  '--theme-tab-content-project-card-hover-bg': color_background_6,
  //自定义菜单
  '--theme-tab-content-title-font': color_text_primary,
  //分割线
  '--theme-tab-content-split-bg': color_background_5,
  //推荐
  '--theme-tab-content-recommend-title-font': color_text_primary,
  '--theme-tab-content-recommend-buy-font': color_text_primary,
  '--theme-tab-content-recommend-buy-border': color_text_secondary,
  '--theme-tab-content-recommend-buy-font-hover': color_text_primary,
  '--theme-tab-content-recommend-bg': color_background_4,
  '--theme-tab-content-recommend-hover-bg': color_background_6,
  '--theme-tab-content-recommend-border': color_background_5,
  '--theme-tab-content-recommend-noData-font': color_text_disabled,
  //文档
  '--theme-tab-content-doc-font': color_text_secondary,
  //问答
  '--theme-tab-content-qa-text-font': color_text_secondary,
  '--theme-tab-content-qa-replyText-font': color_text_primary,
  '--theme-tab-content-qa-replyText-bg': color_background_5,
  '--theme-tab-content-qa-qaLabel-font': '#fc9600',
  '--theme-tab-content-qa-onlyMe-font': color_text_secondary,
  //私聊
  '--theme-tab-content-private-name-font': color_text_secondary,
  '--theme-tab-content-private-content-font': color_text_primary,
  '--theme-tab-content-private-time-font': color_text_secondary,
  //组件
  '--theme-component-subscribe': color_text_red,
  '--theme-component-subscribe-text': color_text_regular,
  '--theme-component-subscribe-num': color_text_primary,
  //报名表单
  '--theme-component-sign-up-tab-font': color_text_regular_2,
  '--theme-component-sign-up-tab-bg': color_background_8,
  //预约页
  '--theme-subscribe-tab-bg': color_background_1,
  '--theme-subscribe-tab-font': color_background_29,
  '--theme-subscribe-tab-content-recommend-buy-font': color_text_grey,
  // 章节
  '--chapter-list-bg': '#262626',
  '--chapter-font-color-title': '#ffffff',
  '--chapter-font-color-time': 'rgba(255,255,255,0.45)',
  '--chapter-list-item-bg-active': 'rgba(255,255,255,0.06)',
  '--chapter-font-color-active': '#fb2626',
  // 快问快答
  '--theme-exam-progress-bgColor': 'rgba(0, 0, 0, 0.06)',
  '--theme-exam-progress-active-bgColor': '#FB2626',
  '--theme-exam-question-type-bgColor': 'rgba(251, 38, 38, 0.15)',
  '--theme-exam-question-type-color': 'rgba(251, 38, 38, 1)',
  '--theme-exam-next-button-bg': '#FB2626',
  '--theme-exam-next-button-border': '#FB2626',
  '--theme-exam-next-button-color': 'rgba(255, 255, 255, 1)',
  '--theme-exam-next-button-active-bg': '#FB2626',
  '--theme-exam-next-button-active-border': '#FB2626',
  '--theme-exam-next-button-active-color': 'rgba(255, 255, 255, 1)',
  '--theme-exam-last-button-bg': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-border': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-color': 'rgba(38, 38, 38, 1)',
  '--theme-exam-last-button-active-bg': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-active-border': 'rgba(217, 217, 217, 1)',
  '--theme-exam-last-button-active-color': 'rgba(38, 38, 38, 1)',
  // 主题按钮
  '--theme-more-status-button-bg': 'rgba(251, 38, 38, 1)',
  '--theme-more-status-button-border': 'rgba(251, 38, 38, 1)',
  '--theme-more-status-button-color': '#ffffff',
  '--theme-more-status-button-hover-bg': 'rgba(212, 21, 28, 1)',
  '--theme-more-status-button-hover-border': 'rgba(212, 21, 28, 1)',
  '--theme-more-status-button-hover-color': '#ffffff',
  '--theme-more-status-button-active-bg': 'rgba(173, 9, 20, 1)',
  '--theme-more-status-button-active-border': 'rgba(173, 9, 20, 1)',
  '--theme-more-status-button-active-color': '#ffffff',
  '--theme-more-status-button-disabled-bg': 'rgba(255, 209, 201, 1)',
  '--theme-more-status-button-disabled-border': 'rgba(255, 209, 201, 1)',
  '--theme-more-status-button-disabled-color': '#ffffff'
};
