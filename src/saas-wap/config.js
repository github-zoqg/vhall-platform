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
  // layerBody: {
  //   component: 'VmpContainer',
  //   className: 'vmp-basic-bd',
  //   children: ['layerPlayer', 'layerBodyCenter']
  // },
  layerPlayer: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['comWaStreamLocal']
    // comWapPlayer 编写互动功能，暂时注释
  },
  layerBodyCenter: {
    component: 'VmpContainer',
    className: 'tab-content',
    children: ['comTabMenuWap', 'comContainerRight', 'comNoticeWap']
  },
  /*** 布局定义end */
  /*** 所有弹窗集合 */
  comAllDialog: {
    component: 'VmpAirContainer',
    children: ['compRegLoginWap', 'comOfficial', 'comShare', 'comWatchTimer', 'comSignUpForm']
  },
  // 顶部
  comHeaderWatch: {
    component: 'VmpHeaderWatchWap',
    children: [],
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLoginWap',
        method: 'open'
      }
    ],
    emitOpenOfficical: [
      //弹出公众号
      {
        cuid: 'comOfficial',
        method: 'openOfficial'
      }
    ]
  },
  comWapPlayer: {
    component: 'VmpWapPlayer'
  },
  comWaStreamLocal: {
    component: 'VmpWapStreamLocal'
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
    className: 'container-top'
  },
  comContainerRight: {
    component: 'VmpContainerRightWap',
    children: ['comSignWap'],
    emitOpenTimer: {
      cuid: ['comWatchTimer'],
      method: 'handleTimer'
    },
    emitOpenSign: {
      cuid: ['comSignWap'],
      method: 'openSign'
    }
  },
  // notice横幅
  comNoticeWap: {
    component: 'VmpNoticeWap'
  },
  // 登录弹窗
  compRegLoginWap: {
    // component: 'VmpRegLoginWap'
  },
  comTabMenuWap: {
    component: 'VmpTabMenuWap',
    options: {}
  },
  comIntroWap: {
    component: 'VmpIntroWap',
    addTab: [
      {
        cuid: ['comTabMenuWap'],
        method: 'addItem',
        args: ['$0']
      }
    ]
  },
  // 底部互动工具box
  comInteractToolsWap: {
    component: 'VmpInteractToolsWap',
    emitNeedLogin: {
      cuid: ['compRegLoginWap'],
      method: 'open'
    }
  },
  // 广告（推荐）
  comRecommendWap: {
    component: 'VmpRecommendWap'
  },
  //商品列表
  comGoodSaasWap: {
    component: 'VmpGoodListWap'
  },
  comCustomMenuWap: {
    component: 'VmpCustomMenuWap'
  },
  // 二维码弹框
  comOfficial: {
    component: 'VmpWapQrCode'
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
    children: ['comInteractToolsWap'],
    options: {}
  },
  // wap互动工具-签到
  comSignWap: {
    component: 'VmpSignWap',
    emitOpenSignIcon: {
      cuid: ['comContainerRight'],
      method: 'changeStatus',
      args: ['$0', '$1']
    }
  },
  //成员列表
  comMemberListWap: {
    component: 'VmpMemberListWap'
  }
};
