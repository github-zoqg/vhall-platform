window.$service = new Map();
import Vue from 'vue';
import App from './App.vue';
import './config';
import { initI18n } from '@/packages/locales/index.js';
import router from './router';

Vue.config.productionTip = false;

// 挂载i18n
const i18n = initI18n('zh');

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount('#app');
