import PcPrise from './src/pcMain';

/* istanbul ignore next */
PcPrise.install = function (Vue) {
  Vue.component(PcPrise.name, PcPrise);
};

export default PcPrise;
