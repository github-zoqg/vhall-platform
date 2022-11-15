const minimist = require('minimist');
const pkg = require('../../package.json');

function getCmdArgs() {
  const cmdArgs = process.argv.slice(2); // 从 node build/cli 后开始解析
  cmdArgs.push(`--version=${pkg.version}`);
  return minimist(cmdArgs, { string: true });
}

function parseEnvOption({ env_prefix, cmd_env_list }) {
  let new_cmd_list = cmd_env_list.map(([key, value]) => {
    key = `${env_prefix}${key}`;
    return `${key}=${value}`;
  });

  return new_cmd_list.join(' ');
}

module.exports = { getCmdArgs, parseEnvOption };
