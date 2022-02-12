import VmpLivePrivateChat from './src/main';

/* istanbul ignore next */
VmpLivePrivateChat.install = function (Vue) {
  Vue.component(VmpLivePrivateChat.name, VmpLivePrivateChat);
};

export default VmpLivePrivateChat;
