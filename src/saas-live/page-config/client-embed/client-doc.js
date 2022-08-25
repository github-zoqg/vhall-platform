/**
 * 客户端嵌入文档页编排配置
 */
export default {
  // 客户端嵌入页文档组件
  docClientRoot: {
    component: 'VmpContainer',
    children: ['comDocUne', 'dlgDocList'],
    emiSwitchTo: {
      cuid: ['comDocUne'],
      method: 'switchTo',
      args: ['$0']
    },
    emitFullScreen: {
      cuid: ['comDocUne'],
      method: 'setDisplayMode',
      args: ['$0']
    }
  },
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    // 打开对话框
    emitOpenDocList: {
      cuid: 'dlgDocList',
      method: 'show'
    }
  },
  //文档列表对话框
  dlgDocList: {
    component: 'VmpDocDlglist',
    emitDemonstrateDoc: [
      {
        cuid: 'comDocUne',
        method: 'demonstrate',
        args: ['$0', '$1', '$2']
      }
    ]
  }
};
