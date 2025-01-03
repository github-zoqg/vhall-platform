const { CDN_DOMAIN } = require('../../../build/vite-config/static');
const domainVersion = require('../../../package.json').domainVersion;

module.exports = {
  cdn: {
    prefetch: {
      isOpen: true,
      dns: {
        cnstatic01: 'cnstatic01.e.vhall.com',
        staticVhallyun: 'static.vhallyun.com',
        s1: 's1.e.vhall.com',
        s2: 's2.e.vhall.com'
      }
    },
    js: {
      vue: `${CDN_DOMAIN.T1}/common-static/middle/vue/2.6.14/dist/vue.js`,
      MiddleEventSdk: `${CDN_DOMAIN.S2}/common-static/middle/middle-event-sdk/0.3.1/index.js`,
      MiddleDomain: `${CDN_DOMAIN.S2}/common-static/middle/middle-domain/${domainVersion}/middle-domain.js`
    }
  }
};
