import VmpWapDesktopScreen from './src/main';

/* istanbul ignore next */
VmpWapDesktopScreen.install = function (Vue) {
  Vue.component(VmpWapDesktopScreen.name, VmpWapDesktopScreen);
};

export default VmpWapDesktopScreen;
