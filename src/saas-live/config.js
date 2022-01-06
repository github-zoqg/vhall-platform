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
    children: ['layerHeader', 'layerBody', 'dlgDocList']
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
    children: ['comStreamList', 'comDocUne']
  },
  layerBodyRight: {
    component: 'VmpContainer',
    className: 'vmp-basic-right',
    children: ['layerBodyRightHeader', 'layerBodyRightBody']
  },
  layerBodyRightHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__hd',
    children: ['comStreamLocal']
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
  // pannelHeaderRight: {
  //   component: 'VmpContainer',
  //   className: 'vmp-header-right',
  //   children: ['compLanguageChoice']
  // },
  // // 顶部右侧容器
  pannelHeaderRight: {
    component: 'VmpHeaderRight',
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
    ]
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
      icon: 'iconfont iconwendang',
      text: 'aside_menu.aside_menu_1000',
      kind: 'document'
    },
    emitClick: [
      {
        cuid: 'comAsideMenu',
        method: 'switchTo',
        args: ['document']
      },
      {
        cuid: 'comDocUne',
        method: 'switchTo',
        args: ['document']
      },
      {
        cuid: 'comDocToolbar',
        method: 'switchTo',
        args: ['document']
      }
    ]
  },
  // 白板菜单
  comWbMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconbaiban',
      text: 'aside_menu.aside_menu_1001',
      kind: 'board'
    },
    emitClick: [
      {
        cuid: 'comAsideMenu',
        method: 'switchTo',
        args: ['board']
      },
      {
        cuid: 'comDocUne',
        method: 'switchTo',
        args: ['board']
      },
      {
        cuid: 'comDocToolbar',
        method: 'switchTo',
        args: ['board']
      }
    ]
  },
  // 桌面共享
  comShareDesktopMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconzhuomiangongxiang',
      text: 'aside_menu.aside_menu_1002',
      disable: true
    }
  },
  // 插播文件
  comMediaPlayMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'iconfont iconwangyechabo_icon',
      text: 'aside_menu.aside_menu_1003'
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
    component: 'VmpChat',
    options: {
      //是否有图片上传按钮
      hasImgUpload: true,
      //是否有聊天操作按钮
      hasChatOperateBtn: false
    }
  },
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    children: ['comDocToolbar'],
    emitSwitchTo: [
      {
        cuid: 'comAsideMenu',
        method: 'switchTo',
        args: ['$0'] // 获取动态参数的第一个
      },
      {
        cuid: 'comDocToolbar',
        method: 'switchTo',
        args: ['$0']
      }
    ],
    // 打开对话框
    emitOpenDocList: [
      {
        cuid: 'dlgDocList',
        method: 'show'
      }
    ]
  },
  // 文档工具栏
  comDocToolbar: {
    component: 'VmpDocToolbar',
    children: ['comFullscreenIcon']
  },
  // 全屏按钮
  comFullscreenIcon: {
    component: 'VmpIconItem',
    options: {
      icon: 'iconfont iconquanping',
      title: 'doc.doc_1010'
    },
    emitClick: [
      {
        cuid: 'comDocUne',
        method: 'fullscreen'
      }
    ]
  },
  //文档列表对话框
  dlgDocList: {
    component: 'VmpDocDlglist'
  },
  // 上麦流列表
  comStreamList: {
    component: 'VmpStreamList'
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
    // 窗口切换事件
    emitClickExchange: [
      {
        cuid: 'ps.surface',
        method: 'exchange',
        args: ['comStreamLocal']
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
  }
};
