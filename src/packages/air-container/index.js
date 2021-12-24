import VmpAirContainer from './src/main';

/* istanbul ignore next */
VmpAirContainer.install = function (Vue) {
  Vue.component(VmpAirContainer.name, VmpAirContainer);
};

export default VmpAirContainer;
