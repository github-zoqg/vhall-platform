const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

const htmlConfig = {
  cdnJs: {
    vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.js',
    MiddleEventSdk:
      '//t-alistatic01.e.vhall.com/common-static/middle/middle-event-sdk/0.3.1/index.js',
    MiddleDomain:
      '//t-alistatic01.e.vhall.com/common-static/middle/middle-domain/1.3.18/middle-domain.js'
  }
};

module.exports = _.merge(baseConfig, {
  pages: {
    index: {
      ...htmlConfig
    }
  }
});
