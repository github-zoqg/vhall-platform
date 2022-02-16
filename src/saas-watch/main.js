import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import(`./assets/styles/skins/${window.$globalConfig.currentSkin}.less`);
import domainStore from './domain';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
// 初始化
initGlobalAPI();
//初始化滚动插件，也可以考虑局部引用，这个可能会有其他组件使用
Vue.use(OverlayScrollbarsPlugin);
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
