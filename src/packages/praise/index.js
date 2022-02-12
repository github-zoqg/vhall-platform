import PcPrise from './src/main';

/* istanbul ignore next */
PcPrise.install = function (Vue) {
  Vue.component(PcPrise.name, PcPrise);
};

export default PcPrise;
