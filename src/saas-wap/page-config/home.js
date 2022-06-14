const globalConfig = {
  lang: 'zh'
};

// 服务配置
const serverConfig = {
  /*** 布局定义start */
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: [
      'comHeaderWatch',
      'layerBody',
      'layerBodyCenter',
      'comAllDialog',
      'comGoodsDetail',
      'comUserAccountWap'
    ]
    // children: ['layerHeader', 'layerBody', 'comAllDialog']
  },
  // 顶部header容器
  layerHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['comHeaderWatch']
  },
  // 中间主区域容器
  layerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['comWapBody']
  },
  // layerPlayer: {
  //   component: 'VmpContainer',
  //   className: 'vmp-basic-bd',
  //   children: ['comWaStreamLocal']
  //   // comWapPlayer 编写互动功能，暂时注释
  // },
  layerBodyCenter: {
    component: 'VmpContainer',
    className: /embed/.test(location.pathname) ? 'tab-content-embed' : 'tab-content',
    children: ['comTabMenuWap', 'comContainerRight', 'comNoticeWap']
  },
  /*** 布局定义end */
  /*** 所有弹窗集合 */
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
  // 顶部
  comHeaderWatch: {
    component: 'VmpHeaderWatchWap',
    children: [],
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ],
    emitOpenOfficical: [
      //弹出公众号
      {
        cuid: 'comOfficial',
        method: 'openOfficial'
      }
    ]
  },
  // 播放器容器和推流容器
  comWapBody: {
    component: 'VmpWapBody',
    children: ['comWapPlayer', 'comWapStreamList', 'comWapDesktopScreen', 'comWapInsertFIle']
  },
  comWapPlayer: {
    component: 'VmpWapPlayer',
    emitCheckAuth: [
      //权限验证
      {
        cuid: 'comSubcribeWapBody',
        method: 'playerAuthCheck',
        args: ['$0'] // 获取动态参数的第一个
      }
    ],
    emitChangeChatHeight: [
      {
        cuid: 'comChatWap',
        method: 'changeChatHeight',
        args: ['$0'] // 获取动态参数的第一个
      }
    ]
  },
  comWapStreamList: {
    component: 'VmpWapStreamList',
    children: ['comWapStreamLocal']
  },
  comWapDesktopScreen: {
    component: 'VmpWapDesktopScreen'
  },
  comWapInsertFIle: {
    component: 'VmpWapInsertFIle'
  },
  comWapStreamLocal: {
    component: 'VmpWapStreamLocal'
  },
  comWapStreamRemote: {
    component: 'VmpWapStreamRemote'
  },
  comWatchTimer: {
    component: 'VmpWapTimer',
    emitChangeTimer: {
      cuid: ['comContainerRight'],
      method: 'changeStatus',
      args: ['$0', '$1'] // 获取动态参数的第一个
    }
  },
  comContainerTop: {
    component: 'VmpContainer',
    className: 'container-top'
  },
  comContainerRight: {
    component: 'VmpContainerRightWap',
    children: [
      'comSignWap',
      'comWatchTimer',
      'comLotteryWap',
      'comRedPacketWap',
      'comQuestionnaireWap'
    ],
    emitOpenTimer: {
      cuid: ['comWatchTimer'],
      method: 'handleTimer'
    },
    emitOpenSign: {
      cuid: ['comSignWap'],
      method: 'openSign'
    },
    emitOpenRedPacket: {
      cuid: ['comRedPacketWap'],
      method: 'openRedPacket'
    },
    // 抽奖弹窗
    emitClickLotteryIcon: {
      cuid: ['comLotteryWap'],
      method: 'handleClickIcon'
    },
    // 红包弹窗
    emitClickRedPacketIcon: {
      cuid: ['comRedPacketWap'],
      method: 'open'
    },
    // 问卷弹窗
    emitClickQuestionnaireIcon: {
      cuid: ['comQuestionnaireWap'],
      method: 'open',
      args: ['$0']
    }
  },
  // notice横幅
  comNoticeWap: {
    component: 'VmpNoticeWap'
  },
  // 登录弹窗
  compRegLoginWap: {
    component: 'VmpRegLoginWap'
  },
  comTabMenuWap: {
    component: 'VmpTabMenuWap',
    options: {
      /**
       * 菜单配置不是最终的显示，而是较全的配置表，具体显示要结合接口具体给过来哪些数据
       * 此配置主要涉及到type对应哪个cuid
       */
      menuConfig: [
        {
          type: 1,
          cuid: 'comCustomMenuWap',
          text: ''
        }, //自定义菜单
        {
          type: 2,
          cuid: 'comDocWap',
          text: 'menu.menu_1001',
          visible: false
        }, // 文档
        {
          type: 3,
          cuid: 'comChatWap',
          text: 'menu.menu_1002'
        }, // 聊天
        {
          type: 'private',
          cuid: 'comPrivateChatWap',
          text: 'common.common_1008'
        }, // 私聊
        {
          type: 4,
          cuid: 'comIntroWap',
          text: 'menu.menu_1003'
        }, // 简介
        {
          type: 5,
          cuid: 'comGoodSaasWap',
          text: 'menu.menu_1004'
        }, // 商品
        {
          type: 6,
          cuid: 'comRecommendWap',
          text: 'menu.menu_1005'
        }, // 广告、推荐
        {
          type: 7,
          cuid: 'comChapterWap',
          text: 'menu.menu_1013'
        }, // 章节
        {
          type: 8,
          cuid: 'comMemberListWap',
          text: ''
        }, // 成员
        {
          type: 'v5',
          cuid: 'comQa',
          text: 'common.common_1004'
        } //问答
      ]
    }
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
  // 底部互动工具box
  comInteractToolsWap: {
    component: 'VmpInteractToolsWap',
    emitNeedLogin: {
      cuid: ['compRegLoginWap'],
      method: 'open'
    }
  },
  // 广告（推荐）
  comRecommendWap: {
    component: 'VmpRecommendWap'
  },
  //商品列表
  comGoodSaasWap: {
    component: 'VmpGoodListWap',
    emitShowDetail: {
      cuid: ['comGoodsDetail'],
      method: 'open',
      args: ['$0']
    }
  },
  comGoodsDetail: {
    component: 'VmpGoodsDetail'
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
  // 二维码弹框
  comOfficial: {
    component: 'VmpWapQrCode'
  },
  //wap端聊天
  comChatWap: {
    component: 'VmpChatWap',
    addTab: [
      {
        cuid: ['comTabMenuWap'],
        method: 'addItem',
        args: ['$0']
      }
    ],
    emitOpenUserCenterWap: [
      {
        cuid: ['comUserCenterWap'],
        method: 'openUserCenterWap',
        args: ['$0']
      }
    ],
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ],
    emitClickLotteryChatItem: {
      cuid: ['comLotteryWap'],
      method: 'accept',
      args: ['$0']
    },
    emitClickQuestionnaireChatItem: {
      cuid: ['comQuestionnaireWap'],
      method: 'open',
      args: ['$0']
    },
    children: ['comInteractToolsWap', 'comWapRewardEffect', 'comWapRewardEffectSVGA'],
    options: {}
  },
  //wap端私聊
  comPrivateChatWap: {
    component: 'VmpWapPrivateChat',
    options: {},
    emitShowTab: [
      {
        cuid: 'comTabMenuWap',
        method: 'setVisible'
      },
      {
        cuid: 'comTabMenuWap',
        method: 'setTipsVisible',
        args: ['$0']
      }
    ]
  },
  // wap互动工具-签到
  comSignWap: {
    component: 'VmpSignWap',
    emitOpenSignIcon: {
      cuid: ['comContainerRight'],
      method: 'changeStatus',
      args: ['$0', '$1']
    }
  },
  //成员列表
  comMemberListWap: {
    component: 'VmpMemberListWap'
  },
  comQa: {
    component: 'VmpQaWap',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
  },
  //wap端文档
  comDocWap: {
    component: 'VmpDocWap',
    emitShowMenuTab: {
      cuid: ['comTabMenuWap'],
      method: 'changeDocStatus',
      args: ['$0']
    },
    children: ['comInteractToolsWap'],
    options: {}
  },
  // 开屏页
  comScreenPostWap: {
    component: 'VmpScreenPostWap'
  },
  // 个人中心
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
  // 个人资料
  comUserAccountWap: {
    component: 'VmpUserAccountWap',
    emitCloseUserCenterWap: [
      {
        cuid: 'comUserCenterWap',
        method: 'closeUserCenterWap',
        args: ['$0']
      }
    ]
  },
  // 提现管理
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
  // 抽奖
  comLotteryWap: {
    component: 'VmpLotteryWap',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
  },
  // 章节
  comChapterWap: {
    component: 'VmpChapterWap'
  },
  // 问卷
  comQuestionnaireWap: {
    component: 'VmpQuestionnaireWap',
    emitQuestionnaireVisible: [
      // 问卷弹窗的显示和隐藏(全屏)
      {
        cuid: 'comWapBody',
        method: 'questionnaireVisible',
        args: ['$0']
      }
    ]
  },

  // 预约页配置

  subcribeRoot: {
    component: 'VmpAirContainer',
    children: ['subcribeHeader', 'subcribeBody', 'comAllDialog', 'comGoodsDetail']
  },
  // 顶部header容器
  subcribeHeader: {
    component: 'VmpAirContainer',
    className: 'vmp-basic-hd',
    children: ['comHeaderWatch']
  },
  // 中间主区域容器
  subcribeBody: {
    component: 'VmpAirContainer',
    className: 'vmp-basic-bd',
    children: ['comSubcribeWapBody']
  },
  subcribeCenter: {
    component: 'VmpContainer',
    className: 'tab-content',
    children: ['comSubcribeTabMenuWap']
  },
  comSubcribeWapBody: {
    component: 'VmpSubscribeBody',
    children: ['comWapPlayer', 'subcribeCenter'],
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
  },
  comSubcribeTabMenuWap: {
    component: 'VmpTabMenuWap',
    options: {
      // 是否展示左右按钮
      // isToggleBtnVisible: false,
      /**
       * 菜单配置不是最终的显示，而是较全的配置表，具体显示要结合接口具体给过来哪些数据
       * 此配置主要涉及到type对应哪个cuid
       */
      menuConfig: [
        {
          type: 1,
          cuid: 'comCustomMenuWap',
          text: ''
        }, //自定义菜单
        {
          type: 4,
          cuid: 'comIntroWap',
          text: 'menu.menu_1003'
        }, // 简介
        {
          type: 5,
          cuid: 'comGoodSaasWap',
          text: 'menu.menu_1004'
        }, // 商品
        {
          type: 6,
          cuid: 'comRecommendWap',
          text: 'menu.menu_1005'
        } // 广告、推荐
      ]
    }
  },
  // 红包
  comRedPacketWap: {
    component: 'VmpRedPacketWap',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
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

  // *******单视频嵌入页面****开始
  // 单视频嵌入页面配置
  embedVideoLayerRoot: {
    component: 'VmpAirContainer',
    children: ['embedVideoLayerBody']
    // children: ['layerHeader', 'layerBody', 'comAllDialog']
  },
  // 中间主区域容器
  embedVideoLayerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['embedVideoLComWapBody']
  },
  // 播放器容器和推流容器
  embedVideoLComWapBody: {
    component: 'VmpWapBody',
    children: ['comWapPlayer']
  },
  comViewRestrictionWap: {
    component: 'VmpViewRestrictionWap',
    emitAgreeWitthTerms: [
      //登录弹窗
      {
        cuid: 'comSubcribeWapBody',
        method: 'handleAgreeWitthTerms'
      }
    ]
  },
  // *******单视频嵌入页面****结束
  // 礼物动画组件
  comWapRewardEffect: {
    component: 'VmpWapRewardEffect'
  },
  // 礼物动画组件-SVGAA
  comWapRewardEffectSVGA: {
    component: 'VmpWapRewardEffectFullScreen'
  }
};

export default {
  globalConfig: globalConfig,
  serverConfig: serverConfig
};
