const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {
    // 开发环境采用非压缩版vue.js方便查找问题
    vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.js',
    // 开发环境domain
    MiddleDomain: 'http://172.16.21.101:10001/lib/middle-domain.js'
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});