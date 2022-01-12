import WatchAuth from './src/main';

/* istanbul ignore next */
WatchAuth.install = function (Vue) {
  Vue.component(WatchAuth.name, WatchAuth);
};

export default WatchAuth;
