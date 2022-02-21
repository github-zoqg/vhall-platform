export const globalConfig = {
  lang: 'zh'
};

// 服务配置
export const serverConfig = {
  /*** 布局定义start */
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: ['layerHeader', 'layerBody', 'comAllDialog']
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
      'comDocUne',
      'comGroupDiscussion',
      'comInsertStream',
      'comThirdStream'
    ]
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
    children: [
      // 'comMemberList'
      // 'comChat',
      'comTabMenu'
    ]
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
        { type: 8, cuid: 'comMemberList', text: '成员' } // 成员
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
      'comInsertVideo',
      'liveTimerSet',
      'liveTimer'
      // 'comRebroadcast'
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
    options: {
      isShowQuit: false, //是否显示退出
      isShowSupport: false, //是否显示技术支持
      isShowSplitScreen: true //是否显示分屏
    },
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
        method: 'startPush'
      }
    ],
    emitClickEndLive: [
      {
        cuid: 'comStreamLocal',
        method: 'stopPush'
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
      'comLottery'
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
      kind: 'document'
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
      }
    ]
  },
  // 白板菜单
  comWbMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-line-whiteboard',
      text: 'aside_menu.aside_menu_1001',
      kind: 'board'
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
      }
    ]
  },
  // 桌面共享
  comShareDesktopMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-a-line-Desktopsharing',
      text: 'aside_menu.aside_menu_1002',
      kind: 'desktopShare'
    }
  },
  // 插播文件
  comMediaPlayMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-a-color-Spotfile',
      text: 'aside_menu.aside_menu_1003',
      kind: 'insertMedia'
    },
    handleClick: [
      {
        cuid: 'comInsertVideo',
        method: 'openInserVideoDialog',
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
    ]
  },
  // 互动工具-计时器设置
  liveTimerSet: {
    component: 'VmpLiveTimerSet'
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
      kind: 'share'
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
      hidden: true
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
      //todo 预留的聊天审核跳转地址
      chatAuthUrl: '',
      //操作用户消息的弹窗配置【消息区域--左键单击用户头像，可以回复，@，禁言，删除消息，踢出人员等】
      //todo  这里预留，后续可能针对里面的操作也进行控制
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
    }
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
    children: ['comStreamLocal', 'comStreamRemote']
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
        cuid: 'comInsertVideo',
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
  comInsertVideo: {
    component: 'VmpInsertVideo',
    emitOnchange: [
      {
        cuid: 'comInsertStream',
        method: 'openInsertShow',
        args: ['$0', '$1']
      }
    ]
  },
  comMediaSetting: {
    component: 'VmpPcMediaSetting',
    saveOptions: []
  },
  comPcMediaCheck: {
    component: 'VmpPcMediaCheck'
  },
  comInsertStream: {
    component: 'VmpInsertStream',
    emitClose: [
      {
        cuid: 'comInsertVideo',
        method: 'closeInserVideoDialog',
        args: ['$0', '$1'] //第一个参数表示是否正在插播的状态，第二个参数表示远端插播的id
      }
    ],
    emitOpen: [
      {
        cuid: 'comInsertVideo',
        method: 'openInserVideoDialog',
        args: []
      }
    ],
    emitInsertInfo: [
      {
        cuid: 'comInsertVideo',
        method: 'getInsertingInfo',
        args: ['$0']
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
    // 分组设置取消
    emitCancelGroup: [
      {
        cuid: ['comGroupMenu'],
        method: 'setSelectedState',
        args: false
      }
    ]
  },
  // 转播
  comRebroadcast: {
    component: 'VmpRebroadcast'
  },
  comRecommend: {
    component: 'VmpRecommend'
  },
  comLottery: {
    component: 'VmpLotteryLive'
  }
};
