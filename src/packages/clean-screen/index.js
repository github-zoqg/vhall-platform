import CleanScreen from './src/main';

/* istanbul ignore next */
CleanScreen.install = function (Vue) {
  Vue.component(CleanScreen.name, CleanScreen);
};

export default CleanScreen;
