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
    children: ['layerHeader', 'layerBody', 'comCheckDevice']
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
    children: ['comChatMenu', 'comMemberMenu', 'comBigDataMenu']
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
    component: 'VmpHeaderRight',
    className: 'vmp-header-right vmp-header-func',
    options: {
      isShowQuit: true, //是否显示退出
      isShowSupport: true, //是否显示技术支持
      isShowSplitScreen: false //是否显示分屏
    }
    // children: ['comSettingIcon', 'comFullIcon']
  },
  // 顶部左侧组件
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 左侧导航菜单
  comAsideMenu: {
    component: 'VmpAsideMenu',
    children: ['comChatMenu', 'comMemberMenu', 'comBigDataMenu']
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
  //设备检测
  // comCheckDevice: {
  //   component: 'VmpCheckDevice',
  //   options: {
  //     title: 'check_device.check_device_1000'
  //   }
  // },
  // 聊天菜单
  comChatMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont icon-duoseicon_liaotian',
      text: 'aside_menu.aside_menu_1004',
      selected: true
    }
  },
  // 成员菜单
  comMemberMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont icon-icon_chengyuan',
      text: 'aside_menu.aside_menu_1007'
    }
  },
  // 数据菜单
  comBigDataMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont icon-shuju_icon',
      text: 'aside_menu.aside_menu_1005'
    }
  },
  // // 分享菜单
  // comShareMenu: {
  //   component: 'VmpIconText',
  //   options: {
  //     icon: 'iconfont icon-fenxiangxiaoguo-',
  //     text: 'aside_menu.aside_menu_1006'
  //   }
  // },
  //设置按钮
  comSettingIcon: {
    component: 'VmpSettingIcon',
    options: {
      icon: 'iconfont icon-faqiduanshezhi',
      title: 'setting_icon.setting_icon_1000'
    }
  },
  comFullIcon: {
    component: 'VmpSettingIcon',
    options: {
      icon: 'iconfont icon-icon-quanping',
      title: 'full_icon.full_icon_1000'
    }
  },
  comUserSettingBox: {
    component: 'VmpUserSettingBox',
    options: {
      icon: 'iconfont icon-faqiduanshezhi',
      title: '设备检测'
    }
  }
};
