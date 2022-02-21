import VmpUserAccount from './src/main';

/* istanbul ignore next */
VmpUserAccount.install = function (Vue) {
  Vue.component(VmpUserAccount.name, VmpUserAccount);
};

export default VmpUserAccount;
