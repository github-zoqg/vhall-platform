const { CDN_DOMAIN } = require('../../../build/vite-config/static');
const domainVersion = require('../../../package.json').domainVersion;

module.exports = {
  cdn: {
    js: {
      vue: `${CDN_DOMAIN.T1}/common-static/middle/vue/2.6.14/dist/vue.js`,
      MiddleDomain: `${CDN_DOMAIN.T1}/common-static/middle/middle-domain/${domainVersion}/middle-domain.js`
    }
  }
};
