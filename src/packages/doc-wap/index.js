import VmpDocWap from './src/main';

/* istanbul ignore next */
VmpDocWap.install = function (Vue) {
  Vue.component(VmpDocWap.name, VmpDocWap);
};

export default VmpDocWap;
