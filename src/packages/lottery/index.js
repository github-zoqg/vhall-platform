/**
 * @description lotteryWatch 为观看端组件  lotteryLive 为发起端组件
 */

// import VmpLotteryWatch from './src/index';
import VmpLotteryLive from './src/live';

// VmpLotteryWatch.install = function(Vue) {
//   Vue.component(VmpLotteryWatch.name, VmpLotteryWatch);
// };

/* istanbul ignore next */
VmpLotteryLive.install = function (Vue) {
  Vue.component(VmpLotteryLive.name, VmpLotteryLive);
};

export default VmpLotteryLive;

// export default {
//   VmpLotteryLive
//   // VmpLotteryWatch
// };
