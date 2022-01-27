import VmpTabMenu from './src/main.vue';

VmpTabMenu.install = function (Vue) {
  Vue.component(VmpTabMenu.name, VmpTabMenu);
};

export default VmpTabMenu;
