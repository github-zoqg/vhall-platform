// import './utils/dynamicLoad.js';
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import moment from 'moment';
import { initGlobal, i18n } from './core';
import 'highlight.js/styles/github.css';
import hljs from 'highlight.js';

hljs.highlightAll();

// 初始化
initGlobal();

Vue.prototype.$moment = moment;
Vue.config.productionTip = false;
Vue.config.devtools = true;

new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount('#app');
