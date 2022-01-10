import PcMediaCheck from './src/main';

/* istanbul ignore next */
PcMediaCheck.install = function (Vue) {
  Vue.component(PcMediaCheck.name, PcMediaCheck);
};

export default PcMediaCheck;
