import InteractMenu from './src/main';

/* istanbul ignore next */
InteractMenu.install = function (Vue) {
  Vue.component(InteractMenu.name, InteractMenu);
};

export default InteractMenu;
