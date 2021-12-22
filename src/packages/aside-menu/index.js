import AsideMenu from './src/main';

/* istanbul ignore next */
AsideMenu.install = function (Vue) {
  Vue.component(AsideMenu.name, AsideMenu);
};

export default AsideMenu;
