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
    lodash: '//cnstatic01.e.vhall.com/common-static/middle/lodash/4.17.21/lodash.min.js',
    vue: '//cnstatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.min.js',
    VueRouter:
      '//cnstatic01.e.vhall.com/common-static/middle/vue-router/3.5.3/dist/vue-router.min.js',
    Moment: '//cnstatic01.e.vhall.com/common-static/middle/moment/2.29.1/dist/moment.min.js',
    VueI18n: '//cnstatic01.e.vhall.com/common-static/middle/vue-i18n/8.26.7/vue-i18n.min.js',

    MiddleEventSdk: '//cnstatic01.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    MiddleDomain: 'http://localhost:10001/lib/middle-domain.js',

    Vant: 'https://vhallstatic.oss-cn-beijing.aliyuncs.com/common-static/middle/vant/2.12.34/dist/vant.min.js',
    // TODO: 图片验证码涉及到的地方，需引入该文件，如何放置
    imageYunDun: '//cstaticdun.126.net/load.min.js?t=201903281201',
    jsencrypt: '//cnstatic01.e.vhall.com/common-static/middle/jsencrypt/3.2.1/dist/jsencrypt.min.js'
  },
  // cdn css
  cdnCss: {
    Vant: 'https://vhallstatic.oss-cn-beijing.aliyuncs.com/common-static/middle/vant/2.12.34/dist/index.css',
    // 开发时暂时使用阿里链接，后面改成自己的cdn
    iconfontCommon: '//at.alicdn.com/t/font_3128919_wa3mcobacyp.css',
    iconfont: '//at.alicdn.com/t/font_3120276_to9ja89x0p.css'
  },
  // dns-prefetch
  dnsPrefetch: {
    open: false
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
      isWap: true,
      ...htmlConfig
    }
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          // autoprefixer插件自动补全浏览器前缀
          require('autoprefixer'),

          require('postcss-pxtorem')({
            rootValue: 75, // 换算的基数
            // 忽略转换正则匹配项。插件会转化所有的样式的px。比如引入了三方UI，也会被转化。目前我使用 selectorBlackList字段，来过滤
            //如果个别地方不想转化px。可以简单的使用大写的 PX 或 Px 。
            // selectorBlackList: ['ig'],
            propList: ['*'],
            exclude: /node_modules/
          })
        ]
      }
    }
  }
};
