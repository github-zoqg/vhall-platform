import VmpRedPacketLive from './src/main.vue';

/* istanbul ignore next */
VmpRedPacketLive.install = function (Vue) {
  Vue.component(VmpRedPacketLive.name, VmpRedPacketLive);
};

export default VmpRedPacketLive;
