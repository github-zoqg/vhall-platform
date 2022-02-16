const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {},
  cdnCss: {
    iconfontCommon:
      '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-pc/v1.0.0/iconfont.css?t=20220216',
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
