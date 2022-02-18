export function getCheckList() {
  return [
    { use: true, name: 'video', text: '摄像头', icon: 'vh-line-video-camera', status: 'no-check' },
    {
      use: true,
      name: 'audioInput',
      text: '麦克风',
      icon: 'vh-line-microphone',
      status: 'no-check'
    },
    {
      use: true,
      name: 'audioOutput',
      text: '扬声器',
      icon: 'vh-line-voice',
      status: 'no-check'
    }
  ];
}
