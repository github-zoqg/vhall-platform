const { CDN_DOMAIN } = require('../../../build/vite-config/static');

const config = {
  project: {
    name: 'saas-wap',
    isWap: true
  },
  cdn: {
    externalsVar: {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      'vue-i18n': 'VueI18n',
      'element-ui': 'ELEMENT',
      'middle-domain': 'middleDomain',
      'vh5-ui': 'vant',
      lodash: '_',
      html2canvas: 'html2canvas',
      overlayscrollbars: 'OverlayScrollbars'
    },
    js: {
      // S1
      vue: `${CDN_DOMAIN.S1}/common-static/middle/vue/2.6.14/dist/vue.min.js`,
      VueRouter: `${CDN_DOMAIN.S1}/common-static/middle/vue-router/3.5.3/dist/vue-router.min.js`,
      VueI18n: `${CDN_DOMAIN.S1}/common-static/middle/vue-i18n/8.26.7/vue-i18n.min.js`,
      lodash: `${CDN_DOMAIN.S1}/common-static/middle/lodash/4.17.21/lodash.min.js`,
      loadJs: `${CDN_DOMAIN.S1}/common-static/middle/loadjs/4.2.0/loadjs.min.js`,

      // S2
      Vh5Ui: `${CDN_DOMAIN.S2}/common-static/middle/vh5-ui/1.0.4/js/vh5-ui.min.js`,
      MiddleEventSdk: `${CDN_DOMAIN.S2}/common-static/middle/middle-event-sdk/0.3.1/index.js`,

      ElementUi: `${CDN_DOMAIN.S2}/common-static/middle/element-ui/lib/2.6.2/index.js`,
      html2canvas: `${CDN_DOMAIN.S2}/common-static/middle/html2canvas/1.0.0-rc.4/html2canvas.min.js`,
      overlayscrollbars: `${CDN_DOMAIN.S2}/common-static/middle/overlayscrollbars/1.13.1/js/OverlayScrollbars.min.js`,
      dayjs: `${CDN_DOMAIN.S2}/common-static/middle/dayjs/1.10.8/dayjs.min.js`,
      duration: `${CDN_DOMAIN.S2}/common-static/middle/dayjs/1.10.8/plugins/duration.js`,
      loadLazyWap: `${CDN_DOMAIN.S2}/common-static/middle/loadLazyWap/1.1.0/index.min.js`,
      VhallUI: '//s2.e.vhall.com/common-static/ui/vhall-ui-lib/vh/1.1.1/index.js', // vhallUI
      form: 'https://vhallstatic.oss-cn-beijing.aliyuncs.com/common-static/vhall-form/vhall-form-vue.js',

      // 其他
      imageYunDun: `//cstaticdun.126.net/load.min.js?t=201903281201`,
      MiddleDomain: `http://localhost:10001/lib/middle-domain.js`
    },
    css: {
      //S3
      ElementUi: `${CDN_DOMAIN.S3}/common-static/middle/element-ui/lib/2.6.2/theme-chalk/index.css`,
      Vh5Ui: `${CDN_DOMAIN.S3}/common-static/middle/vh5-ui/1.0.4/css/vh5-ui.min.css`,
      iconfontCommon: `${CDN_DOMAIN.S3}/common-static/middle/iconfont/vh-saas/v1.0.5/iconfont.min.css`,
      iconfont: `${CDN_DOMAIN.S3}/common-static/middle/iconfont/vh-pc/v1.0.10/iconfont.min.css`,
      overlayscrollbarsCss: `${CDN_DOMAIN.S3}/common-static/middle/overlayscrollbars/1.13.1/css/OverlayScrollbars.min.css`,
      VhallUI: '//s2.e.vhall.com/common-static/ui/vhall-ui-lib/vh/1.1.1/index.css'
    }
  },
  less: {
    additionalData: `
    @import "@/saas-wap/assets/styles/variables.less";
    @import "@/saas-wap/assets/styles/mixins.less";
    `
  }
};

module.exports = config;
