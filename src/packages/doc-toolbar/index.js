import VmpDocToolbar from './src/main';

/* istanbul ignore next */
VmpDocToolbar.install = function (Vue) {
  Vue.component(VmpDocToolbar.name, VmpDocToolbar);
};

export default VmpDocToolbar;
