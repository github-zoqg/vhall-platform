import VmpOffical from './src/main';

/* istanbul ignore next */
VmpOffical.install = function (Vue) {
  Vue.component(VmpOffical.name, VmpOffical);
};

export default VmpOffical;
