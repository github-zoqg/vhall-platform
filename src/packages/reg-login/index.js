import VmpRegLogin from './src/main';

/* istanbul ignore next */
VmpRegLogin.install = function (Vue) {
  Vue.component(VmpRegLogin.name, VmpRegLogin);
};

export default VmpRegLogin;
