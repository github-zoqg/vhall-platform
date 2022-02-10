import VmpLiveTimer from './src/main';

/* istanbul ignore next */
VmpLiveTimer.install = function (Vue) {
  Vue.component(VmpLiveTimer.name, VmpLiveTimer);
};

export default VmpLiveTimer;
