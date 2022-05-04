import VmpWapPlayer from './src/main.vue';

VmpWapPlayer.install = function (Vue) {
  Vue.component(VmpWapPlayer.name, VmpWapPlayer);
};

export default VmpWapPlayer;
