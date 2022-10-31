const _ = require('lodash');
const baseConfig = require('./webpack.base.config');
const domainVersion = require('../../package.json').domainVersion;

const htmlConfig = {
  cdnJs: {
    // 测试环境采用非压缩版vue.js方便查找问题
    vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.js',
    MiddleDomain: `//t-alistatic01.e.vhall.com/common-static/middle/middle-domain/${domainVersion}/middle-domain.js`
  },
  // dns-prefetch
  dnsPrefetch: {
    open: true, //是否开启dns预解析
    dns: {
      // 通用
      cnstatic01: 'cnstatic01.e.vhall.com',
      staticVhallyun: 'static.vhallyun.com',
      s1: 's1.e.vhall.com',
      s2: 's2.e.vhall.com',
      s3: 's3.e.vhall.com',
      s4: 's4.e.vhall.com',
      // 测试环境
      talistatic01: 't-alistatic01.e.vhall.com',
      ts1: 't-s1.e.vhall.com',
      ts2: 't-s2.e.vhall.com',
      ts3: 't-s3.e.vhall.com',
      ts4: 't-s4.e.vhall.com'
    }
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});
