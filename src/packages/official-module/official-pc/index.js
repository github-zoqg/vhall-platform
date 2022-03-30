import VmpOfficialPc from './src/main';
/* istanbul ignore next */
VmpOfficialPc.install = function (Vue) {
  Vue.component(VmpOfficialPc.name, VmpOfficialPc);
};

export default VmpOfficialPc;
