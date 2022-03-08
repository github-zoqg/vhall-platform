import VmpCustomMenu from './src/main';

/* istanbul ignore next */
VmpCustomMenu.install = function (Vue) {
  Vue.component(VmpCustomMenu.name, VmpCustomMenu);
};

export default VmpCustomMenu;
