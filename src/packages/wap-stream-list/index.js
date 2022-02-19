import WapStreamList from './src/main';

/* istanbul ignore next */
WapStreamList.install = function (Vue) {
  Vue.component(WapStreamList.name, WapStreamList);
};

export default WapStreamList;
