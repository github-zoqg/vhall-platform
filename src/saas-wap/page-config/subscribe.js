/**
 * 预约页面配置
 */
export default {
  // 根节点
  subcribeRoot: {
    component: 'VmpAirContainer',
    children: ['subcribeHeader', 'subcribeBody', 'comAllDialog', 'comGoodsDetail']
  },
  // 顶部容器
  subcribeHeader: {
    component: 'VmpAirContainer',
    className: 'vmp-basic-hd',
    children: ['comHeaderWatch']
  },
  // 顶部组件
  comHeaderWatch: {
    component: 'VmpHeaderWatchWap',
    emitClickLogin: [
      // 登录弹窗
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
    ],
    emitSmsVerify: [
      {
        cuid: 'comSmsVerification',
        method: 'open',
        args: ['$0']
      }
    ]
  },
  // 播放器
  comWapPlayer: {
    component: 'VmpWapPlayer',
    // 权限验证
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
        { type: 1, cuid: 'comCustomMenuWap', text: '' }, // 自定义菜单
        { type: 4, cuid: 'comIntroWap', text: 'menu.menu_1003' }, // 简介
        { type: 5, cuid: 'comGoodSaasWap', text: 'menu.menu_1004' }, // 商品
        { type: 6, cuid: 'comRecommendWap', text: 'menu.menu_1005' } // 推荐
      ]
    }
  },
  // 自定义菜单组件
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
  // 简介组件
  comIntroWap: {
    component: 'VmpIntroWap',
    addTab: [
      {
        cuid: ['comGoodSaasWap'],
        method: 'addItem'
      }
    ]
  },
  // 商品组件
  comGoodSaasWap: {
    component: 'VmpGoodListWap',
    emitShowDetail: {
      cuid: ['comGoodsDetail'],
      method: 'open',
      args: ['$0']
    }
  },
  // 推荐组件
  comRecommendWap: {
    component: 'VmpRecommendWap'
  },
  // 所有弹窗集合
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
      'comViewRestrictionWap',
      'comSmsVerification'
    ]
  },
  // 登录弹窗
  compRegLoginWap: {
    component: 'VmpRegLoginWap'
  },
  // 二维码弹框
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
  },
  comSmsVerification: {
    component: 'VmpSmsVerification'
  }
};
