import VmpCashWap from './src/main';

/* istanbul ignore next */
VmpCashWap.install = function (Vue) {
  Vue.component(VmpCashWap.name, VmpCashWap);
};

export default VmpCashWap;
