import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { initGlobalAPI, i18n } from './core';
import domainStore from './domain';

import 'overlayscrollbars/css/OverlayScrollbars.css';
// 导入样式及皮肤
import './assets/styles/common.less';
import './assets/styles/skins/index.less';

import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';

// sentry模块
import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';

// code码相关翻译方法 老代码
Vue.prototype.$tes = function (path) {
  return this.$te(path) ? this.$t(path) : undefined;
};

// 初始化
initGlobalAPI();
//初始化滚动插件，也可以考虑局部引用，这个可能会有其他组件使用
Vue.use(OverlayScrollbarsPlugin);
Vue.config.productionTip = false;
Vue.config.devtools = true;

if (process.env.NODE_ENV !== 'development') {
  // Sentry监控探针
  Sentry.init({
    Vue,
    dsn: 'https://840242dc84b6435fbe79ebd7850f2a9a@sentry.vhall.com/20',
    release: `${process.env.VUE_APP_BUILD_VERSION}`,
    // environment 上报的环境 建议 按照 测试、生产区分
    environment: process.env.NODE_ENV,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: [
          'test4-saas-webinar.vhall.com/',
          'dev-csd-saas-wap.vhall.com',
          'test-csd-saas-wap.vhall.com',
          'csd-saas-wap.vhall.com',
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
}

new Vue({
  router,
  i18n,
  domainStore,
  render: h => h(App)
}).$mount('#app');
