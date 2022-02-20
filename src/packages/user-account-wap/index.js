import UserAccountWap from './src/main';

/* istanbul ignore next */
UserAccountWap.install = function (Vue) {
  Vue.component(UserAccountWap.name, UserAccountWap);
};

export default UserAccountWap;
