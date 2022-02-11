import VmpWatchTimer from './src/main';

/* istanbul ignore next */
VmpWatchTimer.install = function (Vue) {
  Vue.component(VmpWatchTimer.name, VmpWatchTimer);
};

export default VmpWatchTimer;
