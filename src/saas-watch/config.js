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
    options: {
      className: 'vmp-basic-bd'
    },
    children: ['layerBodyCenter', 'layerBodyRight']
  },
  // 底部主区域容器
  layerFooter: {
    component: 'VmpFooter',
    className: 'vmp-footer'
  },
  layerBodyLeft: {
    component: 'VmpContainer',
    className: 'vmp-basic-left',
    children: ['comAsideMenu']
  },
  layerBodyCenter: {
    component: 'VmpBasicCenterContainer',
    children: ['comStreamList', 'comPcPlayer', 'comFooterTools', 'comNoticeColumn']
  },

  layerBodyRight: {
    component: 'VmpBasicRightContainer',
    children: ['layerBodyRightBody']
  },
  layerBodyRightBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__bd',
    children: ['comMemberList', 'comChat']
  },
  /*** 布局定义end */

  /*** 所有弹窗集合 */
  comAllDialog: {
    component: 'VmpAirContainer',
    children: ['compRegLogin', 'comOfficial', 'comShare', 'comWatchAuth']
  },

  /**** 组件定义 */
  // 顶部左侧容器
  pannelHeaderLeft: {
    component: 'VmpAirContainer',
    children: ['compHeaderLeft']
  },
  // 顶部右侧容器
  pannelHeaderRight: {
    component: 'VmpContainer',
    className: 'vmp-header-right',
    children: ['compLanguageChoice']
  },
  // 顶部左侧组件
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 左侧导航菜单
  comAsideMenu: {
    component: 'VmpAsideMenu',
    children: ['comDocMenu', 'comWbMenu', 'comShareDesktopMenu', 'comMediaPlayMenu']
  },
  // 语言选择组件
  compLanguageChoice: {
    component: 'VmpLanguageChoice',
    options: {
      choices: [
        {
          value: 'zh',
          label: 'i18n.languageChoice.zh'
        },
        {
          value: 'en',
          label: 'i18n.languageChoice.en'
        }
      ]
    }
  },
  // 文档菜单
  comDocMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconwendang',
      text: 'i18n.asideMenu.document'
    },
    emitClick: [
      {
        cuid: 'comAsideMenu',
        method: 'setSelectedState',
        args: ['comDocMenu']
      }
    ]
  },
  // 白板菜单
  comWbMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconbaiban',
      text: 'i18n.asideMenu.whiteBoard'
    },
    emitClick: [
      {
        cuid: 'comAsideMenu',
        method: 'setSelectedState',
        args: ['comWbMenu']
      }
    ]
  },
  // 桌面共享
  comShareDesktopMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconzhuomiangongxiang',
      text: 'i18n.asideMenu.shareDesktop',
      disable: true
    }
  },
  // 插播文件
  comMediaPlayMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconwangyechabo_icon',
      text: 'i18n.asideMenu.mediaPlay'
    },
    emitClick: [
      {
        cuid: 'comAsideMenu',
        method: 'setSelectedState',
        args: ['comMediaPlayMenu']
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
    ]
  },
  comOfficial: {
    component: 'VmpOfficial'
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
      isInviteShare: false //分享是否展示邀请卡
    }
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
    children: ['comNotice', 'comPraise'] // 登录注册组件，模拟可放入位置添加 , 'compRegLogin'
  },
  comPraise: {
    component: 'VmpPraise'
  },
  comNotice: {
    component: 'VmpNoticeList'
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
  // 登录注册组件
  compRegLogin: {
    component: 'VmpRegLogin'
  }
};
