import WatchNavMenu from './src/main';

/* istanbul ignore next */
WatchNavMenu.install = function (Vue) {
  Vue.component(WatchNavMenu.name, WatchNavMenu);
};

export default WatchNavMenu;
