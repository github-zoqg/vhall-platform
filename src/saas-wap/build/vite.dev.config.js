const { CDN_DOMAIN } = require('../../../build/vite-config/static');

const config = {
  cdn: {
    externalsVar: {},
    js: {
      vue: '//t-alistatic01.e.vhall.com/common-static/middle/vue/2.6.14/dist/vue.js',
      MiddleDomain: `http://localhost:10001/lib/middle-domain.js`
    },
    css: {}
  }
};

module.exports = config;
