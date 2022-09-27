/***
 * 项目公用配置项
 * 配置参数：https://cli.vuejs.org/zh/config/#%E5%85%A8%E5%B1%80-cli-%E9%85%8D%E7%BD%AE
 */
const path = require('path');
const pathConfig = require('../../scripts/path-config');
const pkg = require('./package.json');

const htmlConfig = {
  // cdn js
  cdnJs: {
    // 第三方依赖
    lodash: '//s1.e.vhall.com/common-static/middle/lodash/4.17.21/lodash.min.js',
    vue: '//s1.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.min.js',
    VueRouter: '//s1.e.vhall.com/common-static/middle/vue-router/3.5.3/dist/vue-router.min.js',
    // Moment: '//s1.e.vhall.com/common-static/middle/moment/2.24.0/moment.min.js',
    VueI18n: '//s1.e.vhall.com/common-static/middle/vue-i18n/8.26.7/vue-i18n.min.js',
    loadJs: '//s1.e.vhall.com/common-static/middle/loadjs/4.2.0/loadjs.min.js',

    // 通过s2域名加载
    dayjs: '//s2.e.vhall.com/common-static/middle/dayjs/1.10.8/dayjs.min.js',
    duration: '//s2.e.vhall.com/common-static/middle/dayjs/1.10.8/plugins/duration.js',
    ElementUi: '//s2.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/index.js',
    overlayscrollbars:
      '//s2.e.vhall.com/common-static/middle/overlayscrollbars/1.13.1/js/OverlayScrollbars.min.js',
    // TODO: 图片验证码涉及到的地方，需引入该文件，如何放置
    imageYunDun: '//cstaticdun.126.net/load.min.js?t=201903281201',

    // 自开发依赖
    // MiddleEventSdk: '//s2.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    MiddleEventSdk: 'http://localhost:1234/sdk.js',
    MiddleDomain: ''
  },
  // cdn css
  cdnCss: {
    ElementUi: '//s3.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/theme-chalk/index.css',
    iconfontCommon:
      '//s3.e.vhall.com/common-static/middle/iconfont/vh-saas/v1.0.5/iconfont.min.css',
    iconfont: '//s3.e.vhall.com/common-static/middle/iconfont/vh-pc/v1.0.10/iconfont.min.css',
    overlayscrollbarsCss:
      '//s3.e.vhall.com/common-static/middle/overlayscrollbars/1.13.1/css/OverlayScrollbars.min.css'
  }
};

module.exports = {
  outputDir: path.join(pathConfig.ROOT, 'dist', pkg.name),
  pages: {
    index: {
      entry: path.join(pathConfig.SRC, pkg.name, 'main.js'),
      filename: 'index.html',
      template: path.join(pathConfig.PUBLIC, 'index.html'),
      title: pkg.title,
      version: process.env.VUE_APP_BUILD_VERSION,
      gitlabHash: process.env.VUE_APP_BUILD_HASH, //gitlab jenkins对应的项目hash
      env: process.env.VUE_APP_SAAS_ENV, // 环境标识
      ...htmlConfig
    }
  }
};
