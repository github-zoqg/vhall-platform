import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import domainStore from './domain';
// 导入样式及皮肤
import './assets/styles/common.less';
import './assets/styles/skins/index.less';

import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';

// 初始化
initGlobalAPI();

Vue.config.productionTip = false;
Vue.config.devtools = true;

// Sentry监控探针
Sentry.init({
  Vue,
  dsn: 'https://a8d7c8deb63541239a0e9fcb538187bb@sentry.vhall.com/17',
  release: `${process.env.VUE_APP_BUILD_VERSION}`,
  // environment 上报的环境 建议 按照 测试、生产区分
  environment: process.env.NODE_ENV,
  integrations: [
    new Integrations.BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracingOrigins: [
        // 'localhost',
        'dev-csd-saas-web.vhall.com',
        'test-csd-saas-web.vhall.com',
        'csd-saas-web.vhall.com',
        // 'e.vhall.com',
        /^\//
      ]
    })
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});

window.root = new Vue({
  router,
  i18n,
  domainStore,
  render: h => h(App)
}).$mount('#app');
