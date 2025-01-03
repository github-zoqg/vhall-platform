'use strict';

const vite = require('vite');
const istanbulLibInstrument = require('istanbul-lib-instrument');
const TestExclude = require('test-exclude');
const loadNycConfig = require('@istanbuljs/load-nyc-config');
const picocolors = require('picocolors');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e['default'] : e;
}

const TestExclude__default = /*#__PURE__*/ _interopDefaultLegacy(TestExclude);
const picocolors__default = /*#__PURE__*/ _interopDefaultLegacy(picocolors);

const { yellow } = picocolors__default;
const DEFAULT_EXTENSION = ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.vue'];
const COVERAGE_PUBLIC_PATH = '/__coverage__';
const PLUGIN_NAME = 'vite:istanbul';
const MODULE_PREFIX = '/@modules/';
const NULL_STRING = '\0';
function sanitizeSourceMap(rawSourceMap) {
  const { sourcesContent, ...sourceMap } = rawSourceMap;
  return JSON.parse(JSON.stringify(sourceMap));
}
function getEnvVariable(key, prefix, env) {
  if (Array.isArray(prefix)) {
    const envPrefix = prefix.find(pre => {
      const prefixedName = `${pre}${key}`;
      return env[prefixedName] != null;
    });
    prefix = envPrefix ?? '';
  }
  return env[`${prefix}${key}`];
}
function createTestExclude(opts) {
  const { nycrcPath, include, exclude, extension } = opts;
  const cwd = opts.cwd ?? process.cwd();
  const nycConfig = loadNycConfig.loadNycConfig({
    cwd,
    nycrcPath
  });
  return new TestExclude__default({
    cwd,
    include: include ?? nycConfig.include,
    exclude: exclude ?? nycConfig.exclude,
    extension: extension ?? nycConfig.extension ?? DEFAULT_EXTENSION,
    excludeNodeModules: true
  });
}
function istanbulPlugin(opts = {}) {
  const requireEnv = opts?.requireEnv ?? false;
  const checkProd = opts?.checkProd ?? true;
  const forceBuildInstrument = opts?.forceBuildInstrument ?? false;
  const coverageVariable = opts?.coverageVariable ?? '__coverage__';
  const logger = vite.createLogger('warn', { prefix: 'vite-plugin-istanbul' });
  const testExclude = createTestExclude(opts);
  const instrumenter = istanbulLibInstrument.createInstrumenter({
    coverageGlobalScopeFunc: false,
    coverageGlobalScope: 'window',
    coverageVariable,
    preserveComments: true,
    produceSourceMap: true,
    autoWrap: true,
    esModules: true
  });
  let enabled = true;
  return {
    name: PLUGIN_NAME,
    apply: forceBuildInstrument ? 'build' : 'serve',
    enforce: 'post',
    config(config) {
      if (!config.build?.sourcemap) {
        logger.warn(
          `${PLUGIN_NAME}> ${yellow(`Sourcemaps was automatically enabled for code coverage to be accurate.
 To hide this message set build.sourcemap to true, 'inline' or 'hidden'.`)}`
        );
        config.build = config.build || {};
        config.build.sourcemap = true;
      }
    },
    configResolved(config) {
      const { isProduction, env } = config;
      const { CYPRESS_COVERAGE } = process.env;
      const envPrefix = config.envPrefix ?? 'VITE_';
      const envCoverage = opts.cypress
        ? CYPRESS_COVERAGE
        : getEnvVariable('COVERAGE', envPrefix, env);
      const envVar = envCoverage?.toLowerCase() ?? '';
      if (
        (checkProd && isProduction && !forceBuildInstrument) ||
        (!requireEnv && envVar === 'false') ||
        (requireEnv && envVar !== 'true')
      ) {
        enabled = false;
      }
    },
    configureServer({ middlewares }) {
      if (!enabled) {
        return;
      }
      middlewares.use((req, res, next) => {
        if (req.url !== COVERAGE_PUBLIC_PATH) {
          return next();
        }
        const coverage = global.__coverage__ ?? null;
        let data;
        try {
          data = JSON.stringify(coverage, null, 4);
        } catch (ex) {
          return next(ex);
        }
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(data);
      });
    },
    transform(srcCode, id, options) {
      if (!enabled || options?.ssr || id.startsWith(MODULE_PREFIX) || id.startsWith(NULL_STRING)) {
        return;
      }
      if (testExclude.shouldInstrument(id)) {
        const sourceMap = sanitizeSourceMap(this.getCombinedSourcemap());
        const code = instrumenter.instrumentSync(srcCode, id, sourceMap);
        const map = instrumenter.lastSourceMap();
        return { code, map };
      }
    }
  };
}

module.exports = istanbulPlugin;
