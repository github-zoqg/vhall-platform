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
    children: ['layerHeader', 'layerBody']
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
    children: ['comPcPlayer']
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
    children: ['comChat']
  },
  /*** 布局定义end */

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
  // 播放器
  comPcPlayer: {
    component: 'VmpPcPlayer',
    options: {
      text: 'i18n.player'
    }
  },
  //聊天组件
  comChat: {
    component: 'VmpChat'
  }
};
