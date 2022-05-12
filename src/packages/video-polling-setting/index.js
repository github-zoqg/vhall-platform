import VmpPollingSetting from './src/main';

/* istanbul ignore next */
VmpPollingSetting.install = function (Vue) {
  Vue.component(VmpPollingSetting.name, VmpPollingSetting);
};

export default VmpPollingSetting;
