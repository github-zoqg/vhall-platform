import VmpCash from './src/main';

/* istanbul ignore next */
VmpCash.install = function (Vue) {
  Vue.component(VmpCash.name, VmpCash);
};

export default VmpCash;
