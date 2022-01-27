import VmpTabContainer from './src/main.vue';

VmpTabContainer.install = function (Vue) {
  Vue.component(VmpTabContainer.name, VmpTabContainer);
};

export default VmpTabContainer;
