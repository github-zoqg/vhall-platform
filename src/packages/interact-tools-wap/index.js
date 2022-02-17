import interactToolsWap from './src/main';

interactToolsWap.install = function (Vue) {
  Vue.component(interactToolsWap.name, interactToolsWap);
};

export default interactToolsWap;
