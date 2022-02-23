import VmpSignLive from './src/main';

/* istanbul ignore next */
VmpSignLive.install = function (Vue) {
  Vue.component(VmpSignLive.name, VmpSignLive);
};

export default VmpSignLive;
