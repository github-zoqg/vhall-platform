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
    vue: '//cnstatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.min.js',
    VueRouter:
      '//cnstatic01.e.vhall.com/common-static/middle/vue-router/3.5.3/dist/vue-router.min.js',
    Moment: '//cnstatic01.e.vhall.com/common-static/middle/moment/2.29.1/dist/moment.min.js',
    VueI18n: '//cnstatic01.e.vhall.com/common-static/middle/vue-i18n/8.26.7/vue-i18n.min.js',
    MiddleEventSdk: '//cnstatic01.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    // MiddleDomain:
    //   '//cnstatic01.e.vhall.com/common-static/middle/middle-domain/1.0.0/dist/lib/middleDomain.js',
    MiddleDomain: 'http://localhost:10001/lib/middle-domain.js',
    ElementUi: '//cnstatic01.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/index.js',
    lodash: '//cnstatic01.e.vhall.com/common-static/middle/lodash/4.17.21/lodash.min.js'
    // vhallReport: '//cnstatic01.e.vhall.com/common-static/middle/middle-log/1.0.0/index.min.js'
    // doc: '//static.vhallyun.com/jssdk/vhall-jssdk-doc/latest/vhall-jssdk-doc-3.2.0.js',
    // chat: '//static.vhallyun.com/jssdk/vhall-jssdk-chat/latest/vhall-jssdk-chat-2.1.4.js',
    // player: '//static.vhallyun.com/jssdk/vhall-jssdk-player/latest/vhall-jssdk-player-2.4.0.js',
    // interaction:
    //   '//static.vhallyun.com/jssdk/vhall-jssdk-interaction/latest/vhall-jssdk-interaction-2.3.6.js'
  },
  // cdn css
  cdnCss: {
    ElementUi:
      '//cnstatic01.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/theme-chalk/index.css',
    // iconfontCommon:
    //   '//cnstatic01.e.vhall.com/common-static/middle/iconfont/vh-pc/v1.0.1/iconfont.css',
    // iconfont: '//cnstatic01.e.vhall.com/common-static/middle/iconfont/vh-saas/v1.0.0/iconfont.css',
    // 开发时暂时使用阿里链接，后面改成自己的cdn
    iconfontCommon: '//at.alicdn.com/t/font_3128919_2n58q9eofef.css',
    iconfont: '//at.alicdn.com/t/font_3120276_rr4jn6e192a.css'
  },
  // dns-prefetch
  dnsPrefetch: {
    open: false,
    dns: {
      't-alistatic01': '//t-alistatic01.e.vhall.com'
    }
  }
};

let outputDir = path.join(pathConfig.ROOT, 'dist', pkg.name);

module.exports = {
  outputDir: outputDir,
  pages: {
    index: {
      entry: path.join(pathConfig.SRC, pkg.name, 'main.js'),
      filename: 'index.html',
      template: path.join(pathConfig.PUBLIC, 'index.html'),
      title: pkg.title,
      version: pkg.version,
      ...htmlConfig
    }
  }
};
