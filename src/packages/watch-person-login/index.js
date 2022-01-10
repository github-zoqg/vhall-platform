import watchPersonLogin from './src/main';

/* istanbul ignore next */
watchPersonLogin.install = function (Vue) {
  Vue.component(watchPersonLogin.name, watchPersonLogin);
};

export default watchPersonLogin;
