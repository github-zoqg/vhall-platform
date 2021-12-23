import VmpContainer from './src/main';

/* istanbul ignore next */
VmpContainer.install = function (Vue) {
  Vue.component(VmpContainer.name, VmpContainer);
};

export default VmpContainer;
