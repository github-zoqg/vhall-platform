/**
 * Created by yangxy on 2021/12/07.
 */
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const btool = require('./btool');
const { execSync } = require('child_process');

// 是否生产环境
const isProd = process.env.NODE_ENV === 'production';
console.log(chalk.bold.bgBlue(` NODE_ENV `), chalk.bold.blue(`${process.env.NODE_ENV}`));

const argv = process.argv;
// console.log(chalk.bold.bgBlue(` process.argv `), argv);
// 检查参数的有效性
if (!btool.checkValidArgs(argv)) {
  process.exit(1);
}

// 执行编译命令
const cmdArgs = Array.prototype.slice.call(argv, 2);
const cmdOption = cmdArgs.join(' ');
const args = btool.parseArgv(argv);
const { project, client } = args;
const spinner = ora();
if (client === 'all') {
  // 执行多条
  const clients = btool.getClientNames(project);
  const cmdOptions = {};
  for (const c of clients) {
    cmdOptions[c] = cmdOption.replace('--client=all', `--client=${c}`);
  }
  runLoop(project, cmdOptions);
} else {
  // 执行单条
  runSingle(project, client, cmdOption);
}

async function runLoop(project, cmdOptions) {
  for (let [key, value] of Object.entries(cmdOptions)) {
    await runSingle(project, key, value);
  }
}

async function runSingle(project, client, cmdOption) {
  const cmdStr = `node_modules${path.sep}.bin${path.sep}vue-cli-service ${cmdOption}`;
  spinner.color = 'magenta';
  const boldText = ` ${project}/${client} `;
  // 进度开始
  spinner.start(
    `${chalk.magenta('项目')}${chalk.magenta.bold(boldText)} ${chalk.magenta('编译开始')}\r\n`
  );
  // console.log(chalk.bold.bgBlue(` cmd `), chalk.bold.green(`${cmdStr}`));
  // 执行命令
  execSync(cmdStr, { cwd: path.resolve(__dirname, '../'), stdio: 'inherit' });

  // 执行成功
  spinner.succeed(
    `${chalk.magenta('项目')}${chalk.magenta.bold(boldText)} ${chalk.magenta('编译结束')}\r\n`
  );
}
