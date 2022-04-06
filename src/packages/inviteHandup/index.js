import InviteHandup from './src/main';

/* istanbul ignore next */
InviteHandup.install = function (Vue) {
  Vue.component(InviteHandup.name, InviteHandup);
};

export default InviteHandup;
