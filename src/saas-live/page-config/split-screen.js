/**
 * 分屏页面配置
 */
export default {
  // 根组件
  splitScreenRoot: {
    component: 'VmpAirContainer',
    children: ['splitScreenContainer']
  },
  // 分屏组件
  splitScreenContainer: {
    component: 'VmpSplitScreen',
    children: ['splitScreenStreamLocal']
  },
  // 本地流
  splitScreenStreamLocal: {
    component: 'VmpStreamLocal',
    // 停止推流完成事件
    emitClickUnpublishComplate: [
      {
        cuid: 'splitScreenContainer',
        method: 'handleUnpublishComplate'
      }
    ]
  }
};
