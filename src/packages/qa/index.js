import Qa from './src/main';

/* istanbul ignore next */
Qa.install = function (Vue) {
  Vue.component(Qa.name, Qa);
};

export default Qa;
