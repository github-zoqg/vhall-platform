export function getCheckList() {
  return [
    { use: true, name: 'video', text: '摄像头', icon: 'iconshexiangtou_icon', status: 'no-check' },
    {
      use: true,
      name: 'audioInput',
      text: '麦克风',
      icon: 'iconmaikefeng_icon',
      status: 'no-check'
    },
    {
      use: true,
      name: 'audioOutput',
      text: '扬声器',
      icon: 'iconyangshengqi_icon',
      status: 'no-check'
    }
  ];
}
