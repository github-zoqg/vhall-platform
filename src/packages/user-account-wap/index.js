import VmpUserAccountWap from './src/main';

/* istanbul ignore next */
VmpUserAccountWap.install = function (Vue) {
  Vue.component(VmpUserAccountWap.name, VmpUserAccountWap);
};

export default VmpUserAccountWap;
