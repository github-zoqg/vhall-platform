import Vue from 'vue';
import * as Sentry from '@sentry/vue';

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
