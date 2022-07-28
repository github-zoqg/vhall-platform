import VmpChat from './src/main';

/* istanbul ignore next */
VmpChat.install = function (Vue) {
  Vue.component(VmpChat.name, VmpChat);
};

export default VmpChat;
