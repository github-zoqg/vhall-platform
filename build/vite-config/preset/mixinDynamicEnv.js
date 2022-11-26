const { getCmdArgs } = require('../../cli/run-utils');

export function mixinDynamicEnvVar(DOT_ENV = {}) {
  const args = getCmdArgs();
  const isDev = !DOT_ENV.NODE_ENV || DOT_ENV.NODE_ENV === 'development';

  let dynamic_env_var = {};

  if (['serve', 'build'].includes(args._[0])) {
    dynamic_env_var.VUE_APP_BUILD_VERSION = args.version;
    dynamic_env_var.VUE_APP_BUILD_HASH = args.hash;
  }

  // 中台路由base 为 xxxx/saas-live/xxxx
  if (!isDev && args.middle) {
    dynamic_env_var.VUE_APP_ROUTER_BASE_URL = `/${args.project}`;
  }

  return Object.assign({}, DOT_ENV, dynamic_env_var);
}
