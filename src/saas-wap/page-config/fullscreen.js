/**
 * 【竖屏直播】wap观看端主直播页面配置
 */
export default {
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: [
      'comWapBody',
      'comHeaderWatch',
      'layerJaw',
      'layerNeck',
      'layerBody',
      'layerBodyBlock',
      'layerBodyCenter',
      'comAllDialog',
      'comGoodsDetail',
      'comUserAccountWap'
    ]
  },
  // 顶部组件
  comHeaderWatch: {
    component: 'VmpConciseHeaderWatchWap',
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
    ],
    emitPlayerDoBarrage: [
      {
        cuid: 'comWapPlayer',
        method: 'openBarrage'
      }
    ],
    emitPlayerUpdateQuality: [
      {
        cuid: 'comWapPlayer',
        method: 'changeQualitys',
        args: ['$0']
      }
    ],
    emitPlayerUpdateSpeed: [
      {
        cuid: 'comWapPlayer',
        method: 'changeSpeed',
        args: ['$0']
      }
    ]
  },
  layerJaw: {
    component: 'VmpClearScreen',
    className: 'vmp-basic-jaw',
    children: ['comContainerRight']
  },
  // 颈部容器
  layerNeck: {
    component: 'VmpClearScreen',
    className: 'vmp-basic-neck',
    children: ['comNoticeWap']
  },
  // 中间主区域容器
  layerBody: {
    component: 'VmpClearScreen',
    className: 'vmp-basic-bd',
    children: ['comWapCenter'],
    options: {
      isSelf: false
    }
  },
  // 中间主区域容器
  layerBodyBlock: {
    component: 'VmpClearScreen',
    className: 'vmp-block',
    children: ['comBodyBlock']
  },
  // 中间主区域内容容器
  comWapBody: {
    component: 'VmpWapBody',
    children: ['comWapPlayer', 'comWapStreamList', 'comWapDesktopScreen', 'comWapInsertFIle'],
    emitPlayerWebinarsBgImg: [
      // 获取直播结束图片背景
      {
        cuid: 'comWapCenter',
        method: 'getWebinarsBgImgLive',
        args: ['$0']
      }
    ],
    emitPlayerLivingEnd: [
      // 获取直播结束标识
      {
        cuid: 'comWapCenter',
        method: 'getLivingEnd',
        args: ['$0']
      }
    ]
  },
  // 播放器
  comWapPlayer: {
    component: 'VmpWapPlayer',
    emitCheckAuth: [
      //权限验证
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
    ],
    // emitPlayerStatus: [
    //   {
    //     cuid: 'comWapCenter',
    //     method: 'updatePlayStatus',
    //     args: ['$0']
    //   }
    // ],
    emitPlayerQuality: [
      {
        cuid: 'comHeaderWatch',
        method: 'getQualitys',
        args: ['$0', '$1']
      }
    ],
    // emitPlayerOtherOptions: [
    //   {
    //     cuid: 'comHeaderWatch',
    //     method: 'getPlayerOtherOptions',
    //     args: ['$0']
    //   }
    // ],
    emitPlayerPoster: [
      // 设置文档是否被覆盖
      {
        cuid: 'comWapCenter',
        method: 'setDocContainerCovered',
        args: ['$0']
      },
      // 设置文档是否被覆盖
      {
        cuid: 'comDocWap',
        method: 'setDocContainerCovered',
        args: ['$0']
      }
    ],
    emitPlayerOpenQuality: [
      // 设置文档是否被覆盖
      {
        cuid: 'comHeaderWatch',
        method: 'openQualityCard',
        args: ['$0']
      }
    ],
    emitPlayerSpeed: [
      {
        cuid: 'comHeaderWatch',
        method: 'getSpeeds',
        args: ['$0', '$1']
      }
    ],
    emitPlayerOpenSpeed: [
      // 设置文档是否被覆盖
      {
        cuid: 'comHeaderWatch',
        method: 'openSpeedCard',
        args: ['$0']
      }
    ],
    emitPlayerWebinarsBgImg: [
      // 获取回放结束图片背景
      {
        cuid: 'comWapCenter',
        method: 'getWebinarsBgImgVod',
        args: ['$0']
      }
    ],
    emitPlayerVodEnd: [
      // 回放结束标识
      {
        cuid: 'comWapCenter',
        method: 'getVodEnd',
        args: ['$0']
      }
    ],
    emitPlayerIsSmallPlayer: [
      // 小窗标识
      {
        cuid: 'comWapCenter',
        method: 'getIsSmallPlayer',
        args: ['$0']
      }
    ],
    emitPlayerAudioStatus: [
      //选中清晰度是否是音频模式
      {
        cuid: 'comWapCenter',
        method: 'getAudioStatus',
        args: ['$0']
      }
    ],
    emitPlayerPosterAudio: [
      // 音频模式 封面
      {
        cuid: 'comWapCenter',
        method: 'getAudioPlayerPoster',
        args: ['$0']
      }
    ]
    // emitPlayerIsAudio: [
    //   //判断是否是音频直播模式
    //   {
    //     cuid: 'comWapCenter',
    //     method: 'getIsAudio',
    //     args: ['$0']
    //   }
    // ]
  },
  comWapStreamList: {
    component: 'VmpWapStreamList',
    children: ['comWapStreamLocal'],
    emitStreamListPoster: [
      // 设置文档是否被覆盖
      {
        cuid: 'comWapCenter',
        method: 'setDocContainerCovered',
        args: ['$0']
      }
    ],
    emitPlayerPosterAudio: [
      // 音频模式 封面
      {
        cuid: 'comWapCenter',
        method: 'getAudioPlayerPoster',
        args: ['$0']
      }
    ]
    // emitStreamShowPlayIcon: [
    //   // 设置流组件显示播放按钮
    //   {
    //     cuid: 'comWapCenter',
    //     method: 'updatePlayStatus',
    //     args: ['$0']
    //   }
    // ]
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
    children: ['comChatWap', 'comChatClearScreen']
  },
  comBodyBlock: {
    component: 'VmpConciseBodyBlockWap'
  },
  comWapCenter: {
    component: 'VmpConciseCenterWap',
    children: ['comDocWap'],
    emitDocCancleZoom: [
      {
        cuid: 'comDocWap',
        method: 'cancelZoom'
      }
    ],
    emitDocResize: [
      {
        cuid: 'comDocWap',
        method: 'resize'
      }
    ],
    emitPlayerPlay: [
      {
        cuid: 'comWapPlayer',
        method: 'play'
      }
    ],
    emitPlayerPause: [
      {
        cuid: 'comWapPlayer',
        method: 'pause'
      }
    ],
    emitStreamPlay: [
      {
        cuid: 'comWapStreamList',
        method: 'replayPlay'
      }
    ],
    emitDocContainerStickTop: [
      {
        cuid: 'comDocWap',
        method: 'setDocContainerStickTop',
        args: ['$0']
      }
    ]
  },
  comTabMenuWap: {
    component: 'VmpTabMenuWap',
    options: {
      /**
       * 菜单配置不是最终的显示，而是较全的配置表，具体显示要结合接口具体给过来哪些数据
       * 此配置主要涉及到type对应哪个cuid
       */
      menuConfig: [
        { type: 1, cuid: 'comCustomMenuWap', text: '' }, //自定义菜单
        // { type: 2, cuid: 'comDocWap', text: 'menu.menu_1001', visible: false }, //文档
        // { type: 3, cuid: 'comChatWap', text: 'menu.menu_1002' }, // 聊天
        { type: 'private', cuid: 'comPrivateChatWap', text: 'common.common_1008' }, // 私聊
        { type: 4, cuid: 'comIntroWap', text: 'menu.menu_1003' }, // 简介
        { type: 5, cuid: 'comGoodSaasWap', text: 'menu.menu_1004' }, // 商品
        { type: 6, cuid: 'comRecommendWap', text: 'menu.menu_1005' }, // 广告、推荐
        { type: 7, cuid: 'comChapterWap', text: 'menu.menu_1013' }, // 章节
        { type: 8, cuid: 'comMemberListWap', text: '' }, // 成员列表
        { type: 'v5', cuid: 'comQa', text: 'common.common_1004' } // 问答
      ]
    },
    emitVisibleMenuLength: [
      {
        cuid: ['comInteractToolsWap'],
        method: 'setVisibleMenuLength',
        args: ['$0']
      }
    ],
    emitVisibleGood: [
      {
        cuid: ['comInteractToolsWap'],
        method: 'getVisibleGood',
        args: ['$0']
      }
    ]
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
  // 文档组件
  comDocWap: {
    component: 'VmpDocWap',
    emitShowMenuTab: {
      cuid: ['comTabMenuWap'],
      method: 'changeDocStatus',
      args: ['$0']
    },
    emitDocRotate: {
      cuid: ['comWapBody'],
      method: 'rotatePlayer',
      args: ['$0']
    },
    emitDocScreen: {
      cuid: ['comWapPlayer'],
      method: 'getDocScreen',
      args: ['$0']
    },
    children: ['comInteractToolsWap'],
    options: {}
  },
  // 互动工具组件
  comInteractToolsWap: {
    component: 'VmpInteractToolsWap',
    emitNeedLogin: {
      cuid: ['compRegLoginWap'],
      method: 'open'
    },
    children: ['comWapMenuDialog', 'comGoodSaasWap']
  },
  // 自定义菜单-简洁mosh
  comWapMenuDialog: {
    component: 'VmpWapMenuDialog',
    emitComputedMenuWidth: [
      {
        cuid: ['comTabMenuWap'],
        method: 'menuDialogComputed'
      }
    ],
    emitOpenMenu: [
      {
        cuid: ['comWapPlayer'],
        method: 'changeChatSendBox',
        args: ['$0']
      }
    ],
    children: ['comTabMenuWap'],
    options: {}
  },
  // 聊天区清屏组件
  comChatClearScreen: {
    component: 'VmpClearScreen',
    className: 'vmp-chat-wap-concise__clearscreen'
  },
  // 聊天
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
    // 聊天输入框是否显示
    emitChangeChatSendBox: [
      {
        cuid: ['comWapPlayer'],
        method: 'changeChatSendBox',
        args: ['$0']
      },
      {
        cuid: ['comDocWap'],
        method: 'changeChatSendBox',
        args: ['$0']
      }
    ],
    emitSetHideEffect: [
      {
        cuid: 'comWapRewardEffect',
        method: 'setHideEffect',
        args: ['$0']
      },
      {
        cuid: 'comWapRewardEffectSVGA',
        method: 'setHideEffect',
        args: ['$0']
      }
    ],
    emitClickExamRankChatItem: {
      cuid: ['comExamRankWap'],
      method: 'open',
      args: ['$0', '$1']
    },
    emitClickExamChatItem: {
      cuid: ['comExamWap'],
      method: 'open',
      args: ['$0', '$1', '$2']
    },
    children: [
      'comInteractToolsWap',
      'comWapRewardEffect',
      'comWapRewardEffectSVGA',
      'comWapMenuDialog'
    ],
    options: {}
  },
  // 礼物动画组件
  comWapRewardEffect: {
    component: 'VmpConciseWapRewardEffect'
  },
  // 礼物动画组件-SVGA
  comWapRewardEffectSVGA: {
    component: 'VmpWapRewardEffectFullScreen'
  },
  // 私聊组件
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
    },
    emitShowGoodsTab: {
      cuid: ['comTabMenuWap'],
      method: 'setVisible',
      args: ['$0']
    }
  },
  // 推荐组件
  comRecommendWap: {
    component: 'VmpRecommendWap'
  },
  // // 章节组件
  comChapterWap: {
    component: 'VmpChapterWap'
  },
  // 成员列表组件
  comMemberListWap: {
    component: 'VmpMemberListWap'
  },
  // 问答组件
  comQa: {
    component: 'VmpQaWap',
    emitClickLogin: [
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
  },
  // 右侧浮动容器
  comContainerRight: {
    component: 'VmpContainerRightWap',
    children: [
      'comSignWap',
      'comWatchTimer',
      'comLotteryWap',
      'comRedPacketCommandWap',
      'comQuestionnaireWap',
      'comExamWap',
      'comExamRankWap',
      'comExamScoreWap'
    ], //支付问题暂时屏蔽红包，口令红包替代
    // 打开计时器
    emitOpenTimer: {
      cuid: ['comWatchTimer'],
      method: 'handleTimer'
    },
    // 计时器
    emitOpenSign: {
      cuid: ['comSignWap'],
      method: 'openSign'
    },
    // 打开红包
    emitOpenRedPacket: {
      cuid: ['comRedPacketCommandWap'],
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
    },
    // 打开问卷弹窗
    emitOpenQa: {
      cuid: ['comWapPlayer'],
      method: 'changeQaVisible',
      args: ['$0']
    },
    // 快问快答弹窗 - 查看成绩
    emitClickExamIconScore: {
      cuid: ['comExamScoreWap'],
      method: 'open',
      args: ['$0', '$1']
    },
    // 快问快答弹窗 - 答题
    emitClickExamIcon: {
      cuid: ['comExamWap'],
      method: 'open',
      args: ['$0', '$1', '$2']
    },
    // 调整列表状态
    emitExamVisible: [
      {
        cuid: 'comWapCenter',
        method: 'setDocContainerStickTop',
        args: ['$0']
      },
      {
        cuid: 'comWapBody',
        method: 'examVisible',
        args: ['$0', '$1']
      },
      {
        cuid: 'comNoticeWap',
        method: 'examVisible',
        args: ['$0']
      }
    ]
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
  //旧版红包
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
        cuid: 'comWapCenter',
        method: 'setDocContainerStickTop',
        args: ['$0']
      },
      {
        cuid: 'comWapBody',
        method: 'questionnaireVisible',
        args: ['$0']
      },
      {
        cuid: 'comNoticeWap',
        method: 'questionnaireVisible',
        args: ['$0']
      }
    ]
  },
  // 公告横幅
  comNoticeWap: {
    component: 'VmpNoticeWap'
  },
  // 弹窗集合
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
  //口令 红包
  comRedPacketCommandWap: {
    component: 'VmpRedPacketCommandWap',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ]
  },
  // 快问快答 - 排行榜
  comExamRankWap: {
    component: 'VmpExamRankWap',
    emitExamVisible: [
      {
        cuid: 'comWapCenter',
        method: 'setDocContainerStickTop',
        args: ['$0']
      },
      {
        cuid: 'comWapBody',
        method: 'examVisible',
        args: ['$0', '$1']
      },
      {
        cuid: 'comNoticeWap',
        method: 'examVisible',
        args: ['$0']
      }
    ]
  },
  // 快问快答 - 问答
  comExamAnswerWap: {
    component: 'VmpExamAnswerWap'
  },
  // 快问快答 - 用户收集
  comExamCollectWap: {
    component: 'VmpExamCollectWap'
  },
  // 快问快答 - 成绩
  comExamScoreWap: {
    component: 'VmpExamScoreWap'
  },
  // 快问快答 - 预览
  comExamPreviewWap: {
    component: 'VmpExamPreviewWap'
  },
  // 快问快答 - 入口
  comExamWap: {
    component: 'VmpExamWap',
    emitExamAnswerOpenWap: [
      {
        cuid: 'comExamAnswerWap',
        method: 'open',
        args: ['$0']
      }
    ],
    emitExamCollectOpenWap: [
      {
        cuid: 'comExamCollectWap',
        method: 'open',
        args: ['$0']
      }
    ],
    emitExamVisible: [
      {
        cuid: 'comWapCenter',
        method: 'setDocContainerStickTop',
        args: ['$0']
      },
      {
        cuid: 'comWapBody',
        method: 'examVisible',
        args: ['$0', '$1']
      },
      {
        cuid: 'comNoticeWap',
        method: 'examVisible',
        args: ['$0']
      }
    ],
    children: ['comExamCollectWap', 'comExamAnswerWap']
  }
};
