/**
 * @description lotteryWatch 为观看端组件  lotteryLive 为发起端组件
 */

import VmpLotteryWatch from './src/watch';

/* istanbul ignore next */
VmpLotteryWatch.install = function(Vue) {
  Vue.component(VmpLotteryWatch.name, VmpLotteryWatch);
};

export default VmpLotteryWatch