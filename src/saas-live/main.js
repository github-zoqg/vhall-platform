import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import(`./assets/styles/skins/${window.$globalConfig.currentSkin}.less`);

import './domain';
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
  render: h => h(App)
}).$mount('#app');
