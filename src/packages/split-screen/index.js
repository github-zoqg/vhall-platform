import splitScreen from './src/main';

/* istanbul ignore next */
splitScreen.install = function (Vue) {
  Vue.component(splitScreen.name, splitScreen);
};

export default splitScreen;
