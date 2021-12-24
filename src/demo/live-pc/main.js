window.$service = new Map();
import Vue from 'vue';
import App from './App.vue';
import './config';
import { initI18n } from '@/packages/locales/index.js';
import router from './router';
// element-ui 样式重置
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/icon-font/iconfont.css';

Vue.use(ElementUI);
Vue.config.productionTip = false;

// 挂载i18n
const i18n = initI18n('zh');

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount('#app');
