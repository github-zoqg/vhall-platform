const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  // cdn css
  cdnCss: {
    // iconfontCommon: '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-pc/iconfont.css',
    iconfont:
      '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-saas-pc/v1.0.0/iconfont.css'
  }
};

module.exports = _.merge(
  {
    pages: {
      index: {
        ...htmlConfig
      }
    }
  },
  baseConfig
);
