export default {
  // 专题详情页配置项
  layerSubjectRoot: {
    component: 'VmpAirContainer',
    children: ['layerSubjectHeader', 'layerSubjectBody']
  },
  // 顶部容器
  layerSubjectHeader: {
    component: 'VmpContainer',
    className: 'vmp-basic-hd',
    children: ['comSubjectHeader']
  },
  comSubjectHeader: {
    component: 'VmpSubjectHeader'
  },
  // 内容区域
  layerSubjectBody: {
    component: 'VmpContainer',
    className: 'vmp-basic-bd',
    children: ['comSubjectBody']
  },
  comSubjectBody: {
    component: 'VmpSubjectBody'
  }
};
