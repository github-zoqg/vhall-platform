import VmpTabMenuWap from './src/main.vue';
// tab-menu-wap可以和tab-container搭配。tab-container不区分pc/wap
VmpTabMenuWap.install = function (Vue) {
  Vue.component(VmpTabMenuWap.name, VmpTabMenuWap);
};

export default VmpTabMenuWap;
