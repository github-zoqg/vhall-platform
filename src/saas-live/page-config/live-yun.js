/**
 * 云导播页面配置
 */
export default {
  liveStreamYunRoot: {
    component: 'VmpAirContainer',
    children: ['comPcPlayerLiveYun', 'comMediaSetting', 'comPcMediaCheck']
  },
  comPcPlayerLiveYun: {
    component: 'VmpPcPlayerLiveYun',
    emitClickMediaSetting: {
      cuid: 'comMediaSetting',
      method: 'showMediaSetting'
    }
  },
  comMediaSetting: {
    component: 'VmpPcMediaSetting',
    saveOptions: [
      {
        cuid: 'comStreamLocal',
        method: 'switchStreamType',
        args: ['$0']
      }
    ],
    changeMediaOption: [
      {
        cuid: 'comPcPlayerLiveYun',
        method: 'switchStreamType',
        args: ['$0']
      }
    ]
  },
  comPcMediaCheck: {
    component: 'VmpPcMediaCheck'
  }
};
