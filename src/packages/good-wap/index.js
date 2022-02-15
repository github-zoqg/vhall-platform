import GoodWap from './src/main';

/* istanbul ignore next */
GoodWap.install = function (Vue) {
  Vue.component(GoodWap.name, GoodWap);
};

export default GoodWap;
