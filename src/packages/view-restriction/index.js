import VmpViewRestriction from './src/main';

/* istanbul ignore next */
VmpViewRestriction.install = function (Vue) {
  Vue.component(VmpViewRestriction.name, VmpViewRestriction);
};

export default VmpViewRestriction;
