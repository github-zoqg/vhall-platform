import VmpFashionChat from './src/main';

/* istanbul ignore next */
VmpFashionChat.install = function (Vue) {
  Vue.component(VmpFashionChat.name, VmpFashionChat);
};

export default VmpFashionChat;
