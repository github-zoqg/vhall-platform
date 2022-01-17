import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import domainStore from './domain';
// 导入样式及皮肤
import './assets/styles/common.less';
import './assets/styles/skins/index.less';

// 初始化
initGlobalAPI();

Vue.config.productionTip = false;
Vue.config.devtools = true;

window.root = new Vue({
  router,
  i18n,
  domainStore,
  render: h => h(App)
}).$mount('#app');
