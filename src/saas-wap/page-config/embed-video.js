/**
 * 单视频嵌入页面配置
 */
export default {
  // 根节点
  embedVideoLayerRoot: {
    component: 'VmpAirContainer',
    children: ['embedVideoLayerBody']
  },
  // 中间主区域容器
  embedVideoLayerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['embedVideoLComWapBody']
  },
  // 中间主区域组件
  embedVideoLComWapBody: {
    component: 'VmpWapBody',
    children: ['comWapPlayer']
  },
  // 播放器
  comWapPlayer: {
    component: 'VmpWapPlayer',
    emitCheckAuth: [
      {
        cuid: 'comSubcribeWapBody',
        method: 'playerAuthCheck',
        args: ['$0']
      }
    ],
    emitChangeChatHeight: [
      {
        cuid: 'comChatWap',
        method: 'changeChatHeight',
        args: ['$0']
      }
    ]
  }
};
