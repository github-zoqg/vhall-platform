import _ from 'lodash';
import { resolve } from 'path';
import fs from 'fs';
import { DEFAULT_CONF } from './static.js';

export function getViteShellCmdArgs() {
  const prefix = 'VITE_SHELL_CMD_';
  const env = process.env;
  let vite_shell_cmd = {};

  for (const key in env) {
    if (Object.hasOwnProperty.call(env, key)) {
      if (key.startsWith(prefix)) {
        const element = env[key];
        vite_shell_cmd[key] = element;
      }
    }
  }
  return vite_shell_cmd;
}

export function getPortByDevPortFile({ projectName = DEFAULT_CONF.PROJECT_NAME }) {
  const devPortFilePath = resolvePathByRoot('./devport.json');
  if (!fs.existsSync(devPortFilePath)) return DEFAULT_CONF.DEV_SERVER_PORT;

  const conf = require(devPortFilePath);
  return conf[projectName] || DEFAULT_CONF.DEV_SERVER_PORT;
}

/**
 * env全名转化为短名。如production=>prod
 * @param {*} fullEnvString
 * @returns
 */
export function getShortEnvAlias(fullEnvString) {
  const shortMap = new Map([
    ['development', 'dev'],
    ['test', 'test'],
    ['production', 'prod']
  ]);

  return shortMap.get(fullEnvString) || fullEnvString;
}

export function getProjectConfigByName(name, options = {}) {
  const { VUE_APP_SAAS_ENV } = options.custom_env;

  const env = getShortEnvAlias(VUE_APP_SAAS_ENV);

  const baseConf = require(resolvePathByRoot(`./src/${name}/build/vite.base.config`));
  const conf = require(resolvePathByRoot(`./src/${name}/build/vite.${env}.config`));

  if (options.merge === true) return _.merge(baseConf, conf);
  return { baseConf, conf };
}

export function getProjectConfigByArgs(options = {}) {
  const { VITE_SHELL_CMD_PROJECT: project } = getViteShellCmdArgs();
  return getProjectConfigByName(project, options);
}

export function resolvePathByRoot(...args) {
  const root = resolve(__dirname, '../../');
  return resolve(root, ...args);
}

export function parseDotEnvFile(envMode) {
  const dotenv = require('dotenv');
  const file = fs.readFileSync(resolvePathByRoot(`.env.${envMode}`));
  const buf = Buffer.from(file);
  const config = dotenv.parse(buf);
  return config;
}
