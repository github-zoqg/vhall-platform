const minimist = require('minimist');
const pkg = require('../../package.json');

function getCmdArgs() {
  const cmdArgs = process.argv.slice(2); // 从 node build/cli 后开始解析
  cmdArgs.push(`--version=${pkg.version}`);
  return minimist(cmdArgs, { string: true });
}

module.exports = { getCmdArgs };
