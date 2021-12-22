import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { loadConfig } from './service';

Vue.config.productionTip = false;
let app;
app = new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

loadConfig(app);
