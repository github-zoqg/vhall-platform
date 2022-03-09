import WapStreamRemote from './src/main';

/* istanbul ignore next */
WapStreamRemote.install = function (Vue) {
  Vue.component(WapStreamRemote.name, WapStreamRemote);
};

export default WapStreamRemote;
