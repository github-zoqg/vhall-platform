import VmpRedPacketLive from './src/live';

/* istanbul ignore next */
VmpRedPacketLive.install = function(Vue) {
  Vue.component(VmpRedPacketLive.name, VmpRedPacketLive);
};

export default VmpRedPacketLive;
