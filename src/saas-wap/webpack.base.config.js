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
    jsCookie: '//s1.e.vhall.com/common-static/middle/js-cookie/3.0.1/js.cookie.min.js',
    VueI18n: '//s1.e.vhall.com/common-static/middle/vue-i18n/8.26.7/vue-i18n.min.js',

    // 通过s3域名加载
    Vant: '//s3.e.vhall.com/common-static/middle/vant/2.12.34/dist/vant.min.js',
    loadJs: '//s3.e.vhall.com/common-static/middle/loadjs/4.2.0/loadjs.min.js',

    loadLazyWap: '//s3.e.vhall.com/common-static/middle/loadLazyWap/1.1.0/index.min.js',
    // iOSUserScalable: '//s3.e.vhall.com/common-static/middle/iOSUserScalable/1.1.0/index.min.js',
    ElementUi: '//s3.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/index.js',

    // 可以延迟加载的
    // TODO: 图片验证码涉及到的地方，需引入该文件，如何放置
    imageYunDun: '//cstaticdun.126.net/load.min.js?t=201903281201',
    jsencrypt: '//s3.e.vhall.com/common-static/middle/jsencrypt/3.2.1/dist/jsencrypt.min.js',

    // 自开发依赖
    MiddleEventSdk: '//s2.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    MiddleDomain: 'http://localhost:10001/lib/middle-domain.js'
  },
  // cdn css
  cdnCss: {
    ElementUi: '//s2.e.vhall.com/common-static/middle/element-ui/lib/2.6.2/theme-chalk/index.css',
    Vant: '//s2.e.vhall.com/common-static/middle/vant/2.12.34/dist/index.css',
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
            exclude: /node_modules/,
            minPixelValue: 2 //设置要替换的最小像素值(2px会被转rem)。 默认 0
          })
        ]
      }
    }
  }
};
