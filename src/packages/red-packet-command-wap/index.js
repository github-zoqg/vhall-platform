import VmpRedPacketCommandWap from './src/main';

/* istanbul ignore next */
VmpRedPacketCommandWap.install = function (Vue) {
  Vue.component(VmpRedPacketCommandWap.name, VmpRedPacketCommandWap);
};

export default VmpRedPacketCommandWap;
