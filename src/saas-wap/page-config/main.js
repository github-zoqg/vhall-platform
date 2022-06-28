export default {
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
  layerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['comWapBody']
  },
  comWapBody: {
    component: 'VmpWapBody',
    children: ['comWapPlayer', 'comWapStreamList', 'comWapDesktopScreen', 'comWapInsertFIle']
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
  comWapStreamList: {
    component: 'VmpWapStreamList',
    children: ['comWapStreamLocal']
  },
  comWapStreamLocal: {
    component: 'VmpWapStreamLocal'
  },
  comWapDesktopScreen: {
    component: 'VmpWapDesktopScreen'
  },
  comWapInsertFIle: {
    component: 'VmpWapInsertFIle'
  },
  layerBodyCenter: {
    component: 'VmpWapBodyCenter',
    children: ['comTabMenuWap', 'comContainerRight', 'comNoticeWap']
  },
  comTabMenuWap: {
    component: 'VmpTabMenuWap',
    options: {
      menuConfig: [
        {
          type: 1,
          cuid: 'comCustomMenuWap',
          text: ''
        },
        {
          type: 2,
          cuid: 'comDocWap',
          text: 'menu.menu_1001',
          visible: false
        },
        {
          type: 3,
          cuid: 'comChatWap',
          text: 'menu.menu_1002'
        },
        {
          type: 'private',
          cuid: 'comPrivateChatWap',
          text: 'common.common_1008'
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
        },
        {
          type: 7,
          cuid: 'comChapterWap',
          text: 'menu.menu_1013'
        },
        {
          type: 8,
          cuid: 'comMemberListWap',
          text: ''
        },
        {
          type: 'v5',
          cuid: 'comQa',
          text: 'common.common_1004'
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
  comInteractToolsWap: {
    component: 'VmpInteractToolsWap',
    emitNeedLogin: {
      cuid: ['compRegLoginWap'],
      method: 'open'
    }
  },
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
  comWapRewardEffect: {
    component: 'VmpWapRewardEffect'
  },
  comWapRewardEffectSVGA: {
    component: 'VmpWapRewardEffectFullScreen'
  },
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
  comChapterWap: {
    component: 'VmpChapterWap'
  },
  comMemberListWap: {
    component: 'VmpMemberListWap'
  },
  comQa: {
    component: 'VmpQaWap',
    emitClickLogin: [
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
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
    emitClickLotteryIcon: {
      cuid: ['comLotteryWap'],
      method: 'handleClickIcon'
    },
    emitClickRedPacketIcon: {
      cuid: ['comRedPacketWap'],
      method: 'open'
    },
    emitClickQuestionnaireIcon: {
      cuid: ['comQuestionnaireWap'],
      method: 'open',
      args: ['$0']
    }
  },
  comSignWap: {
    component: 'VmpSignWap',
    emitOpenSignIcon: {
      cuid: ['comContainerRight'],
      method: 'changeStatus',
      args: ['$0', '$1']
    }
  },
  comWatchTimer: {
    component: 'VmpWapTimer',
    emitChangeTimer: {
      cuid: ['comContainerRight'],
      method: 'changeStatus',
      args: ['$0', '$1']
    }
  },
  comLotteryWap: {
    component: 'VmpLotteryWap',
    emitClickLogin: [
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
  },
  comRedPacketWap: {
    component: 'VmpRedPacketWap',
    emitClickLogin: [
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
  },
  comQuestionnaireWap: {
    component: 'VmpQuestionnaireWap',
    emitQuestionnaireVisible: [
      {
        cuid: 'comWapBody',
        method: 'questionnaireVisible',
        args: ['$0']
      }
    ]
  },
  comNoticeWap: {
    component: 'VmpNoticeWap'
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
  },
  comUserAccountWap: {
    component: 'VmpUserAccountWap',
    emitCloseUserCenterWap: [
      {
        cuid: 'comUserCenterWap',
        method: 'closeUserCenterWap',
        args: ['$0']
      }
    ]
  }
};
