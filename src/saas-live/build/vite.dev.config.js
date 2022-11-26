const { CDN_DOMAIN } = require('../../../build/vite-config/static');

module.exports = {
  project: {},
  cdn: {
    externalsVar: {},
    js: {
      vue: `${CDN_DOMAIN.T1}/common-static/middle/vue/2.6.14/dist/vue.js`,
      MiddleDomain: `http://localhost:10001/lib/middle-domain.js`
    },
    css: {}
  },
  less: {
    additionalData: `@import "@/saas-live/assets/styles/variables.less";`
  }
};
