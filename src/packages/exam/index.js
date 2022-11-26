import VmpExam from './src/main';

/* istanbul ignore next */
VmpExam.install = function (Vue) {
  Vue.component(VmpExam.name, VmpExam);
};

export default VmpExam;
