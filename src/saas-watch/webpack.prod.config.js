const _ = require('lodash');
const baseConfig = require('./webpack.base.config');
const domainVersion = require('../../package.json').domainVersion;

const htmlConfig = {
  cdnJs: {
    MiddleEventSdk: '//s2.e.vhall.com/common-static/middle/middle-event-sdk/0.3.3/index.js',
    MiddleDomain: `//s2.e.vhall.com/common-static/middle/middle-domain/${domainVersion}/middle-domain.js`
  },
  // dns-prefetch
  dnsPrefetch: {
    open: true, //是否开启dns预解析
    dns: {
      cnstatic01: 'cnstatic01.e.vhall.com',
      staticVhallyun: 'static.vhallyun.com',
      s1: 's1.e.vhall.com',
      s2: 's2.e.vhall.com',
      s3: 's3.e.vhall.com',
      s4: 's4.e.vhall.com'
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
