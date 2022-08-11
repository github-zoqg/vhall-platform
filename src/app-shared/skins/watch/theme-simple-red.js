/**
 * pc观看端简介白主题
 */

/* 字体颜色
--------------------- */
const color_text_primary = '#262626';
const color_text_regular = '#595959';
const color_text_secondary = 'rgba(255, 255, 255, 0.45)';
const color_text_placeholder = 'rgba(255, 255, 255, 0.35)';
const color_text_disabled = 'rgba(255, 255, 255, 0.25)';

/* 背景颜色
--------------------- */
const color_background_0 = '#FFFFFF';
const color_background_1 = 'rgba(255, 255, 255, 0.65);';
const color_background_2 = 'rgba(255, 255, 255, 0.08)';
const color_background_3 = '#C0C4CC';

export default {
  '--theme-background-color': color_background_0,
  // 头部组件 VmpHeaderWatch
  '--header-background-color-base': color_background_1,
  '--header-font-color-primary': color_text_primary,
  '--header-font-color-regular': color_text_regular,
  // 聊天组件 VmpChat
  '--chat-font-color-msg-nickname': color_text_secondary,
  '--chat-font-color-msg-text': color_text_primary,
  '--chat-font-color-msg-time': color_text_primary,
  '--chat-background-color-base': color_background_1,
  '--chat-background-color-secondary': color_background_2
};
