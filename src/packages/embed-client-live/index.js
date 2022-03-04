import VmpEmbedClient from './src/main';

VmpEmbedClient.install = function (Vue) {
  Vue.component(VmpEmbedClient.name, VmpEmbedClient);
};

export default VmpEmbedClient;
