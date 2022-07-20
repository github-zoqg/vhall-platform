export default {
  // 专题详情页配置项
  layerSubjectRoot: {
    component: 'VmpAirContainer',
    children: ['layerSubjectHeader', 'layerSubjectBody', 'comSubjectDialog']
  },
  comSubjectDialog: {
    component: 'VmpAirContainer',
    children: ['compRegLogin', 'comSubjectShare', 'comSignUpForm', 'comWatchAuth']
  },
  // 顶部容器
  layerSubjectHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['comSubjectHeader']
  },
  comSubjectHeader: {
    component: 'VmpSubjectHeader',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ],
    emitClickShare: [
      //分享弹窗
      {
        cuid: 'comSubjectShare',
        method: 'openShareDialog',
        args: ['$0']
      }
    ]
  },
  // 内容区域
  layerSubjectBody: {
    component: 'VmpContainer',
    // className: 'vmp-basic-bd',
    children: ['comSubjectBody']
  },
  comSubjectBody: {
    component: 'VmpSubjectBody',
    emitClickLogin: [
      //登录弹窗
      {
        cuid: 'compRegLogin',
        method: 'open'
      }
    ],
    emitClickAuth: [
      // 权限弹窗
      {
        cuid: 'comWatchAuth',
        method: 'openAuthDialog',
        args: ['$0']
      }
    ],
    // 弹窗报名表单
    emitClickOpenSignUpForm: {
      cuid: 'comSignUpForm',
      method: 'openModal'
    }
  },
  // 登录注册组件
  compRegLogin: {
    component: 'VmpRegLogin'
  },
  // 分享
  comSubjectShare: {
    component: 'VmpShare',
    options: {
      isInviteShare: false, //分享是否展示邀请卡
      isSubjectShare: true
    }
  },
  // 鉴权弹窗
  comWatchAuth: {
    component: 'VmpWatchAuth'
    // emitClickOpenSignUpForm: {
    //   cuid: 'comSignUpForm',
    //   method: 'openModal'
    // }
  },
  comSignUpForm: {
    component: 'VmpSignUpForm',
    options: {}
  }
};
