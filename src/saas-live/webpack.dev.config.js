const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {
    vue: '//cnstatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.min.js'
    // vhallReport: '//t-alistatic01.e.vhall.com/common-static/middle/middle-log/1.0.1/index.min.js'
  },
  cdnCss: {
    iconfontCommon:
      '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-pc/v1.0.0/iconfont.css',
    iconfont:
      '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-saas-pc/v1.0.1/iconfont.css'
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});
