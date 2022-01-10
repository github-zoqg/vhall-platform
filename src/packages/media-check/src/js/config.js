const STEP_OPTS = {
  DEFAULT: 0, // 预留字段，表示进来时默认从第几个开始
  VIDEO: 0,
  AUDIO_INPUT: 1,
  AUDIO_OUTPUT: 2,
  RESULT: 3
};

const DESC_OPTS = {
  SWITCHING: '设备切换中，请稍侯...',
  FORBIDDEN: '摄像头被禁用，请开启后再试',
  PREVIEW_ERROR: '视频预览失败，请检查设备',
  SWITCHING_ERROR: '摄像头切换失败，请稍后重试'
};

export { STEP_OPTS, DESC_OPTS };
