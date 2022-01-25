import Cash from './src/main';

/* istanbul ignore next */
Cash.install = function (Vue) {
  Vue.component(Cash.name, Cash);
};

export default Cash;
