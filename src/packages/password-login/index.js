import VmpPasswordLogin from './src/main';

/* istanbul ignore next */
VmpPasswordLogin.install = function (Vue) {
  Vue.component(VmpPasswordLogin.name, VmpPasswordLogin);
};

export default VmpPasswordLogin;
