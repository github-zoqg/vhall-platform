import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobal, i18n } from './core';

// 初始化
initGlobal();

Vue.config.productionTip = false;

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount('#app');
