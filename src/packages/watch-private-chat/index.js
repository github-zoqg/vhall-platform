import VmpWatchPrivateChat from './src/main';

/* istanbul ignore next */
VmpWatchPrivateChat.install = function (Vue) {
  Vue.component(VmpWatchPrivateChat.name, VmpWatchPrivateChat);
};

export default VmpWatchPrivateChat;
