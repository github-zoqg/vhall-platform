import VmpRecommend from './src/main.vue';

VmpRecommend.install = function (Vue) {
  Vue.component(VmpRecommend.name, VmpRecommend);
};

export default VmpRecommend;
