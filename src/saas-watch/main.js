import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import(`./assets/styles/skins/${window.$globalConfig.currentSkin}.less`);
import './domain';

// 初始化
initGlobalAPI();

Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount('#app');
