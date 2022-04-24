const _ = require('lodash');
const baseConfig = require('./webpack.base.config');
const domainVersion = require('./package.json').testDomainVersion;

const htmlConfig = {
  cdnJs: {
    vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.js',
    MiddleDomain: `//cnstatic01.e.vhall.com/common-static/middle/middle-domain/${domainVersion}/middle-domain.js`
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});
