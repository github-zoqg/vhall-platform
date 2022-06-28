export default {
  subcribeRoot: {
    component: 'VmpAirContainer',
    children: ['subcribeHeader', 'subcribeBody', 'comAllDialog', 'comGoodsDetail']
  },
  subcribeHeader: {
    component: 'VmpAirContainer',
    className: 'vmp-basic-hd',
    children: ['comHeaderWatch']
  },
  comHeaderWatch: {
    component: 'VmpHeaderWatchWap',
    children: [],
    emitClickLogin: [
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ],
    emitOpenOfficical: [
      {
        cuid: 'comOfficial',
        method: 'openOfficial'
      }
    ]
  },
  subcribeBody: {
    component: 'VmpAirContainer',
    className: 'vmp-basic-bd',
    children: ['comSubcribeWapBody']
  },
  comSubcribeWapBody: {
    component: 'VmpSubscribeBody',
    children: ['comWapPlayer', 'subcribeCenter'],
    emitClickLogin: [
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
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
  },
  subcribeCenter: {
    component: 'VmpContainer',
    className: 'tab-content',
    children: ['comSubcribeTabMenuWap']
  },
  comSubcribeTabMenuWap: {
    component: 'VmpTabMenuWap',
    options: {
      menuConfig: [
        {
          type: 1,
          cuid: 'comCustomMenuWap',
          text: ''
        },
        {
          type: 4,
          cuid: 'comIntroWap',
          text: 'menu.menu_1003'
        },
        {
          type: 5,
          cuid: 'comGoodSaasWap',
          text: 'menu.menu_1004'
        },
        {
          type: 6,
          cuid: 'comRecommendWap',
          text: 'menu.menu_1005'
        }
      ]
    }
  },
  comCustomMenuWap: {
    component: 'VmpCustomMenuWap',
    emitDeleteMenu: [
      {
        cuid: 'comTabMenuWap',
        method: 'setVisible',
        args: ['$0']
      },
      {
        cuid: 'comSubcribeTabMenuWap',
        method: 'setVisible',
        args: ['$0']
      }
    ]
  },
  comIntroWap: {
    component: 'VmpIntroWap',
    addTab: [
      {
        cuid: ['comGoodSaasWap'],
        method: 'addItem'
      }
    ]
  },
  comGoodSaasWap: {
    component: 'VmpGoodListWap',
    emitShowDetail: {
      cuid: ['comGoodsDetail'],
      method: 'open',
      args: ['$0']
    }
  },
  comRecommendWap: {
    component: 'VmpRecommendWap'
  },
  comAllDialog: {
    component: 'VmpAirContainer',
    children: [
      'compRegLoginWap',
      'comOfficial',
      'comShare',
      'comSignUpForm',
      'comScreenPostWap',
      'comUserCenterWap',
      'comCashWap',
      'comInviteHandup',
      'comViewRestrictionWap'
    ]
  },
  compRegLoginWap: {
    component: 'VmpRegLoginWap'
  },
  comOfficial: {
    component: 'VmpWapQrCode'
  },
  comScreenPostWap: {
    component: 'VmpScreenPostWap'
  },
  comUserCenterWap: {
    component: 'VmpUserCenterWap',
    emitOpenUserAccountWap: [
      {
        cuid: ['comUserAccountWap'],
        method: 'openUserAccountWap',
        args: ['$0']
      }
    ],
    emitOpenCashWap: [
      {
        cuid: ['comCashWap'],
        method: 'openCashWap'
      }
    ]
  },
  comCashWap: {
    component: 'VmpCashWap',
    emitCloseUserCenterWap: [
      {
        cuid: 'comUserCenterWap',
        method: 'closeUserCenterWap',
        args: ['$0']
      }
    ]
  },
  comInviteHandup: {
    component: 'VmpInviteHandup',
    emitAgreeInvite: [
      {
        cuid: 'comWapStreamLocal',
        method: 'updateAutoSpeak'
      }
    ]
  },
  comViewRestrictionWap: {
    component: 'VmpViewRestrictionWap',
    emitAgreeWitthTerms: [
      {
        cuid: 'comSubcribeWapBody',
        method: 'handleAgreeWitthTerms'
      }
    ]
  },
  comGoodsDetail: {
    component: 'VmpGoodsDetail'
  }
};
