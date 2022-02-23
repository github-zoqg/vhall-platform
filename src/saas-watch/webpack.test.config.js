const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {
    vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.js',
    MiddleEventSdk:
      '//t-alistatic01.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    MiddleDomain:
      '//t-alistatic01.e.vhall.com/common-static/middle/middle-domain/1.0.6/middle-domain.js'
  },
  cdnCss: {
    iconfontCommon:
      '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-pc/v1.0.1/iconfont.css',
    iconfont:
      '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-saas/v1.0.0/iconfont.css'
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});
