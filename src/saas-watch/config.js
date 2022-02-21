export const globalConfig = {
  lang: 'zh',
  skin: 'new-year'
};

// 服务配置
export const serverConfig = {
  /*** 布局定义start */
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: ['layerHeader', 'layerBody', 'layerFooter', 'comAllDialog']
    // children: ['layerBody']
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
    children: ['layerBodyCenter', 'layerBodyRight']
    // children: ['comGoodSaas']
    // children: ['comDocUne', 'comFooterTools', 'comPcPlayer', 'comChat']
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
      'comFooterTools',
      'comNoticeColumn',
      'comLivingEnd'
    ]
  },
  layerBodyRight: {
    component: 'VmpBasicRightContainer',
    children: ['comTabMenu']
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
      // 'comSignUpForm',
      'comUserAccount',
      'comCash',
      // 'comLottery'
      'comWatchTimer',
      'comScreenPost',
      'comMediaSetting'
    ]
  },

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
        { type: 4, cuid: 'comIntro', text: 'menu.menu_1003' }, // 简介
        { type: 5, cuid: 'comGoodSaas', text: 'menu.menu_1004' }, // 商品
        { type: 6, cuid: 'comRecommend', text: 'menu.menu_1005' }, // 广告、推荐
        { type: 7, cuid: 'comChapter', text: 'menu.menu_1013' }, // 章节
        { type: 8, cuid: 'comMemberList', text: '成员' } // 成员
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
    ]
  },
  comStreamList: {
    component: 'VmpStreamList',
    children: ['comStreamLocal', 'comStreamRemote']
  },
  comStreamLocal: {
    component: 'VmpStreamLocal'
  },
  comStreamRemote: {
    component: 'VmpStreamRemote'
  },
  // 播放器
  comPcPlayer: {
    component: 'VmpPcPlayer'
  },
  // 结束页面
  comLivingEnd: {
    component: 'VmpLivingEnd'
  },
  // 顶部
  comHeaderWatch: {
    component: 'VmpHeaderWatch',
    children: ['compLanguageChoice', 'comAttention'],
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
  comAttention: {
    component: 'VmpAttention',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ]
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
    component: 'VmpFooter',
    emitClickMediaCheck: {
      cuid: 'comMediaCheck',
      method: 'showSetting'
    }
  },
  // 底部工具栏（如人数， 热度等）
  comFooterTools: {
    component: 'VmpFooterTools',
    //todo 后续正式的需要调整或移除，此处仅为测试配置
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
    }
    // children: ['comNotice', 'comPraise'] // 登录注册组件，模拟可放入位置添加 , 'compRegLogin'
  },
  comNoticeColumn: {
    component: 'VmpNoticeColumn'
  },
  comWatchAuth: {
    component: 'VmpWatchAuth'
  },
  //聊天组件
  comChat: {
    component: 'VmpChat',
    options: {
      //是否有图片上传按钮【聊天区域底部操作栏--上传图片】
      hasImgUpload: false,
      //是否有聊天过滤按钮【聊天区域底部操作栏--屏蔽特效,只看主办方】
      hasChatFilterBtn: false,
      //是否开启聊天设置功能
      enableChatSetting: false,
      //操作用户消息的弹窗配置【消息区域--左键单击用户头像，可以回复，@，禁言，删除消息，踢出人员等】
      userControlOptions: {
        enable: false
      }
    }
  },
  //成员列表组件
  comMemberList: {
    component: 'VmpMemberList',
    options: {}
  },
  //私聊组件
  comWatchPrivateChat: {
    component: 'VmpWatchPrivateChat',
    options: {}
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
    // component: 'VmpLotteryWatch'
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
  // 推荐
  comRecommend: {
    component: 'VmpRecommend'
  },
  comIntro: {
    component: 'VmpIntro'
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
  }
};
