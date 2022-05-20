/**
 * 直播间页面(主页面)配置
 */
export default {
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: ['layerHeader', 'layerBody', 'comAllDialog'],
    checkStartPush: [
      {
        cuid: 'comStreamLocal',
        method: 'checkStartPush'
      }
    ]
  },
  // 顶部header容器
  layerHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['pannelHeaderLeft', 'pannelHeaderRight']
  },
  // 中间主区域容器
  layerBody: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-basic-bd'
    },
    children: ['layerBodyLeft', 'layerBodyCenter', 'layerBodyRight']
  },
  layerBodyLeft: {
    component: 'VmpContainer',
    className: 'vmp-basic-left',
    children: ['comAsideMenu']
  },
  layerBodyCenter: {
    component: 'VmpContainer',
    className: 'vmp-basic-center',
    children: [
      'comStreamList',
      'layerBodyCenterBottom',
      'comGroupDiscussion',
      'comThirdStream',
      'comRebroadcastSteam'
    ]
  },
  layerBodyCenterBottom: {
    component: 'VmpContainer',
    className: 'vmp-basic-center-bottom',
    children: ['comInsertStream', 'comDesktopScreen', 'comDocUne']
  },
  layerBodyRight: {
    component: 'VmpContainer',
    className: 'vmp-basic-right',
    children: ['layerBodyRightHeader', 'layerBodyRightBody']
  },
  layerBodyRightHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__hd'
  },
  layerBodyRightBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__bd',
    children: ['comPcRewardEffect', 'comTabMenu']
  },
  /*** 布局定义end */

  comTabMenu: {
    component: 'VmpTabMenu',
    options: {
      /**
       * 菜单配置不是最终的显示，而是较全的配置表，具体显示要结合接口具体给过来哪些数据
       * 此配置主要涉及到type对应哪个cuid
       */
      menuConfig: [
        { type: 1, cuid: 'comCustomMenu', text: '' }, //自定义菜单
        { type: 2, cuid: 'comDoc', text: 'menu.menu_1001', visible: false }, // 文档(默认隐藏)
        { type: 3, cuid: 'comChat', text: 'menu.menu_1002' }, // 聊天
        { type: 'notice', cuid: 'comNotice', text: '公告' },
        // { type: 4, cuid: 'comIntro', text: 'menu.menu_1003' }, // 简介
        { type: 5, cuid: 'comGoodSaas', text: 'menu.menu_1004' }, // 商品
        { type: 6, cuid: 'comRecommend', text: 'menu.menu_1005' }, // 广告、推荐
        { type: 7, cuid: 'comChapter', text: 'menu.menu_1013' }, // 章节
        { type: 8, cuid: 'comMemberList', text: '成员' }, // 成员
        { type: 'v5', cuid: 'comQa', text: 'common.common_1004' } //问答
      ]
    }
  },

  /*** 所有弹窗集合 */
  comAllDialog: {
    component: 'VmpAirContainer',
    children: [
      'dlgDocList',
      'comShare',
      'comVirtualPeople',
      'comLivePrivateChat',
      'comMediaSetting',
      'comPcMediaCheck',
      'liveTimerSet',
      'liveTimer',
      'comRebroadcast',
      'comRebroadcastList',
      'comMicInvited'
    ]
  },

  /**** 组件定义 */
  // 顶部左侧容器
  pannelHeaderLeft: {
    component: 'VmpAirContainer',
    children: ['compHeaderLeft']
  },
  // 顶部右侧容器
  // pannelHeaderRight: {
  //   component: 'VmpContainer',
  //   className: 'vmp-header-right',
  //   children: ['compLanguageChoice']
  // },
  // // 顶部右侧容器
  pannelHeaderRight: {
    component: 'VmpHeaderRight',
    emitVirtualClick: [
      {
        cuid: 'comVirtualPeople',
        method: 'openVirtualDialog',
        args: [{ type: 1 }]
      }
    ],
    emitClickStartLive: [
      {
        cuid: 'comStreamLocal',
        method: 'startPushOnce'
      }
    ],
    // emitClickEndLive: [ // 不再派发结束推流事件, 结束推流是监听直播结束消息
    //   {
    //     cuid: 'comStreamLocal',
    //     method: 'stopPush'
    //   }
    // ],
    emitMediaSettingClick: [
      {
        cuid: 'comMediaSetting',
        method: 'showMediaSetting'
      }
    ],
    emitClickThirdStream: [
      {
        cuid: 'comThirdStream',
        method: 'showThirdStream',
        args: ['$0']
      }
    ],
    emitClickCheckStartPush: [
      {
        cuid: 'comStreamLocal',
        method: 'checkStartPush'
      }
    ]
  },
  // 顶部左侧组件
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 左侧导航菜单
  comAsideMenu: {
    component: 'VmpAsideMenu',
    children: [
      'comDocMenu',
      'comWbMenu',
      'comShareDesktopMenu',
      'comMediaPlayMenu',
      'comInteractMenu',
      'comGroupMenu',
      'comShareMenu',
      'comExitGroupMenu',
      'comLottery',
      'comSignLive',
      'comQuestionnaire',
      'comRedPacket'
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
  // 文档菜单
  comDocMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-iconfont vh-line-document',
      text: 'aside_menu.aside_menu_1000',
      kind: 'document',
      auth: 'hide-document'
    },
    handleClick: [
      {
        cuid: ['comAsideMenu', 'comDocUne'],
        method: 'switchTo',
        args: 'document'
      },
      {
        cuid: 'comGroupDiscussion',
        method: 'hiddenAll'
      },
      // 关闭第三方推流页面
      {
        cuid: 'comThirdStream',
        method: 'closeThirdStream'
      }
    ]
  },
  // 白板菜单
  comWbMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-line-whiteboard',
      text: 'aside_menu.aside_menu_1001',
      kind: 'board',
      auth: true
    },
    handleClick: [
      {
        cuid: ['comAsideMenu', 'comDocUne'],
        method: 'switchTo',
        args: 'board'
      },
      {
        cuid: 'comGroupDiscussion',
        method: 'hiddenAll'
      },
      // 关闭第三方推流页面
      {
        cuid: 'comThirdStream',
        method: 'closeThirdStream'
      }
    ]
  },
  // 桌面共享按钮
  comShareDesktopMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-a-line-Desktopsharing',
      text: 'aside_menu.aside_menu_1002',
      kind: 'desktopShare',
      auth: true
    },
    handleClick: [
      {
        cuid: 'comDesktopScreen',
        method: 'showConfirm',
        args: []
      }
    ]
  },

  // 桌面共享组件
  comDesktopScreen: {
    component: 'VmpStreamDesktopScreen',
    emitClickEndDemonstrate: [
      {
        cuid: 'comDocUne',
        method: 'handleEndDemonstrate'
      }
    ]
  },
  // 插播文件
  comMediaPlayMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-a-color-Spotfile',
      text: 'aside_menu.aside_menu_1003',
      kind: 'insertMedia',
      auth: 'waiting.video.file'
    },
    handleClick: [
      {
        cuid: 'comInsertVideoList',
        method: 'openInsertFileDialog',
        args: []
      }
    ]
  },
  // 互动工具
  comInteractMenu: {
    component: 'VmpInteractMenu',
    options: {
      kind: 'interactTool'
    },
    emitOpenTimerSet: [
      {
        cuid: ['liveTimerSet'],
        method: 'openTimerSet'
      }
    ],
    emitOpenLottery: [
      {
        cuid: ['comLottery'],
        method: 'open'
      }
    ],
    emitOpenQuestionnaire: [
      {
        cuid: ['comQuestionnaire'],
        method: 'open'
      }
    ],
    emitOpenSign: [
      {
        cuid: ['comSignLive'],
        method: 'openSign'
      }
    ],
    emitOpenRebroadcast: [
      {
        cuid: ['comRebroadcastList'],
        method: 'open'
      }
    ],
    emitOpenRedPacket: [
      {
        cuid: ['comRedPacket'],
        method: 'open'
      }
    ],
    emitHandleQa: [
      {
        cuid: ['comTabMenu'],
        method: 'setVisible',
        args: ['$0']
      }
    ]
  },
  // 互动工具-计时器设置
  liveTimerSet: {
    component: 'VmpLiveTimerSet',
    emitDisTimerIcon: [
      {
        cuid: ['comInteractMenu'],
        method: 'changeStatus',
        args: ['$0', '$1']
      }
    ]
  },
  // 互动工具-计时器
  liveTimer: {
    component: 'VmpLiveTimer',
    emitOpenTimerSet: [
      {
        cuid: ['liveTimerSet'],
        method: 'openTimerSet'
      }
    ],
    emitDisTimerIcon: [
      {
        cuid: ['comInteractMenu'],
        method: 'changeStatus',
        args: ['$0', '$1']
      }
    ]
  },

  // 分组讨论菜单
  comGroupMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-iconfont vh-line-group',
      text: 'aside_menu.aside_menu_1008',
      kind: 'group',
      auth: 'webinar.group',
      disable: true
    },
    handleClick: [
      {
        // 点击分组讨论菜单
        cuid: ['comGroupDiscussion'],
        method: 'toggle'
      }
    ]
  },
  // 分享菜单
  comShareMenu: {
    component: 'VmpIconText',
    options: {
      className: 'menu-footer',
      icon: 'vh-iconfont vh-line-share',
      text: '分享',
      kind: 'share',
      auth: 'ui.hide_share'
    },
    handleClick: [
      {
        cuid: 'comShare',
        method: 'openShareDialog'
      }
    ]
  },

  // 退出小组菜单
  comExitGroupMenu: {
    component: 'VmpIconText',
    options: {
      className: 'menu-footer',
      icon: 'vh-iconfont vh-line-exit',
      text: '退出小组',
      kind: 'exitGroup',
      hidden: true,
      auth: true
    },
    handleClick: [
      {
        cuid: 'comGroupDiscussion',
        method: 'exitGroup'
      }
    ]
  },
  //聊天组件
  comChat: {
    component: 'VmpChat',
    options: {
      //是否有图片上传按钮【聊天区域底部操作栏--上传图片】
      hasImgUpload: true,
      //是否有聊天过滤按钮【聊天区域底部操作栏--屏蔽特效,只看主办方】
      hasChatFilterBtn: false,
      //是否开启聊天设置功能
      enableChatSetting: true,
      //操作用户消息的弹窗配置【消息区域--左键单击用户头像，可以回复，@，禁言，删除消息，踢出人员等】
      userControlOptions: {
        enable: true
      }
    },
    //打开私聊弹窗
    emitOpenLivePrivateChatModal: [
      {
        cuid: 'comLivePrivateChat',
        method: 'openModal'
      }
    ]
  },
  // 礼物动画组件
  comPcRewardEffect: {
    component: 'VmpPcRewardEffect'
  },
  comNotice: {
    component: 'VmpNoticeList'
  },
  //发起端--私聊组件
  comLivePrivateChat: {
    component: 'VmpLivePrivateChat',
    options: {}
  },
  comCustomMenu: {
    component: 'VmpCustomMenu'
  },
  //成员列表组件
  comMemberList: {
    component: 'VmpMemberList',
    options: {
      //平台类型，pc发起:live,pc观看：watch,手机端观看：wap
      platformType: 'live'
    },
    emitTabTips: {
      cuid: ['comTabMenu'],
      method: 'setTipsVisible',
      args: ['$0']
    }
  },
  comQa: {
    component: 'VmpQa'
  },
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    emitSwitchTo: {
      cuid: ['comAsideMenu'],
      method: 'switchTo',
      args: ['$0'] // 获取动态参数的第一个
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
  // 上麦流列表
  comStreamList: {
    component: 'VmpStreamListLive',
    children: ['comStreamLocal']
  },
  // 远端流
  comStreamRemote: {
    component: 'VmpStreamRemote',
    emitClickExchange: [
      {
        cuid: 'ps.surface',
        method: 'exchange',
        args: ['comStreamRemote']
      }
    ]
  },
  // 本地流
  comStreamLocal: {
    component: 'VmpStreamLocal',
    // 窗口切换事件,获取配置
    exchangeCfg: [
      {
        cuid: 'comDocUne',
        kind: 'document'
      },
      {
        cuid: 'comInsertVideoList',
        kind: 'insertMedia'
      }
    ],
    // 推流完成事件
    emitClickPublishComplate: [
      {
        cuid: 'pannelHeaderRight',
        method: 'handlePublishComplate'
      }
    ],
    // 停止推流完成事件
    emitClickUnpublishComplate: [
      {
        cuid: 'pannelHeaderRight',
        method: 'handleUnpublishComplate'
      }
    ]
  },
  comShare: {
    component: 'VmpShare',
    options: {
      isInviteShare: false //分享是否展示邀请卡图标
    }
  },
  comVirtualPeople: {
    component: 'VmpVirtualPeople'
  },
  comThirdStream: {
    component: 'VmpThirdStream'
  },
  comInsertVideoList: {
    component: 'VmpInsertVideoList',
    emitInsertFileChange: [
      {
        cuid: 'comInsertStream',
        method: 'inertFileChange',
        args: ['$0', '$1']
      }
    ]
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
  comPcMediaCheck: {
    component: 'VmpPcMediaCheck'
  },
  comInsertStream: {
    component: 'VmpInsertStream',
    children: ['comInsertVideoList'],
    emitCloseInsertFileDialog: [
      {
        cuid: 'comInsertVideoList',
        method: 'closeInserVideoDialog',
        args: ['$0', '$1'] //第一个参数表示是否正在插播的状态，第二个参数表示远端插播的id
      }
    ],
    emitOpenInsertFileDialog: [
      {
        cuid: 'comInsertVideoList',
        method: 'openInsertFileDialog',
        args: []
      }
    ]
  },
  // 分组讨论组件
  comGroupDiscussion: {
    component: 'VmpGroupDiscussion',
    //触发切换
    emitToggle: {
      cuid: ['comGroupMenu'],
      method: 'setSelectedState',
      args: ['$0'] // 获取动态参数的第一个
    },
    // 触发画笔重置
    emitDocResetBrush: [
      {
        cuid: 'comDocUne',
        method: 'resetCurrentBrush'
      }
    ]
  },
  // 转播列表
  comRebroadcastList: {
    component: 'VmpRebroadcastList',
    startRebroadcast: [
      {
        cuid: 'comRebroadcastSteam',
        method: 'open'
      }
    ],
    stopRebroadcast: [
      {
        cuid: 'comRebroadcastSteam',
        method: 'close'
      }
    ],
    startPush: [
      {
        cuid: 'comStreamLocal',
        method: 'startPush'
      }
    ]
  },
  //  转播流
  comRebroadcastSteam: {
    component: 'VmpRebroadcastStream'
  },
  comRecommend: {
    component: 'VmpRecommend'
  },
  comLottery: {
    component: 'VmpLotteryLive'
  },
  comQuestionnaire: {
    component: 'VmpQuestionnaire'
  },
  comSignLive: {
    component: 'VmpSignLive'
  },
  // 红包
  comRedPacket: {
    component: 'VmpRedPacketLive'
  }
};
