import BasicLayout from './src/main';

/* istanbul ignore next */
BasicLayout.install = function (Vue) {
  Vue.component(BasicLayout.name, BasicLayout);
};

export default BasicLayout;
