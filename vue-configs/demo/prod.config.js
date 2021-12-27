const baseConfig = require('./base.config');
const _ = require('lodash');

const prodConfig = {
  /*** demo直播pc端工程配置 ****/
  'live-pc': {
    version: '1.0.0',
    title: 'demo直播PC',
    theme: 'default'
  }
};

const resultConfig = _.merge(baseConfig, prodConfig);

module.exports = resultConfig;
