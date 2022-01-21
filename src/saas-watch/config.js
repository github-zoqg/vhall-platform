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
    // children: ['layerHeader', 'layerBody', 'layerFooter', 'comAllDialog']
    children: ['layerHeader', 'layerBody', 'comAllDialog']
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
    // children: ['comDocUne', 'comFooterTools', 'comPcPlayer', 'comChat']
  },
  // 底部主区域容器
  layerFooter: {
    component: 'VmpFooter',
    className: 'vmp-footer'
  },
  // layerBodyLeft: {
  //   component: 'VmpContainer',
  //   className: 'vmp-basic-left',
  //   children: []
  //   // children: ['comStreamList', 'comPcPlayer', 'comFooterTools', 'comNoticeColumn']
  //   // children: ['comStreamList', 'comFooterTools', 'comNoticeColumn']
  // },
  layerBodyCenter: {
    component: 'VmpBasicCenterContainer',
    children: ['comStreamList', 'comPcPlayer', 'comFooterTools', 'comNoticeColumn', 'comDocUne']
    // children: ['comStreamList', 'comFooterTools', 'comNoticeColumn']
  },
  layerBodyRight: {
    component: 'VmpBasicRightContainer',
    children: ['comChat']
  },
  /*** 布局定义end */

  /*** 所有弹窗集合 */
  comAllDialog: {
    component: 'VmpAirContainer',
    children: ['compRegLogin', 'comOfficial', 'comShare', 'comWatchAuth']
  },

  /**** 组件定义 */
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    options: {
      keepAspectRatio: false,
      hasPager: false
    }
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
      isInviteShare: true //分享是否展示邀请卡
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
    component: 'VmpFooterTools'
    // children: ['comNotice', 'comPraise'] // 登录注册组件，模拟可放入位置添加 , 'compRegLogin'
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
  //私聊组件
  comWatchPrivateChat: {
    component: 'VmpWatchPrivateChat',
    options: {}
  },
  // 登录注册组件
  compRegLogin: {
    component: 'VmpRegLogin'
  }
};
