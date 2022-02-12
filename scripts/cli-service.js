/**
 * Created by yangxy on 2021/12/07.
 */
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const btool = require('./btool');
const pathConfig = require('./path-config');
const { execSync } = require('child_process');

const argv = process.argv;
// console.log(chalk.bold.bgBlue(` process.argv `), argv);
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
const { project, mode } = args;
// 获取项目的package.json
const projectPkg = require(path.join(pathConfig.SRC, project, 'package.json'));
// 补充版本号
cmdArgs.push(`--version=${projectPkg.version}`);
// 转成命令选项为字符串: 'serve --project=live-pc --mode=development --version=1.0.0'
const cmdOption = cmdArgs.join(' ');

const spinner = ora();

//默认规则打包
runSingle(project, cmdOption, mode);

// 执行单条
async function runSingle(project, cmdOption) {
  const cmdStr = `node_modules${path.sep}.bin${path.sep}vue-cli-service ${cmdOption}`;
  spinner.color = 'magenta';
  // 进度开始
  // spinner.start(
  //   `${chalk.magenta('项目')}${chalk.magenta.bold(project)} ${chalk.magenta('编译开始')}\r\n`
  // );
  console.log(`${chalk.magenta('编译项目')}${chalk.magenta.bold(project)}\r\n`);
  // console.log(chalk.bold.bgBlue(` cmd `), chalk.bold.green(`${cmdStr}`));
  // 执行命令
  execSync(cmdStr, { cwd: path.resolve(__dirname, '../'), stdio: 'inherit' });

  // 执行成功
  // spinner.succeed(
  //   `${chalk.magenta('项目')}${chalk.magenta.bold(project)} ${chalk.magenta('编译结束')}\r\n`
  // );
}
