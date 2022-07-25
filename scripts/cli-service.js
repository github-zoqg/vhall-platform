/**
 * Created by yangxy on 2021/12/07.
 */
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const btool = require('./btool');
const pathConfig = require('./path-config');
const { execSync } = require('child_process');
const spinner = ora();
const cLog = console.log;

const argv = process.argv;
// cLog(chalk.bold.bgBlue(` process.argv `), argv);
// 检查参数的有效性
if (!btool.checkValidArgs(argv)) {
  process.exit(1);
}

// 解析参数成数组形式：[ 'serve', '--project=live-pc', '--mode=development' ]
const cmdArgs = Array.prototype.slice.call(argv, 2);

// 解析参数成key-value形式：
// {
//   _: ['serve'],
//   project: 'live-pc',
//   mode: 'development'
// };
const args = btool.parseArgv(argv);
// 获取项目名
const { project, _, mode } = args;
// 获取root package.json
const pkg = require(path.join(pathConfig.ROOT, 'package.json'));
// 补充版本号
cmdArgs.push(`--version=${pkg.version}`);
// 转成命令选项为字符串: 'serve --project=live-pc --mode=development --version=1.0.0'
const cmdOption = cmdArgs.join(' ');
const cmd = _[0];
// 获取各种环境
const vueMode = btool.getVueMode(cmd, mode);
const nodeEnv = btool.getEnv(vueMode, 'NODE_ENV');
process.env.NODE_ENV = nodeEnv;
// 开启提示文字
btool.bootstripTip({
  Project: project,
  Version: pkg.version,
  Mode: `.env.${vueMode}`,
  NODE_ENV: nodeEnv
});

(async () => {
  if (cmd === 'build') {
    spinner.info(`${chalk.magenta('准备构建项目')}${chalk.magenta.bold(project)}\r\n`);
    // 进度开始
    spinner.start(`正在检查domain资源\n`);
    const { status } = await btool.checkDomainRes(project);
    if (status === 1) {
      spinner.succeed(chalk.green(`domain资源存在\n`));
    } else {
      spinner.fail(chalk.redBright('domain资源检查未通过'));
      process.exit(1);
    }
  }
  // 组织编译命令
  const cmdStr = `node_modules${path.sep}.bin${path.sep}vue-cli-service ${cmdOption}`;
  // cLog('cmdStr:', cmdStr);
  // 这里不使用 spinner提示进度，否则 ctrl+c 无法停止（暂时不知道原因）
  cLog('编译开始\r\n');
  // 执行命令
  execSync(cmdStr, { cwd: path.resolve(__dirname, '../'), stdio: 'inherit' });
})();
