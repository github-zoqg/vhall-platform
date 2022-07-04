import VmpRedPacketCommandWatch from './src/watch';

/* istanbul ignore next */
VmpRedPacketCommandWatch.install = function (Vue) {
  Vue.component(VmpRedPacketCommandWatch.name, VmpRedPacketCommandWatch);
};

export default VmpRedPacketCommandWatch;
