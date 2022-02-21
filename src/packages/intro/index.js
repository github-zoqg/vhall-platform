import VmpIntro from './src/main';

VmpIntro.install = function (Vue) {
  Vue.component(VmpIntro.name, VmpIntro);
};

export default VmpIntro;
