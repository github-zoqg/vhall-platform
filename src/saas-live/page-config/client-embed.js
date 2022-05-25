/**
 * 客户端嵌入页编排配置
 */
export default {
  // 客户端嵌入页组件
  embedClientRoot: {
    component: 'VmpEmbedClient',
    children: ['comDocUne', 'dlgDocList'],
    emiSwitchTo: {
      cuid: ['comDocUne'],
      method: 'switchTo',
      args: ['$0']
    }
  },
  // 文档白板组件
  comDocUne: {
    component: 'VmpDocUne',
    emitSwitchTo: {
      cuid: ['comAsideMenu'],
      method: 'switchTo',
      args: ['$0'] // 获取动态参数的第一个
    },
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
