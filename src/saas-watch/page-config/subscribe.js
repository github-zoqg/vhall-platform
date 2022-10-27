/**
 * 预约页面配置
 */
export default {
  // 根节点
  layerSubscribeRoot: {
    component: 'VmpAirContainer',
    children: [
      'layerSubscribeHeader',
      'layerSubscribeBody',
      'layerSubscribeFooter',
      'comAllDialog',
      'comGoodsDetailPc'
    ]
  },
  // 顶部容器
  layerSubscribeHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['comHeaderWatch']
  },
  // 顶部组件
  comHeaderWatch: {
    component: 'VmpHeaderWatch',
    children: ['compLanguageChoice'],
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ],
    emitOpenOfficical: [
      //弹出公众号
      {
        cuid: 'comOfficial',
        method: 'openOfficialDialog'
      }
    ],
    emitOpenShare: [
      //弹出分享
      {
        cuid: 'comShare',
        method: 'openShareDialog'
      }
    ],
    emitOpenUserAccount: [
      //弹出个人资料
      {
        cuid: 'comUserAccount',
        method: 'openUserAccountDialog'
      }
    ],
    emitOpenCash: [
      //弹出提现组件
      {
        cuid: 'comCash',
        method: 'openCashDialog'
      }
    ]
  },
  // 语言切换组件
  compLanguageChoice: {
    component: 'VmpLanguageChoice',
    options: {
      choices: [
        { value: 'zh', label: 'language_choice.language_choice_1001' },
        { value: 'en', label: 'language_choice.language_choice_1002' }
      ]
    }
  },
  layerSubscribeBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['comVmpSubscribeBody']
  },
  comVmpSubscribeBody: {
    component: 'VmpSubscribeBody',
    children: ['comSubscribeTabMenu', 'comPcPlayer'],
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ],
    emitClickAuth: [
      // 权限弹窗
      {
        cuid: 'comWatchAuth',
        method: 'openAuthDialog',
        args: ['$0']
      }
    ],
    //
    emitClickPay: [
      {
        cuid: 'comWatchPayFee',
        method: 'openPayFee',
        args: ['$0']
      }
    ],
    // 弹窗报名表单
    emitClickOpenSignUpForm: {
      cuid: 'comSignUpForm',
      method: 'openModal'
    }
  },
  comSubscribeTabMenu: {
    component: 'VmpTabMenu',
    options: {
      // 是否展示左右按钮
      isToggleBtnVisible: false,
      /**
       * 菜单配置不是最终的显示，而是较全的配置表，具体显示要结合接口具体给过来哪些数据
       * 此配置主要涉及到type对应哪个cuid
       */
      menuConfig: [
        { type: 1, cuid: 'comCustomMenu', text: '' },
        { type: 4, cuid: 'comIntro', text: 'menu.menu_1003' },
        { type: 5, cuid: 'comGoodSaas', text: 'menu.menu_1004' },
        { type: 6, cuid: 'comRecommend', text: 'menu.menu_1005' }
      ]
    }
  },
  // 自定义菜单
  comCustomMenu: {
    component: 'VmpCustomMenu',
    emitOpenShareDialog: {
      cuid: 'comShare',
      method: 'shareOtherDialog',
      args: ['$0']
    },
    // 删除自定义菜单tab
    emitDeleteMenu: [
      {
        cuid: 'comTabMenu',
        method: 'setVisible',
        args: ['$0']
      },
      {
        cuid: 'comSubscribeTabMenu',
        method: 'setVisible',
        args: ['$0']
      }
    ]
  },
  // 简介
  comIntro: {
    component: 'VmpIntro'
  },
  //商品列表
  comGoodSaas: {
    component: 'VmpGoodList',
    emitShowDetail: {
      cuid: ['comGoodsDetailPc'],
      method: 'open',
      args: ['$0']
    },
    emitShowGoodsTab: {
      cuid: ['comSubscribeTabMenu'],
      method: 'setGoodsVisibleAndSelect',
      args: ['$0']
    }
  },
  // 推荐
  comRecommend: {
    component: 'VmpRecommend'
  },
  // 播放器
  comPcPlayer: {
    component: 'VmpPcPlayer',
    emitClickAuth: [
      {
        cuid: 'comWatchAuth',
        method: 'openAuthDialog',
        args: ['$0']
      }
    ],
    emitClickPay: [
      {
        cuid: 'comWatchPayFee',
        method: 'openPayFee',
        args: ['$0']
      }
    ],
    emitClickLogin: [
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ],
    emitClickOpenSignUpForm: [
      {
        cuid: 'comSignUpForm',
        method: 'openModal'
      }
    ]
  },
  layerSubscribeFooter: {
    component: 'VmpFooter',
    className: 'vmp-footer'
  },
  comAllDialog: {
    component: 'VmpAirContainer',
    children: [
      'dlgDocList',
      'compRegLogin',
      'comOfficial',
      'comShare',
      'comWatchAuth',
      'comSignUpForm',
      'comUserAccount',
      'comCash',
      'comScreenPost',
      'comMediaSetting',
      'comWatchPayFee',
      'comMicInvited',
      'comCameraCheck',
      'comViewRestriction'
    ]
  },
  dlgDocList: {
    component: 'VmpDocDlglist',
    emitDemonstrateDoc: [
      {
        cuid: 'comDocUne',
        method: 'demonstrate',
        args: ['$0', '$1', '$2']
      }
    ]
  },
  compRegLogin: {
    component: 'VmpRegLogin'
  },
  comOfficial: {
    component: 'VmpOfficialPc'
  },
  comShare: {
    component: 'VmpShare',
    options: {
      isInviteShare: true
    }
  },
  comWatchAuth: {
    component: 'VmpWatchAuth',
    emitClickOpenSignUpForm: {
      cuid: 'comSignUpForm',
      method: 'openModal'
    }
  },
  comSignUpForm: {
    component: 'VmpSignUpForm',
    options: {}
  },
  comUserAccount: {
    component: 'VmpUserAccount'
  },
  comCash: {
    component: 'VmpCash'
  },
  comScreenPost: {
    component: 'VmpScreenPost'
  },
  comMediaSetting: {
    component: 'VmpPcMediaSetting',
    saveOptions: [
      {
        cuid: 'comStreamLocal',
        method: 'switchStreamType',
        args: ['$0']
      }
    ]
  },
  comWatchPayFee: {
    component: 'VmpWatchPayFee'
  },
  comMicInvited: {
    component: 'VmpMicInvited',
    emitAgreeInvite: [
      {
        cuid: 'comStreamLocal',
        method: 'updateAutoSpeak'
      }
    ]
  },
  comCameraCheck: {
    component: 'VmpCameraCheck',
    saveOptions: [
      {
        cuid: 'comStreamLocal',
        method: 'switchStreamType',
        args: ['$0']
      }
    ]
  },
  comViewRestriction: {
    component: 'VmpViewRestriction',
    emitAgreeWitthTerms: [
      {
        cuid: 'comVmpSubscribeBody',
        method: 'handleAgreeWitthTerms'
      },
      {
        cuid: 'comPcPlayer',
        method: 'handleAgreeWitthTerms'
      }
    ]
  },
  comGoodsDetailPc: {
    component: 'VmpGoodDetailPc'
  }
};
