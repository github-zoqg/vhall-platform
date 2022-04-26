const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {
    MiddleEventSdk: '//cnstatic01.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    MiddleDomain:
      '//cnstatic01.e.vhall.com/common-static/middle/middle-domain/1.3.20/middle-domain.js'
  },
  // dns-prefetch
  dnsPrefetch: {
    open: true, //是否开启dns预解
    dns: {
      cnstatic01: 'cnstatic01.e.vhall.com'
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
