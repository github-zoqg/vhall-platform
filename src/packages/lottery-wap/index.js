import VmpLotteryWap from './src/main';

/* istanbul ignore next */
VmpLotteryWap.install = function (Vue) {
  Vue.component(VmpLotteryWap.name, VmpLotteryWap);
};

export default VmpLotteryWap;
