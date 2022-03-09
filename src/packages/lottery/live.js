/**
 * @description lotteryWatch 为观看端组件  lotteryLive 为发起端组件
 */

import VmpLotteryLive from './src/live';

/* istanbul ignore next */
VmpLotteryLive.install = function (Vue) {
  Vue.component(VmpLotteryLive.name, VmpLotteryLive);
};

export default VmpLotteryLive;
