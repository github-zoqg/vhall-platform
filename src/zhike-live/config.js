export const globalConfig = {
  lang: 'zh',
  skin: 'default'
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
    children: ['layerBodyCenter', 'layerBodyRight', 'layerBodyLeft']
  },
  layerBodyLeft: {
    component: 'VmpContainer',
    className: 'vmp-basic-left',
    children: ['comAsideMenu']
  },
  layerBodyCenter: {
    component: 'VmpContainer',
    className: 'vmp-basic-center',
    // children: ['comStreamList', 'comDocUne']
    children: []
  },
  layerBodyRight: {
    component: 'VmpContainer',
    className: 'vmp-basic-right',
    children: ['layerBodyRightHeader', 'layerBodyRightBody']
  },
  layerBodyRightHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__hd',
    // children: ['comStreamLocal']
    children: []
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
    className: 'vmp-header-right vmp-header-func',
    children: ['comSettingIcon', 'comFullIcon']
  },
  // 顶部左侧组件
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 左侧导航菜单
  comAsideMenu: {
    component: 'VmpAsideMenu',
    children: ['comChatMenu', 'comMemberMenu', 'comBigDataMenu', 'comShareMenu']
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
      text: 'i18n.asideMenu.document',
      selected: true
    },
    emitClick: [
      {
        cuid: 'comAsideMenu',
        method: 'setSelectedState',
        args: ['comDocMenu']
      },
      {
        cuid: 'comDocToolbar',
        method: 'showAtMode',
        args: ['document']
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
      },
      {
        cuid: 'comDocToolbar',
        method: 'showAtMode',
        args: ['board']
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
  //聊天组件
  comChat: {
    component: 'VmpChat'
  },
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    children: ['comDocToolbar']
  },
  // 文档工具栏
  comDocToolbar: {
    component: 'VmpDocToolbar',
    options: {
      hasCloseBtn: false //是否有关闭按钮
    }
  },
  // 上麦流列表
  comStreamList: {
    component: 'VmpStreamList'
  },
  // 本地流
  comStreamLocal: {
    component: 'VmpStreamLocal'
  },
  // 聊天菜单
  comChatMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont icon-duoseicon_liaotian',
      text: 'i18n.asideMenu.chat',
      selected: true
    }
  },
  // 成员菜单
  comMemberMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont icon-icon_chengyuan',
      text: 'i18n.asideMenu.member'
    }
  },
  // 数据菜单
  comBigDataMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont icon-shuju_icon',
      text: 'i18n.asideMenu.bigData'
    }
  },
  // 分享菜单
  comShareMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont icon-fenxiangxiaoguo-',
      text: 'i18n.asideMenu.share'
    }
  },
  //设置按钮
  comSettingIcon: {
    component: 'VmpSettingIcon',
    options: {
      icon: 'iconfont icon-faqiduanshezhi',
      title: 'i18n.settingIcon.title'
    }
  },
  comFullIcon: {
    component: 'VmpSettingIcon',
    options: {
      icon: 'iconfont icon-icon-quanping',
      title: 'i18n.fullIcon.title'
    }
  }
};
