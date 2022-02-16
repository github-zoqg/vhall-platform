export const globalConfig = {
  lang: 'zh'
};

// 服务配置
export const serverConfig = {
  /*** 布局定义start */
  // 根节点
  layerRoot: {
    component: 'VmpAirContainer',
    children: ['layerHeader', 'layerPlayer', 'layerBodyCenter', 'comAllDialog']
    // children: ['layerHeader', 'layerBody', 'comAllDialog']
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
    children: ['layerPlayer', 'layerBodyCenter']
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
  layerPlayer: {
    component: 'VmpContainer',
    className: 'player',
    // children: ['comStreamList', 'comPcPlayer', 'comFooterTools', 'comNoticeColumn', 'comDocUne']
    children: ['comPcPlayer']
  },
  layerBodyCenter: {
    component: 'VmpContainer',
    className: 'tab-content',
    children: [
      'comContainerTop',
      'comTabContentWap',
      'comContainerRight',
      'comNoticeWap',
      'comGoodSaasWap'
    ]
  },
  layerBodyRight: {
    component: 'VmpBasicRightContainer',
    children: []
  },
  /*** 布局定义end */
  /*** 所有弹窗集合 */
  comAllDialog: {
    component: 'VmpAirContainer',
    children: []
    // children: ['compRegLoginWap', 'comOfficial', 'comShare', 'comWatchTimer', 'comSignUpForm']
  },
  // 顶部
  comHeaderWatch: {
    component: 'VmpHeaderWatchWap',
    children: [],
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
  comWatchTimer: {
    component: 'VmpWapTimer',
    emitChangeTimer: {
      cuid: ['comContainerRight'],
      method: 'changeStatus',
      args: ['$0', '$1'] // 获取动态参数的第一个
    }
  },
  comContainerTop: {
    component: 'VmpContainer',
    className: 'container-top',
    children: ['comTabMenuWap']
  },
  comContainerRight: {
    component: 'VmpContainerRightWap',
    emitOpenTimer: {
      cuid: ['comWatchTimer'],
      method: 'handleTimer'
    }
  },
  // notice横幅
  comNoticeWap: {
    component: 'VmpNoticeWap'
  },
  // 登录弹窗
  compRegLoginWap: {
    component: 'VmpRegLoginWap'
  },
  comTabMenuWap: {
    component: 'VmpTabMenuWap',
    handleSelect: [
      {
        cuid: ['comTabContentWap'],
        method: 'switchTo',
        args: ['$0', '$1', '$2']
      }
    ]
  },
  comTabContentWap: {
    component: 'VmpTabContainerWap',
    children: ['comChatWap', 'comIntroWap', 'comRecommendWap']
  },
  comIntroWap: {
    component: 'VmpIntroWap',
    children: ['comInteractToolsWap']
  },
  // 底部互动工具box
  comInteractToolsWap: {
    component: 'VmpInteractToolsWap'
  },
  // 广告（推荐）
  comRecommendWap: {
    component: 'VmpRecommendWap',
    addTab: [
      {
        cuid: ['comTabMenuWap'],
        method: 'addItem',
        args: ['$0']
      }
    ]
  },
  //商品列表
  comGoodSaasWap: {
    component: 'VmpGoodListWap'
  },
  //wap端聊天
  comChatWap: {
    component: 'VmpChatWap',
    addTab: [
      {
        cuid: ['comTabMenuWap'],
        method: 'addItem',
        args: ['$0']
      }
    ],
    children: [],
    options: {}
  }
};
