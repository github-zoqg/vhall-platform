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
    vue: '//s1.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.min.js',
    VueRouter: '//s1.e.vhall.com/common-static/middle/vue-router/3.5.3/dist/vue-router.min.js',
    Moment: '//s1.e.vhall.com/common-static/middle/moment/2.29.1/dist/moment.min.js',
    VueI18n: '//s1.e.vhall.com/common-static/middle/vue-i18n/8.26.7/vue-i18n.min.js',
    loadJs: '//s1.e.vhall.com/common-static/middle/loadjs/4.2.0/loadjs.min.js',
    ElementUi: '//s1.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/index.js',

    // 自开发依赖
    MiddleEventSdk: '//s2.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    MiddleDomain: '' //空值，用于占位,具体环境中需配置覆盖此项

    // vhallReport: '//s2.e.vhall.com/common-static/middle/middle-log/1.0.0/index.min.js'
  },
  // cdn css
  cdnCss: {
    ElementUi: '//s2.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/theme-chalk/index.css',
    iconfontCommon: '//s2.e.vhall.com/common-static/middle/iconfont/vh-saas/v1.0.4/iconfont.css',
    iconfont: '//s2.e.vhall.com/common-static/middle/iconfont/vh-pc/v1.0.4/iconfont.css'
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
      version: pkg.version,
      hash: process.env.VUE_APP_BUILD_HASH, //gitlab jenkins对应的项目hash
      ...htmlConfig
    }
  }
};
