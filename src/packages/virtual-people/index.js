import VirtualPeople from './src/main';

/* istanbul ignore next */
VirtualPeople.install = function (Vue) {
  Vue.component(VirtualPeople.name, VirtualPeople);
};

export default VirtualPeople;
