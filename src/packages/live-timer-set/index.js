import VmpLiveTimerSet from './src/main';

/* istanbul ignore next */
VmpLiveTimerSet.install = function (Vue) {
  Vue.component(VmpLiveTimerSet.name, VmpLiveTimerSet);
};

export default VmpLiveTimerSet;
