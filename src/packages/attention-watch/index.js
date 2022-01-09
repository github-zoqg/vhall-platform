import Attention from './src/main';

/* istanbul ignore next */
Attention.install = function (Vue) {
  Vue.component(Attention.name, Attention);
};

export default Attention;
