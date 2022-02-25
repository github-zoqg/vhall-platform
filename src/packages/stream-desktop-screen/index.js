import StreamDesktopScreen from './src/main';

/* istanbul ignore next */
StreamDesktopScreen.install = function (Vue) {
  Vue.component(StreamDesktopScreen.name, StreamDesktopScreen);
};

export default StreamDesktopScreen;
