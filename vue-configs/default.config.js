/**
 * 默认通用全量配置字段
 */
module.exports = {
  version: '',
  title: '',

  // html模板页面配置字段
  htmlConfig: {
    // cdn js
    cdnJs: {
      vue: '//t-alistatic01.e.vhall.com/3rdlibs/vue/2.6.14/vue.min.js',
      VueRouter: '//t-alistatic01.e.vhall.com/3rdlibs/vue-router/3.5.2/vue-router.min.js',
      MiddleEventSdk:
        '//cnstatic01.e.vhall.com/common-static/middle/middle-event-sdk/0.0.1/index.min.js'
    },
    // cdn css
    cdnCss: {},
    // dns-prefetch
    dnsPrefetch: {
      open: true,
      dns: {
        jsdelivr: '//t-alistatic01.e.vhall.com'
      }
    }
  }
};
