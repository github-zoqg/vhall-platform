/**
 * 直播主页面配置
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
  // 顶部左侧容器
  pannelHeaderLeft: {
    component: 'VmpAirContainer',
    children: ['compHeaderLeft']
  },
  // 顶部左侧组件
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 顶部右侧容器
  pannelHeaderRight: {
    component: 'VmpHeaderRight',
    emitVirtualClick: [
      {
        cuid: 'comVirtualPeople',
        method: 'openVirtualDialog',
        args: [
          {
            type: 1
          }
        ]
      }
    ],
    emitClickStartLive: [
      {
        cuid: 'comStreamLocal',
        method: 'startPushOnce'
      }
    ],
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
    ],
    emitStartLiveSuccess: [
      {
        cuid: 'comStreamLocal',
        method: 'startLiveSuccess'
      }
    ],
    emitClickCheckValidatePullUrl: [
      {
        cuid: 'comThirdStream',
        method: 'validatePullUrl'
      }
    ],
    emitOpenShare: [
      {
        cuid: 'comShare',
        method: 'openShareDialog'
      }
    ]
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
      'comVideoPollMenu',
      'comShareMenu',
      'comExitGroupMenu',
      'comLottery',
      'comSignLive',
      'comQuestionnaire',
      'comExam',
      'comRedPacket'
    ]
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
      {
        cuid: 'comThirdStream',
        method: 'closeThirdStream'
      }
    ]
  },
  // 桌面共享菜单
  comShareDesktopMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-a-line-Desktopsharing',
      text: 'aside_menu.aside_menu_1002',
      kind: 'desktopShare',
      auth: 'desktop_share'
    },
    handleClick: [
      {
        cuid: 'comDesktopScreen',
        method: 'showConfirm',
        args: []
      }
    ]
  },
  // 插播菜单
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
  // 互动工具菜单
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
    emitOpenExam: [
      {
        cuid: ['comExam'],
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
    emitHandleQA: [
      {
        cuid: ['comQa'],
        method: 'handleQAPopup'
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
        cuid: ['comGroupDiscussion'],
        method: 'toggle'
      }
    ]
  },
  // 视频轮询菜单
  comVideoPollMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-Videoroundtour',
      text: '视频轮巡',
      kind: 'videoPolling',
      auth: 'video_polling',
      disable: true
    },
    handleClick: [
      {
        cuid: ['comVideoPollingSetting'],
        method: 'showVideoPollingSetting'
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
  // 抽奖组件
  comLottery: {
    component: 'VmpLotteryLive'
  },
  // 签到组件
  comSignLive: {
    component: 'VmpSignLive'
  },
  // 问卷组件
  comQuestionnaire: {
    component: 'VmpQuestionnaire'
  },
  // 快问快答组件
  comExam: {
    component: 'VmpExam',
    children: ['comExamPreview'],
    emitOpenPreview: [
      {
        cuid: 'comExamPreview',
        method: 'openPreview',
        args: ['$0']
      }
    ]
  },
  // 快问快答组件 - 预览组件
  comExamPreview: {
    component: 'VmpExamPreview'
  },
  // 红包组件
  comRedPacket: {
    component: 'VmpRedPacketLive'
  },
  // 中间主区域center区域容器
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
  // 上麦流列表
  comStreamList: {
    component: 'VmpStreamListLive',
    children: ['comStreamLocal', 'comPcPlayerLiveYun', 'comStreamRemote']
  },
  // 本地流
  comStreamLocal: {
    component: 'VmpStreamLocal',
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
    emitClickPublishComplate: [
      {
        cuid: 'pannelHeaderRight',
        method: 'handlePublishComplate'
      }
    ],
    emitClickUnpublishComplate: [
      {
        cuid: 'pannelHeaderRight',
        method: 'handleUnpublishComplate'
      }
    ],
    openCheckMediaDialog: [
      {
        cuid: 'comMediaSetting',
        method: 'showCheck',
        args: ['$0']
      }
    ]
  },
  // 远端流组件
  comStreamRemote: {
    component: 'VmpStreamRemote',
    emitClickStopShare: [
      {
        cuid: 'comDesktopScreen',
        method: 'stopShare',
        args: ['$0']
      }
    ],
    emitClickStopInsert: [
      {
        cuid: 'comInsertStream',
        method: 'closeInsertvideoHandler'
      }
    ]
  },
  // 云导播播放器组件
  comPcPlayerLiveYun: {
    component: 'VmpPcPlayerLiveYun',
    emitClickMediaSetting: {
      cuid: 'comMediaSetting',
      method: 'showMediaSetting'
    }
  },
  layerBodyCenterBottom: {
    component: 'VmpContainer',
    className: 'vmp-basic-center-bottom',
    children: ['comInsertStream', 'comDesktopScreen', 'comDocUne']
  },
  // 插播流组件
  comInsertStream: {
    component: 'VmpInsertStream',
    children: ['comInsertVideoList'],
    emitCloseInsertFileDialog: [
      {
        cuid: 'comInsertVideoList',
        method: 'closeInserVideoDialog',
        args: ['$0', '$1']
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
  // 插播视频列表
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
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    emitSwitchTo: {
      cuid: ['comAsideMenu'],
      method: 'switchTo',
      args: ['$0']
    },
    emitOpenDocList: {
      cuid: 'dlgDocList',
      method: 'show'
    }
  },
  // 分组讨论组件
  comGroupDiscussion: {
    component: 'VmpGroupDiscussion',
    // 触发切换
    emitToggle: {
      cuid: ['comGroupMenu'],
      method: 'setSelectedState',
      args: ['$0']
    },
    // 触发画笔重置
    emitDocResetBrush: [
      {
        cuid: 'comDocUne',
        method: 'resetCurrentBrush'
      }
    ]
  },
  // 转播流
  comRebroadcastSteam: {
    component: 'VmpRebroadcastStream'
  },
  // 中间区域右边容器
  layerBodyRight: {
    component: 'VmpContainer',
    className: 'vmp-basic-right',
    children: ['layerBodyRightHeader', 'layerBodyRightBody']
  },
  // 中间区域右边容器header区域容器
  layerBodyRightHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__hd'
  },
  // 中间区域右边容器body区域容器
  layerBodyRightBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__bd',
    children: ['comPcRewardEffect', 'comTabMenu']
  },
  // 礼物动画组件
  comPcRewardEffect: {
    component: 'VmpPcRewardEffect'
  },
  // tab签菜单定义
  comTabMenu: {
    component: 'VmpTabMenu',
    options: {
      // 发起端不支持配置文档、商品
      menuConfig: [
        { type: 1, cuid: 'comCustomMenu', text: '' },
        { type: 2, cuid: 'comDoc', text: 'menu.menu_1001', visible: false },
        { type: 3, cuid: 'comChat', text: 'menu.menu_1002' },
        { type: 'notice', cuid: 'comNotice', text: '公告' },
        { type: 5, cuid: 'comGoodSaas', text: 'menu.menu_1004' },
        { type: 6, cuid: 'comRecommend', text: 'menu.menu_1005' },
        { type: 7, cuid: 'comChapter', text: 'menu.menu_1013' },
        { type: 8, cuid: 'comMemberList', text: '成员' },
        { type: 'v5', cuid: 'comQa', text: 'common.common_1004' }
      ]
    }
  },
  // 自定义菜单
  comCustomMenu: {
    component: 'VmpCustomMenu'
  },
  // 聊天组件
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
    ],
    // 屏蔽特效
    emitHideEffect: {
      cuid: 'comPcRewardEffect',
      method: 'setHideEffect',
      args: ['$0']
    }
  },
  // 通知组件
  comNotice: {
    component: 'VmpNoticeList'
  },
  // 广告、推荐
  comRecommend: {
    component: 'VmpRecommend'
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
  // 问答
  comQa: {
    component: 'VmpQa'
  },
  // 所有弹窗集合
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
      'comMicInvited',
      'comVideoPollingSetting'
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
  // 分享组件
  comShare: {
    component: 'VmpShare',
    options: {
      isInviteShare: false //分享是否展示邀请卡图标
    }
  },
  // 虚拟人数
  comVirtualPeople: {
    component: 'VmpVirtualPeople'
  },
  comThirdStream: {
    component: 'VmpThirdStream',
    emitClickStartClick: [
      {
        cuid: 'pannelHeaderRight',
        method: 'handleStartClick',
        args: ['$0', '$1']
      }
    ]
  },
  // 发起端--私聊组件
  comLivePrivateChat: {
    component: 'VmpLivePrivateChat',
    options: {}
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
    ],
    changeMediaOption: [
      {
        cuid: 'comPcPlayerLiveYun',
        method: 'switchStreamType',
        args: ['$0']
      }
    ]
  },
  // 媒体检查
  comPcMediaCheck: {
    component: 'VmpPcMediaCheck',
    emitInitLocalStream: [
      {
        cuid: 'comStreamLocal',
        method: 'initLocalStream',
        args: ['$0']
      }
    ],
    emitRecheckMedia: [
      {
        cuid: 'pannelHeaderRight',
        method: 'handleRecheck',
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
  // 上麦邀请
  comMicInvited: {
    component: 'VmpMicInvited'
  },
  // 视频轮询设置
  comVideoPollingSetting: {
    component: 'VmpPollingSetting'
  }
};
