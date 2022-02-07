import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import domainStore from './domain';

import 'overlayscrollbars/css/OverlayScrollbars.css';
// 导入样式及皮肤
import './assets/styles/common.less';
import './assets/styles/skins/index.less';

import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
// 初始化
initGlobalAPI();
//初始化滚动插件，也可以考虑局部引用，这个可能会有其他组件使用
Vue.use(OverlayScrollbarsPlugin);
Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  router,
  i18n,
  domainStore,
  render: h => h(App)
}).$mount('#app');
