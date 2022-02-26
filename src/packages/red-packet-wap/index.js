import VmpRedPacketWap from './src/main';

/* istanbul ignore next */
VmpRedPacketWap.install = function (Vue) {
  Vue.component(VmpRedPacketWap.name, VmpRedPacketWap);
};

export default VmpRedPacketWap;
