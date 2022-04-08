import PcPlayer from './src/main';

/* istanbul ignore next */
PcPlayer.install = function (Vue) {
  Vue.component(PcPlayer.name, PcPlayer);
};

export default PcPlayer;
