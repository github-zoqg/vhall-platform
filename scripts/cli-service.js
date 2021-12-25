/**
 * Created by yangxy on 2021/12/07.
 */
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const btool = require('./btool');
const { execSync } = require('child_process');

const argv = process.argv;
// console.log(chalk.bold.bgBlue(` process.argv `), argv);
// 检查参数的有效性
if (!btool.checkValidArgs(argv)) {
  process.exit(1);
}

// 解析参数成数组形式：[ 'serve', '--lob=demo', '--project=live-pc', '--mode=development' ]
const cmdArgs = Array.prototype.slice.call(argv, 2);
// 转成命令选项为字符串: 'serve --lob=demo --project=live-pc --mode=development'
const cmdOption = cmdArgs.join(' ');

// 解析参数成key-value形式：
// {
//   _: ['serve'],
//   lob: 'demo',
//   project: 'live-pc',
//   mode: 'development'
// };
const args = btool.parseArgv(argv);
const { lob, project } = args;
const spinner = ora();
if (project === 'all') {
  // 获取该业务线下的所有工程
  const projects = btool.getProjectNames(lob);
  const cmdOptions = {};
  for (const c of projects) {
    // TODO 工程名和目录名可能不一致
    cmdOptions[c] = cmdOption.replace('--project=all', `--project=${c}`);
  }
  runLoop(lob, cmdOptions);
} else {
  // 执行单条
  runSingle(lob, project, cmdOption);
}

/**
 * 执行多条，编译该业务线下的所有项目
 * @param {*} lob 业务线
 * @param {*} cmdOptions 命令参数数组
 */
async function runLoop(lob, cmdOptions) {
  for (let [key, value] of Object.entries(cmdOptions)) {
    await runSingle(lob, key, value);
  }
}

// 执行单条
async function runSingle(lob, project, cmdOption) {
  const cmdStr = `node_modules${path.sep}.bin${path.sep}vue-cli-service ${cmdOption}`;
  spinner.color = 'magenta';
  const boldText = ` ${lob}/${project} `;
  // 进度开始
  // spinner.start(
  //   `${chalk.magenta('项目')}${chalk.magenta.bold(boldText)} ${chalk.magenta('编译开始')}\r\n`
  // );
  console.log(`${chalk.magenta('编译项目')}${chalk.magenta.bold(boldText)}\r\n`);
  // console.log(chalk.bold.bgBlue(` cmd `), chalk.bold.green(`${cmdStr}`));
  // 执行命令
  execSync(cmdStr, { cwd: path.resolve(__dirname, '../'), stdio: 'inherit' });

  // 执行成功
  // spinner.succeed(
  //   `${chalk.magenta('项目')}${chalk.magenta.bold(boldText)} ${chalk.magenta('编译结束')}\r\n`
  // );
}
