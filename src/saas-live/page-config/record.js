/**
 * 录制页面配置
 */
export default {
  recordVideoRoot: {
    component: 'VmpAirContainer',
    children: ['recordLayerHeader', 'recordLayerBody', 'recordComAllDialog']
  },
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
  recordPannelHeaderRight: {
    component: 'VmpHeaderRight',
    options: {
      isShowMediaSetting: true,
      isShowQuit: false,
      isShowSupport: false,
      isShowSplitScreen: false,
      isShowVirtualAudience: false,
      isShowThirdParty: false
    },
    recordVideoSuccess: [
      {
        cuid: 'recordComRecordVideoSuccess',
        method: 'showRecordVideoSuccessComp',
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
  recordLayerBody: {
    component: 'VmpContainer',
    options: {
      className: 'vmp-basic-bd'
    },
    children: ['recordLayerBodyLeft', 'recordLayerBodyCenter', 'recordLayerBodyRight']
  },
  recordLayerBodyLeft: {
    component: 'VmpContainer',
    className: 'vmp-basic-left',
    children: ['recordComAsideMenu']
  },
  recordComAsideMenu: {
    component: 'VmpAsideMenu',
    children: ['recordComDocMenu', 'recordComWbMenu']
  },
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
  recordLayerBodyCenter: {
    component: 'VmpContainer',
    className: 'vmp-basic-center',
    children: ['recordComStreamList', 'recordComDocUne', 'recordComRecordVideoSuccess']
  },
  recordComStreamList: {
    component: 'VmpStreamListLive',
    children: ['recordComStreamLocal', 'comStreamRemote']
  },
  recordComStreamLocal: {
    component: 'VmpStreamLocal',
    emitClickPublishComplate: [
      {
        cuid: 'recordPannelHeaderRight',
        method: 'handlePublishComplate'
      }
    ],
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
  recordComRecordVideoSuccess: {
    component: 'VmpRecordVideoSuccess'
  },
  recordLayerBodyRight: {
    component: 'VmpContainer',
    className: 'vmp-basic-right',
    children: ['recordLayerBodyRightHeader', 'recordLayerBodyRightBody']
  },
  recordLayerBodyRightHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__hd'
  },
  recordLayerBodyRightBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-right__bd'
  },
  recordComAllDialog: {
    component: 'VmpAirContainer',
    children: ['recordDlgDocList', 'comMediaSetting']
  },
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
    ]
  }
};
