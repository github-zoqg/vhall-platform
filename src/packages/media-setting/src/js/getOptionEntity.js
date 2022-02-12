export function getOptionEntity() {
  return [
    { id: 'basic-setting', text: '基础设置' },
    { id: 'video-setting', text: '摄像头' },
    { id: 'audio-in-setting', text: '麦克风' },
    { id: 'audio-out-setting', text: '扬声器' }
  ];
}

export function getDefinitionMap() {
  return new Map([
    ['RTC_VIDEO_PROFILE_240P_16x9_M', '流畅'],
    ['RTC_VIDEO_PROFILE_480P_16x9_M', '高清'],
    ['RTC_VIDEO_PROFILE_360P_16x9_M', '标清'],
    ['RTC_VIDEO_PROFILE_720P_16x9_M', '超清'],
    ['240', 'RTC_VIDEO_PROFILE_240P_16x9_M'],
    ['480', 'RTC_VIDEO_PROFILE_480P_16x9_M'],
    ['360', 'RTC_VIDEO_PROFILE_360P_16x9_M'],
    ['720', 'RTC_VIDEO_PROFILE_720P_16x9_M']
  ]);
}

export function getScreenOptions() {
  return [
    { value: 'RTC_SCREEN_PROFILE_1080P_16x9_H', label: '视频动态演示模式' },
    { value: 'RTC_SCREEN_PROFILE_1080P_16x9_M', label: 'PPT静态演示模式' }
  ];
}
