import VmpChatAuth from './src/main';

/* istanbul ignore next */
VmpChatAuth.install = function (Vue) {
  Vue.component(VmpChatAuth.name, VmpChatAuth);
};

export default VmpChatAuth;
