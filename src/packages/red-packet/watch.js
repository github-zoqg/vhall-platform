import VmpRedPacketWatch from './src/watch';

/* istanbul ignore next */
VmpRedPacketWatch.install = function (Vue) {
  Vue.component(VmpRedPacketWatch.name, VmpRedPacketWatch);
};

export default VmpRedPacketWatch;
