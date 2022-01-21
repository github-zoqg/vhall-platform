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
    vue: '//t-alistatic01.e.vhall.com/3rdlibs/vue/2.6.14/vue.min.js',
    VueRouter: '//t-alistatic01.e.vhall.com/3rdlibs/vue-router/3.5.2/vue-router.min.js',
    Moment: '//cnstatic01.e.vhall.com/common-static/middle/moment/2.29.1/dist/moment.min.js',
    VueI18n: '//cnstatic01.e.vhall.com/common-static/middle/vue-i18n/8.26.7/vue-i18n.min.js',
    MiddleEventSdk:
      '//cnstatic01.e.vhall.com/common-static/middle/middle-event-sdk/0.0.1/index.min.js',
    MiddleDomain:
      '//cnstatic01.e.vhall.com/common-static/middle/middle-domain/1.0.0/dist/lib/middleDomain.js',
    ElementUi: '//cnstatic01.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/index.js',
    doc: '//static.vhallyun.com/jssdk/vhall-jssdk-doc/latest/vhall-jssdk-doc-3.2.0.js',
    chat: '//static.vhallyun.com/jssdk/vhall-jssdk-chat/latest/vhall-jssdk-chat-2.1.4.js',
    player: '//static.vhallyun.com/jssdk/vhall-jssdk-player/latest/vhall-jssdk-player-2.4.0.js',
    interaction:
      '//static.vhallyun.com/jssdk/vhall-jssdk-interaction/latest/vhall-jssdk-interaction-2.3.6.js',
    vhallReport: '//cnstatic01.e.vhall.com/common-static/middle/middle-log/1.0.0/index.min.js',
    middleLog: '//t-alistatic01.e.vhall.com/common-static/middle/middle-log/1.0.1/index.min.js'
  },
  // cdn css
  cdnCss: {
    ElementUi:
      '//cnstatic01.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/theme-chalk/index.css',
    iconfont: '//static-component.vhall.com/iconfont/saas/v1/pc-lives/iconfont.css'
  },
  // dns-prefetch
  dnsPrefetch: {
    open: false,
    dns: {
      't-alistatic01': '//t-alistatic01.e.vhall.com'
    }
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
      ...htmlConfig
    }
  }
};
