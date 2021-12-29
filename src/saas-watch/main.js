import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobal, i18n } from './core';
import(`./assets/styles/skins/${window.$globalConfig.skin}.less`);
import moment from 'moment';
import './domain';

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
