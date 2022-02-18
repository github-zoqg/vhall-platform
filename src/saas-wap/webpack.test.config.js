const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {
    vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/dist/2.6.14/vue.js'
  },
  cdnCss: {
    iconfont: '//cnstatic01.e.vhall.com/common-static/middle/iconfont/vh-saas/v1.0.0/iconfont.css'
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});
