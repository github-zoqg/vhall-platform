/**
 * 单视频嵌入页面配置
 */
export default {
  // 根组件
  embedVideoLayerRoot: {
    component: 'VmpAirContainer',
    children: ['embedVideoLayerBody', 'comWatchAuth']
  },
  // 中间主区域容器
  embedVideoLayerBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['embedVideoLayerBodyCenter']
  },
  // 中间主区域容器中间容器
  embedVideoLayerBodyCenter: {
    component: 'VmpBasicCenterContainer',
    children: ['embedVideoLayerBodyCenterMain']
  },
  // 中间主区域容器中间主内容区
  embedVideoLayerBodyCenterMain: {
    component: 'VmpBasicCenterMain',
    children: ['comPcPlayer', 'comLivingEnd']
  },
  // 播放器
  comPcPlayer: {
    component: 'VmpPcPlayer',
    // 授权
    emitClickAuth: [
      {
        cuid: 'comWatchAuth',
        method: 'openAuthDialog',
        args: ['$0']
      }
    ],
    // 打开报名表单
    emitClickOpenSignUpForm: [
      {
        cuid: 'comSignUpForm',
        method: 'openModal'
      }
    ]
  },
  comLivingEnd: {
    component: 'VmpLivingEnd'
  },
  comWatchAuth: {
    component: 'VmpWatchAuth',
    emitClickOpenSignUpForm: {
      cuid: 'comSignUpForm',
      method: 'openModal'
    }
  }
};
