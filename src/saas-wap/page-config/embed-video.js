export default {
  embedVideoLayerRoot: {
    component: 'VmpAirContainer',
    children: ['embedVideoLayerBody']
  },
  embedVideoLayerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['embedVideoLComWapBody']
  },
  embedVideoLComWapBody: {
    component: 'VmpWapBody',
    children: ['comWapPlayer']
  },
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
