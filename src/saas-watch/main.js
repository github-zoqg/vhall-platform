import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import domainStore from './domain';
import '@/packages/app-shared/filters/index';

// 导入样式及皮肤
import './assets/styles/common.less';
// import './assets/styles/skins/index.less';

// sentry模块
import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';

// 初始化
initGlobalAPI();

Vue.config.productionTip = false;
Vue.config.devtools = true;

if (process.env.NODE_ENV !== 'development') {
  // Sentry监控探针
  Sentry.init({
    Vue,
    dsn: 'https://410ee8c0aa2b48749d22592b0e76cc68@sentry.vhall.com/19',
    release: `${process.env.VUE_APP_BUILD_VERSION}`,
    // environment 上报的环境 建议 按照 测试、生产区分
    environment: process.env.NODE_ENV,
    integrations: [],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  });
}

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
