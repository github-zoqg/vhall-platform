import VmpSmsVerification from './src/index';

/* istanbul ignore next */
VmpSmsVerification.install = function(Vue) {
  Vue.component(VmpSmsVerification.name, VmpSmsVerification);
};

export default VmpSmsVerification;
