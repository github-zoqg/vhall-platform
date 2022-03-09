import VmpPayFee from './src/main';
/* istanbul ignore next */
VmpPayFee.install = function (Vue) {
  Vue.component(VmpPayFee.name, VmpPayFee);
};

export default VmpPayFee;
