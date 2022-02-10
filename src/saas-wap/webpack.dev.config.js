const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  // cdn css
  cdnCss: {
    iconfont:
      '//t-alistatic01.e.vhall.com/common-static/middle/iconfont/vh-saas-pc/v1.0.1/iconfont.css'
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
