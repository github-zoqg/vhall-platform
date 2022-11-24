/**
 * pc观看端主直播页面配置
 */
export default {
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: ['comHeaderWatch', 'layerBody', 'layerFooter', 'comAllDialog', 'comGoodsDetailPc']
  },
  // 顶部header组件
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
  // 语言选择组件
  compLanguageChoice: {
    component: 'VmpLanguageChoice',
    options: {
      choices: [
        { value: 'zh', label: 'language_choice.language_choice_1001' },
        { value: 'en', label: 'language_choice.language_choice_1002' }
      ]
    }
  },
  // 中间主区域容器
  layerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['layerBodyCenter', 'layerBodyRight']
  },
  layerBodyCenter: {
    component: 'VmpBasicCenterContainer',
    children: ['layerBodyCenterHeader', 'layerBodyCenterMain']
  },
  layerBodyCenterHeader: {
    component: 'VmpAirContainer',
    children: ['comStreamList']
  },
  // 流列表
  comStreamList: {
    component: 'VmpStreamList',
    children: ['comStreamLocal', 'comStreamRemote']
  },
  // 本地流
  comStreamLocal: {
    component: 'VmpStreamLocal',
    initPlayer: {
      cuid: 'comPcPlayer',
      method: 'getWebinerStatus',
      args: ['$0']
    }
  },
  // 远端流
  comStreamRemote: {
    component: 'VmpStreamRemote'
  },
  // 中间主区域内容
  layerBodyCenterMain: {
    component: 'VmpBasicCenterMain',
    children: [
      'comPcPlayer',
      'comWatchAsideMenu',
      'comDocUne',
      'comDesktopScreen',
      'comInsertStream',
      'comFooterTools',
      'comNoticeColumn',
      'comLivingEnd'
    ]
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
  // 分组直播侧边菜单（仅分组直播使用）
  comWatchAsideMenu: {
    component: 'VmpWatchAsideMenu',
    handleClickDoc: [
      {
        cuid: ['comDocUne'],
        method: 'switchTo',
        args: ['$0']
      }
    ],
    handleClickDesktopScreen: [
      {
        cuid: 'comDesktopScreen',
        method: 'showConfirm',
        args: ['$0']
      }
    ],
    // 触发画笔重置
    emitDocResetBrush: [
      {
        cuid: 'comDocUne',
        method: 'resetCurrentBrush'
      }
    ]
  },
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    emitOpenDocList: {
      cuid: 'dlgDocList',
      method: 'show'
    }
  },
  // 桌面共享组件
  comDesktopScreen: {
    component: 'VmpStreamDesktopScreen',
    emitClickExchangeView: {
      cuid: 'comPcPlayer',
      method: 'exchangeVideoDocs'
    },
    emitClickEndDemonstrate: [
      {
        cuid: 'comDocUne',
        method: 'handleEndDemonstrate'
      }
    ]
  },
  // 插播流
  comInsertStream: {
    component: 'VmpInsertStream'
  },
  // 底部工具栏（如人数， 热度等）
  comFooterTools: {
    component: 'VmpFooterTools',
    children: [
      'comSignWatch',
      'comWatchTimer',
      'comQuestionnaire',
      'comLottery',
      'comRedPacketCommand',
      'comExam',
      'comExamRank',
      'comExamScore'
    ],
    // 打开媒体设置
    emitClickMediaSetting: {
      cuid: 'comMediaSetting',
      method: 'showMediaSetting'
    },
    // 打开摄像头检测
    emitClickCameraCheck: {
      cuid: 'comCameraCheck',
      method: 'showCameraCheck'
    },
    // 打开报名表单
    emitClickOpenSignUpForm: {
      cuid: 'comSignUpForm',
      method: 'openModal'
    },
    //打开计时器组件
    emitOpenTimer: {
      cuid: ['comWatchTimer'],
      method: 'handleTimer'
    },
    // 打开登陆弹窗
    emitNeedLogin: {
      cuid: ['compRegLogin'],
      method: 'open'
    },
    // 抽奖弹窗
    emitClickLotteryIcon: {
      cuid: ['comLottery'],
      method: 'handleClickIcon'
    },
    // 提交中奖信息
    emitTakeAward: {
      cuid: ['comLottery'],
      method: 'handleTakeAward',
      args: ['$0']
    },
    // 红包弹窗
    emitClickRedPacketIcon: {
      cuid: ['comRedPacketCommand'], //先替换成口令红包 comRedPacket
      method: 'openRedPacket',
      args: ['$0']
    },
    // 问卷弹窗
    emitClickQuestionIcon: {
      cuid: ['comQuestionnaire'],
      method: 'open',
      args: ['$0']
    },
    // 快问快答弹窗 - 查看成绩
    emitClickExamIconScore: {
      cuid: ['comExamScore'],
      method: 'open',
      args: ['$0', '$1']
    },
    // 快问快答弹窗 - 答题
    emitClickExamIcon: {
      cuid: ['comExam'],
      method: 'open',
      args: ['$0', '$1']
    },
    // 关闭视频轮训弹窗
    emitClosePollingDialog: {
      cuid: 'comStreamLocal',
      method: 'closePollingDialog'
    }
  },

  comSignWatch: {
    component: 'VmpSignWatch'
  },
  // 互动工具计时器
  comWatchTimer: {
    component: 'VmpWatchTimer',
    emitChangeTimer: {
      cuid: ['comFooterTools'],
      method: 'changeStatus',
      args: ['$0', '$1']
    }
  },
  // 问卷
  comQuestionnaire: {
    component: 'VmpQuestionnaireWatch',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 抽奖
  comLottery: {
    component: 'VmpLotteryWatch',
    emitClickLogin: [
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 红包
  comRedPacket: {
    component: 'VmpRedPacketWatch',
    emitClickLogin: [
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 公告
  comNoticeColumn: {
    component: 'VmpNoticeColumn'
  },
  // 结束
  comLivingEnd: {
    component: 'VmpLivingEnd'
  },
  layerBodyRight: {
    component: 'VmpBasicRightContainer',
    children: ['comPcRewardEffect', 'comTabMenu', 'comPcRewardEffectFullScreen']
  },
  // 礼物动画组件
  comPcRewardEffect: {
    component: 'VmpPcRewardEffect'
  },
  comTabMenu: {
    component: 'VmpTabMenu',
    options: {
      // 是否展示左右按钮
      isToggleBtnVisible: true,
      /**
       * 菜单配置不是最终的显示，而是较全的配置表，具体显示要结合接口具体给过来哪些数据
       * 此配置主要涉及到type对应哪个cuid
       * watch观看端tab不展示文档
       */
      menuConfig: [
        { type: 1, cuid: 'comCustomMenu', text: '' }, //自定义菜单
        { type: 3, cuid: 'comChat', text: 'menu.menu_1002' }, // 聊天
        { type: 'private', cuid: 'comWatchPrivateChat', text: 'common.common_1008' }, // 私聊
        { type: 'notice', cuid: 'comNotice', text: '公告' },
        { type: 4, cuid: 'comIntro', text: 'menu.menu_1003' }, // 简介
        { type: 5, cuid: 'comGoodSaas', text: 'menu.menu_1004' }, // 商品
        { type: 6, cuid: 'comRecommend', text: 'menu.menu_1005' }, // 广告、推荐
        { type: 7, cuid: 'comChapter', text: 'menu.menu_1013' }, // 章节
        { type: 8, cuid: 'comMemberList', text: '成员' }, // 成员
        { type: 'v5', cuid: 'comQa', text: 'common.common_1004' } //问答
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
  // 聊天
  comChat: {
    component: 'VmpChat',
    options: {
      //是否有图片上传按钮【聊天区域底部操作栏--上传图片】
      hasImgUpload: false,
      //是否有聊天过滤按钮【聊天区域底部操作栏--屏蔽特效,只看主办方】
      hasChatFilterBtn: true,
      //是否开启聊天设置功能
      enableChatSetting: false,
      //操作用户消息的弹窗配置【消息区域--左键单击用户头像，可以回复，@，禁言，删除消息，踢出人员等】
      userControlOptions: {
        enable: false
      }
    },
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ],
    emitClickLotteryChatItem: {
      cuid: ['comLottery'],
      method: 'accept',
      args: ['$0']
    },
    emitClickQuestionnaireChatItem: {
      cuid: ['comQuestionnaire'],
      method: 'open',
      args: ['$0']
    },
    emitHideEffect: {
      cuid: 'comPcRewardEffect',
      method: 'setHideEffect',
      args: ['$0']
    },
    emitHideEffectFullScreen: {
      cuid: 'comPcRewardEffectFullScreen',
      method: 'setHideEffect',
      args: ['$0']
    },
    emitClickExamRankChatItem: {
      cuid: ['comExamRank'],
      method: 'open',
      args: ['$0']
    },
    emitClickExamChatItem: {
      cuid: ['comExam'],
      method: 'open',
      args: ['$0', '$1']
    }
  },
  // 私聊
  comWatchPrivateChat: {
    component: 'VmpWatchPrivateChat',
    options: {},
    emitClickLogin: [
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 简介
  comIntro: {
    component: 'VmpIntro'
  },
  // 商品
  comGoodSaas: {
    component: 'VmpGoodList',
    emitShowDetail: {
      cuid: ['comGoodsDetailPc'],
      method: 'open',
      args: ['$0']
    },
    emitShowGoodsTab: {
      cuid: ['comTabMenu'],
      method: 'setVisible',
      args: ['$0']
    }
  },
  // 推荐
  comRecommend: {
    component: 'VmpRecommend'
  },
  // 章节
  comChapter: {
    component: 'VmpChapter',
    emitChangePlayTime: {
      cuid: ['comPcPlayer'],
      method: 'changePlayTime',
      args: ['$0']
    }
  },
  // 成员列表
  comMemberList: {
    component: 'VmpMemberList',
    options: {
      //平台类型，pc发起:live,pc观看：watch,手机端观看：wap
      platformType: 'watch'
    }
  },
  // 问答
  comQa: {
    component: 'VmpQa',
    emitClickLogin: [
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 全屏礼物动画组件
  comPcRewardEffectFullScreen: {
    component: 'VmpPcRewardEffectFullScreen'
  },
  layerFooter: {
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
  // 文档列表对话框
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
  // 登录注册组件
  compRegLogin: {
    component: 'VmpRegLogin'
  },
  // 公众号
  comOfficial: {
    component: 'VmpOfficialPc'
  },
  // 分享
  comShare: {
    component: 'VmpShare',
    options: {
      isInviteShare: true //分享是否展示邀请卡
    }
  },
  // 授权
  comWatchAuth: {
    component: 'VmpWatchAuth',
    emitClickOpenSignUpForm: {
      cuid: 'comSignUpForm',
      method: 'openModal'
    }
  },
  // 报名表单
  comSignUpForm: {
    component: 'VmpSignUpForm',
    options: {}
  },
  // 用户资料组件
  comUserAccount: {
    component: 'VmpUserAccount'
  },
  // 用户资料组件
  comCash: {
    component: 'VmpCash'
  },
  // 开屏页
  comScreenPost: {
    component: 'VmpScreenPost'
  },
  // 媒体设置
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
  //
  comWatchPayFee: {
    component: 'VmpWatchPayFee'
  },
  // 邀请上麦弹窗
  comMicInvited: {
    component: 'VmpMicInvited',
    emitAgreeInvite: [
      {
        cuid: 'comStreamLocal',
        method: 'updateAutoSpeak'
      }
    ]
  },
  // 摄像头检测及设置
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
  // 商品详情
  comGoodsDetailPc: {
    component: 'VmpGoodDetailPc'
  },
  // 红包-口令
  comRedPacketCommand: {
    component: 'VmpRedPacketCommandWatch',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 快问快答 - 排行榜
  comExamRank: {
    component: 'VmpExamRank'
  },
  // 快问快答 - 问答
  comExamAnswer: {
    component: 'VmpExamAnswer'
  },
  // 快问快答 - 用户收集
  comExamCollect: {
    component: 'VmpExamCollect'
  },
  // 快问快答 - 成绩
  comExamScore: {
    component: 'VmpExamScore'
  },
  // 快问快答 - 预览
  comExamPreview: {
    component: 'VmpExamPreview'
  },
  // 快问快答 - 入口
  comExam: {
    component: 'VmpExamPc',
    emitExamAnswerOpen: [
      {
        cuid: 'comExamAnswer',
        method: 'open',
        args: ['$0']
      }
    ],
    emitExamCollectOpen: [
      {
        cuid: 'comExamCollect',
        method: 'open',
        args: ['$0']
      }
    ],
    children: ['comExamCollect', 'comExamAnswer']
  }
};
