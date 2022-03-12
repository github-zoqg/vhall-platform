import VmpSignWatch from './src/main';

/* istanbul ignore next */
VmpSignWatch.install = function (Vue) {
  Vue.component(VmpSignWatch.name, VmpSignWatch);
};

export default VmpSignWatch;
