/**
 * pc观看端默认深色主题
 */

/* 字体颜色
--------------------- */
const color_text_primary = '#FFFFFF';
const color_text_regular = 'rgba(255, 255, 255, 0.65)';
const color_text_secondary = 'rgba(255, 255, 255, 0.45)';
const color_text_placeholder = 'rgba(255, 255, 255, 0.35)';
const color_text_disabled = 'rgba(255, 255, 255, 0.25)';
const color_text_link = '#3562fa';

/* 背景颜色
--------------------- */
const color_background_0 = '#1a1a1a';
const color_background_1 = '#2a2a2a';
const color_background_2 = 'rgba(255, 255, 255, 0.08)';
const color_background_3 = '#C0C4CC';

export default {
  '--theme-background-color': color_background_0,
  // 头部组件 VmpHeaderWatch
  '--header-background-color-base': color_background_1,
  '--header-font-color-primary': color_text_primary,
  '--header-font-color-regular': color_text_regular,
  '--header-font-color-link': color_text_link,
  // 聊天组件 VmpChat
  '--chat-font-color-msg-nickname': color_text_secondary,
  '--chat-font-color-msg-text': color_text_primary,
  '--chat-font-color-msg-time': color_text_primary,
  '--chat-background-color-base': color_background_1,
  '--chat-background-color-secondary': color_background_2
};
