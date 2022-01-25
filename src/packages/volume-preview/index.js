import VmpVolumePreview from './src/main.vue';

/* istanbul ignore next */
VmpVolumePreview.install = function (Vue) {
  Vue.component(VmpVolumePreview.name, VmpVolumePreview);
};

export default VmpVolumePreview;
