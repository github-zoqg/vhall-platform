export const globalConfig = {
  lang: 'zh'
};

// 服务配置
export const serverConfig = {
  /*** 布局定义start */
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: ['comHeaderWatch', 'layerBody', 'layerFooter', 'comAllDialog', 'comQuestionnaire']
    // children: ['layerBody']
  },
  // 顶部header 容器嵌入不用这个组件
  layerHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['comHeaderWatch']
  },
  // 中间主区域容器
  layerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['layerBodyCenter', 'layerBodyRight']
  },
  // 底部主区域容器
  layerFooter: {
    component: 'VmpFooter',
    className: 'vmp-footer'
  },
  layerBodyCenter: {
    component: 'VmpBasicCenterContainer',
    children: ['layerBodyCenterHeader', 'layerBodyCenterMain']
  },
  layerBodyCenterHeader: {
    component: 'VmpAirContainer',
    children: ['comStreamList']
  },
  layerBodyCenterMain: {
    component: 'VmpBasicCenterMain',
    children: [
      'comPcPlayer',
      'comWatchAsideMenu',
      'comDocUne',
      'comDesktopScreen',
      'comFooterTools',
      'comNoticeColumn',
      'comLivingEnd'
    ]
  },
  layerBodyRight: {
    component: 'VmpBasicRightContainer',
    children: ['comPcRewardEffect', 'comTabMenu']
  },
  /*** 布局定义end */

  /*** 所有弹窗集合 */
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
      'comLottery',
      'comScreenPost',
      'comMediaSetting',
      'comWatchPayFee',
      'comRedPacket',
      'comMicInvited'
    ]
  },

  comTabMenu: {
    component: 'VmpTabMenu',
    options: {
      // 是否展示左右按钮
      isToggleBtnVisible: true,
      /**
       * 菜单配置不是最终的显示，而是较全的配置表，具体显示要结合接口具体给过来哪些数据
       * 此配置主要涉及到type对应哪个cuid
       */
      menuConfig: [
        { type: 1, cuid: 'comCustomMenu', text: '' }, //自定义菜单
        { type: 2, cuid: 'comDoc', text: 'menu.menu_1001', visible: false }, // 文档
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

  /**** 组件定义 */
  // 自定义菜单
  comCustomMenu: {
    component: 'VmpCustomMenu'
  },

  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    options: {
      keepAspectRatio: false,
      hasPager: false
    },
    // 打开对话框
    emitOpenDocList: {
      cuid: 'dlgDocList',
      method: 'show'
    }
  },
  //文档列表对话框
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
  // 分组直播侧边菜单
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
    ]
  },
  comStreamList: {
    component: 'VmpStreamList',
    children: ['comStreamLocal', 'comStreamRemote']
  },
  comStreamLocal: {
    component: 'VmpStreamLocal',
    initPlayer: {
      cuid: 'comPcPlayer',
      method: 'getWebinerStatus'
    }
  },
  comStreamRemote: {
    component: 'VmpStreamRemote'
  },
  // 桌面共享组件
  comDesktopScreen: {
    component: 'VmpStreamDesktopScreen'
  },
  // 播放器
  comPcPlayer: {
    component: 'VmpPcPlayer',
    emitClickAuth: [
      // 权限弹窗
      {
        cuid: 'comWatchAuth',
        method: 'openAuthDialog',
        args: ['$0']
      }
    ],
    emitClickPay: [
      // 权限付费弹窗
      {
        cuid: 'comWatchPayFee',
        method: 'openPayFee',
        args: ['$0']
      }
    ],
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 结束页面
  comLivingEnd: {
    component: 'VmpLivingEnd'
  },
  // 顶部
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
        method: 'openOfficial'
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
      //弹出个人资料
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
        {
          value: 'zh',
          label: 'language_choice.language_choice_1001'
        },
        {
          value: 'en',
          label: 'language_choice.language_choice_1002'
        }
      ]
    }
  },
  comShare: {
    component: 'VmpShare',
    options: {
      isInviteShare: true //分享是否展示邀请卡
    }
  },
  comUserAccount: {
    component: 'VmpUserAccount'
  },
  comCash: {
    component: 'VmpCash'
  },
  comWatchNavMenu: {
    component: 'VmpWatchNavMenu'
  },
  // 底部
  comFooter: {
    component: 'VmpFooter'
  },
  // 底部工具栏（如人数， 热度等）
  comFooterTools: {
    component: 'VmpFooterTools',
    //TODO: 后续正式的需要调整或移除，此处仅为测试配置
    // 打开媒体设置
    emitClickMediaSetting: {
      cuid: 'comMediaSetting',
      method: 'showMediaSetting'
    },
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
      method: 'open'
    },
    children: ['comSignWatch', 'comWatchTimer']
  },
  comSignWatch: {
    component: 'VmpSignWatch'
  },
  comNoticeColumn: {
    component: 'VmpNoticeColumn'
  },
  comWatchAuth: {
    component: 'VmpWatchAuth',
    emitClickOpenSignUpForm: {
      cuid: 'comSignUpForm',
      method: 'openModal'
    }
  },
  comWatchPayFee: {
    component: 'VmpWatchPayFee'
  },
  //聊天组件
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
    }
  },
  //成员列表组件
  comMemberList: {
    component: 'VmpMemberList',
    options: {
      //平台类型，pc发起:live,pc观看：watch,手机端观看：wap
      platformType: 'watch'
    }
  },
  //私聊组件
  comWatchPrivateChat: {
    component: 'VmpWatchPrivateChat',
    options: {},
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  //报名表单
  comSignUpForm: {
    component: 'VmpSignUpForm',
    options: {}
  },
  // 登录注册组件
  compRegLogin: {
    component: 'VmpRegLogin'
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
  //商品列表
  comGoodSaas: {
    component: 'VmpGoodList'
  },
  // 抽奖
  comLottery: {
    component: 'VmpLotteryWatch',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
  },
  // 开屏页
  comScreenPost: {
    component: 'VmpScreenPost'
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
  // 礼物动画组件
  comPcRewardEffect: {
    component: 'VmpPcRewardEffect'
  },
  // 推荐
  comRecommend: {
    component: 'VmpRecommend'
  },
  comIntro: {
    component: 'VmpIntro'
  },
  comQa: {
    component: 'VmpQa',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
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

  // 预约页面配置
  layerSubscribeRoot: {
    component: 'VmpAirContainer',
    children: ['layerSubscribeHeader', 'layerSubscribeBody', 'layerSubscribeFooter', 'comAllDialog']
  },
  // 顶部header容器
  layerSubscribeHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['comHeaderWatch']
  },
  // 中间主区域容器
  layerSubscribeBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['comVmpSubscribeBody']
  },
  // 底部主区域容器
  layerSubscribeFooter: {
    component: 'VmpFooter',
    className: 'vmp-footer'
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
    emitClickPay: [
      // 权限弹窗
      {
        cuid: 'comWatchPayFee',
        method: 'openPayFee',
        args: ['$0']
      }
    ],
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
        { type: 1, cuid: 'comCustomMenu', text: '' }, //自定义菜单
        { type: 4, cuid: 'comIntro', text: 'menu.menu_1003' }, // 简介
        { type: 5, cuid: 'comGoodSaas', text: 'menu.menu_1004' }, // 商品
        { type: 6, cuid: 'comRecommend', text: 'menu.menu_1005' } // 广告、推荐
      ]
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

  // 红包
  comRedPacket: {
    component: 'VmpRedPacketWatch'
  },
  // 邀请上麦弹窗
  comMicInvited: {
    component: 'VmpMicInvited'
  }
};
