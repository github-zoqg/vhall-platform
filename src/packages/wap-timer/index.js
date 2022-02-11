import WapTimer from './src/main';

/* istanbul ignore next */
WapTimer.install = function (Vue) {
  Vue.component(WapTimer.name, WapTimer);
};

export default WapTimer;
