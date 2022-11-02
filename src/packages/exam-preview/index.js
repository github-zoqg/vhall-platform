import VmpExamPreview from './src/main';

/* istanbul ignore next */
VmpExamPreview.install = function (Vue) {
  Vue.component(VmpExamPreview.name, VmpExamPreview);
};

export default VmpExamPreview;
