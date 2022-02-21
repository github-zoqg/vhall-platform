import VmpChatWap from './src/main';

/* istanbul ignore next */
VmpChatWap.install = function (Vue) {
  Vue.component(VmpChatWap.name, VmpChatWap);
};

export default VmpChatWap;
