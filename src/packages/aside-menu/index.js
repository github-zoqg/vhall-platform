import VmpAsideMenu from './src/main';

/* istanbul ignore next */
VmpAsideMenu.install = function (Vue) {
  Vue.component(VmpAsideMenu.name, VmpAsideMenu);
};

export default VmpAsideMenu;
