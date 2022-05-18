const _ = require('lodash');
const baseConfig = require('./webpack.base.config');
const domainVersion = require('../../package.json').domainVersion;

const htmlConfig = {
  cdnJs: {
    // 测试环境采用非压缩版vue.js方便查找问题
    vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.js',
    MiddleDomain: `//t-alistatic01.e.vhall.com/common-static/middle/middle-domain/${domainVersion}/middle-domain.js`
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});
