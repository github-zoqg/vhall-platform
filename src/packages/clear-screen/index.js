import ClearScreen from './src/main';

/* istanbul ignore next */
ClearScreen.install = function (Vue) {
  Vue.component(ClearScreen.name, ClearScreen);
};

export default ClearScreen;
