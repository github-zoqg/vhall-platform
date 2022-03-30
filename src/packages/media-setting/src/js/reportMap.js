// 清晰度-上报CODE 映射
export const RATE_REPORT_MAP = new Map([
  ['RTC_VIDEO_PROFILE_720P_16x9_M', 110147], // 超清
  ['RTC_VIDEO_PROFILE_480P_16x9_M', 110015], // 高清
  ['RTC_VIDEO_PROFILE_360P_16x9_M', 110014], // 标清
  ['RTC_VIDEO_PROFILE_240P_16x9_M', 110016] // 流畅
]);

// 桌面共享-上报CODE 映射
export const SCREEN_RATE_REPORT_MAP = new Map([
  ['RTC_SCREEN_PROFILE_1080P_16x9_M', 110017], // PPT静态
  ['RTC_SCREEN_PROFILE_1080P_16x9_H', 110018] // 视频动态
]);

// 布局-上报CODE 映射
export const LAYOUT_REPORT_MAP = new Map([
  ['CANVAS_ADAPTIVE_LAYOUT_FLOAT_MODE', 110019], // 主次浮窗
  ['CANVAS_ADAPTIVE_LAYOUT_TILED_MODE', 110020], // 主次平铺
  ['CANVAS_ADAPTIVE_LAYOUT_GRID_MODE', 110021] // 均匀排列
]);