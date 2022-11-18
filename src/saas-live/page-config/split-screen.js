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
    children: ['splitScreenStreamLocal', 'comInsertStream', 'comDesktopScreen']
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
  },
  // 插播流组件
  comInsertStream: {
    component: 'VmpInsertStream'
  },
  // 桌面共享组件
  comDesktopScreen: {
    component: 'VmpStreamDesktopScreen'
  }
};
