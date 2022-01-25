import UserAccount from './src/main';

/* istanbul ignore next */
UserAccount.install = function (Vue) {
  Vue.component(UserAccount.name, UserAccount);
};

export default UserAccount;
