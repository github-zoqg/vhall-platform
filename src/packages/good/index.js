import Good from './src/main';

/* istanbul ignore next */
Good.install = function (Vue) {
  Vue.component(Good.name, Good);
};

export default Good;
