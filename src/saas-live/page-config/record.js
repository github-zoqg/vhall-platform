/**
 * 录制页面配置
 */
export default {
  // 根组件
  recordVideoRoot: {
    component: 'VmpAirContainer',
    children: ['recordLayerHeader', 'recordLayerBody', 'recordComAllDialog']
  },
  // 顶部header容器
  recordLayerHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['pannelHeaderLeft', 'recordPannelHeaderRight']
  },
  pannelHeaderLeft: {
    component: 'VmpAirContainer',
    children: ['compHeaderLeft']
  },
  compHeaderLeft: {
    component: 'VmpHeaderLeft'
  },
  // 顶部右侧容器
  recordPannelHeaderRight: {
    component: 'VmpHeaderRight',
    options: {
      isShowMediaSetting: true, // 是否展示媒体设置
      isShowQuit: false, //是否显示退出
      isShowSupport: false, //是否显示技术支持
      isShowSplitScreen: false, //是否显示分屏
      isShowVirtualAudience: false, // 是否显示虚拟人数
      isShowThirdParty: false // 是否显示三方推流
    },
    recordVideoSuccess: [
      {
        cuid: 'recordComRecordVideoSuccess',
        method: 'showRecordVideoSuccessComp',
        args: ['$0'] // 获取动态参数的第一个
      }
    ],
    emitClickEndLive: [
      // 不再派发结束推流事件, 结束推流是监听直播结束消息
      {
        cuid: 'recordComStreamLocal',
        method: 'stopPush',
        args: ['$0']
      }
    ],
    emitClickStartLive: [
      {
        cuid: 'recordComStreamLocal',
        method: 'startPushOnce'
      }
    ],
    emitMediaSettingClick: [
      {
        cuid: 'comMediaSetting',
        method: 'showMediaSetting'
      }
    ]
  },
  // 中间主区域容器
  recordLayerBody: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-basic-bd'
    },
    children: ['recordLayerBodyLeft', 'recordLayerBodyCenter', 'recordLayerBodyRight']
  },
  // 中间左侧
  recordLayerBodyLeft: {
    component: 'VmpContainer',
    className: 'vmp-basic-left',
    children: ['recordComAsideMenu']
  },
  // 侧边工具栏
  recordComAsideMenu: {
    component: 'VmpAsideMenu',
    children: ['recordComDocMenu', 'recordComWbMenu']
  },
  // 文档菜单
  recordComDocMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-iconfont vh-line-document',
      text: 'aside_menu.aside_menu_1000',
      kind: 'document',
      auth: 'hide-document'
    },
    handleClick: [
      {
        cuid: ['recordComAsideMenu', 'recordComDocUne'],
        method: 'switchTo',
        args: 'document'
      }
    ]
  },
  // 白板菜单
  recordComWbMenu: {
    component: 'VmpIconText',
    options: {
      icon: 'vh-saas-iconfont vh-saas-line-whiteboard',
      text: 'aside_menu.aside_menu_1001',
      kind: 'board',
      auth: true
    },
    handleClick: [
      {
        cuid: ['recordComAsideMenu', 'recordComDocUne'],
        method: 'switchTo',
        args: 'board'
      }
    ]
  },
  // 中间容器
  recordLayerBodyCenter: {
    component: 'VmpContainer',
    className: 'vmp-basic-center',
    children: ['recordComStreamList', 'recordComDocUne', 'recordComRecordVideoSuccess']
  },
  // 上麦流列表
  recordComStreamList: {
    component: 'VmpStreamListLive',
    children: ['recordComStreamLocal', 'comStreamRemote']
  },
  // 本地流
  recordComStreamLocal: {
    component: 'VmpStreamLocal',
    // 推流完成事件
    emitClickPublishComplate: [
      {
        cuid: 'recordPannelHeaderRight',
        method: 'handlePublishComplate'
      }
    ],
    // 停止推流完成事件
    emitClickUnpublishComplate: [
      {
        cuid: 'recordPannelHeaderRight',
        method: 'handleUnpublishComplate'
      }
    ]
  },
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
  // 文档白板组件
  recordComDocUne: {
    component: 'VmpDocUne',
    emitSwitchTo: {
      cuid: ['recordComAsideMenu'],
      method: 'switchTo',
      args: ['$0']
    },
    emitOpenDocList: {
      cuid: 'recordDlgDocList',
      method: 'show'
    }
  },
  // 录制结束组件
  recordComRecordVideoSuccess: {
    component: 'VmpRecordVideoSuccess'
  },
  // 中间右侧容器
  recordLayerBodyRight: {
    component: 'VmpContainer',
    className: 'vmp-basic-right',
    children: ['recordLayerBodyRightHeader', 'recordLayerBodyRightBody']
  },
  // 中间右侧头部
  recordLayerBodyRightHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__hd'
  },
  // 中间右侧body
  recordLayerBodyRightBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__bd'
  },
  // 所有弹窗集合
  recordComAllDialog: {
    component: 'VmpAirContainer',
    children: ['recordDlgDocList', 'comMediaSetting']
  },
  // 文档列表对话框
  recordDlgDocList: {
    component: 'VmpDocDlglist',
    emitDemonstrateDoc: [
      {
        cuid: 'recordComDocUne',
        method: 'demonstrate',
        args: ['$0', '$1', '$2']
      }
    ]
  },
  comMediaSetting: {
    component: 'VmpPcMediaSetting',
    saveOptions: [
      {
        cuid: 'comStreamLocal',
        method: 'switchStreamType',
        args: ['$0']
      }
    ],
    changeMediaOption: [
      {
        cuid: 'comPcPlayerLiveYun',
        method: 'switchStreamType',
        args: ['$0']
      }
    ]
  }
};
