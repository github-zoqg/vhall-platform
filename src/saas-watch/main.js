import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import domainStore from './domain';

// 导入样式及皮肤
import './assets/styles/common.less';
// import './assets/styles/skins/index.less';

// 初始化
initGlobalAPI();

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.prototype.$tec = function (path) {
  return this.$te(path) ? this.$t(path) : undefined;
};

// 限制按钮重复点击
Vue.directive('preventReClick', {
  inserted: function (el, binding) {
    el.addEventListener('click', () => {
      if (!el.disabled) {
        el.disabled = true;
        setTimeout(() => {
          el.disabled = false;
        }, binding.value || 3000);
      }
    });
  }
});

new Vue({
  router,
  i18n,
  domainStore,
  render: h => h(App)
}).$mount('#app');
