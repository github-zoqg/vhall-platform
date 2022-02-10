const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {
    vhallReport: '//t-alistatic01.e.vhall.com/common-static/middle/middle-log/1.0.1/index.min.js'
  },
  cdnCss: {
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
