/**
 * Created by yangxy on 2021/12/06.
 * 编译辅助工具
 */
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const _ = require('lodash');
const pathConfig = require('./path-config');
const CMDLIST = ['serve', 'build', 'inspect', 'lint', 'help'];

/**
 * 解析命令后面的参数
 * @param {*} argv
 * @returns
 */
const parseArgv = argv => {
  const rawArgv = argv.slice(2);
  return require('minimist')(rawArgv);
};

/***
 * 检查参数的合法性
 * @param {*} args
 */
const checkValidArgs = argv => {
  const args = parseArgv(argv);
  // 检查命令
  const cmd = args._[0];
  if (!cmd) {
    console.log(chalk.red('命令参数缺失，请检查'));
    return false;
  } else if (!CMDLIST.includes(cmd)) {
    console.log(chalk.red('命令参数不支持，请检查'));
    return false;
  }

  // 检查业务参数
  const { project } = args;
  if (!project) {
    console.log(chalk.red('缺失项目参数 --project，请检查'));
    return false;
  }

  return true;
};

function getShortEnv() {
  return process.env.NODE_ENV === 'production'
    ? 'prod'
    : process.env.NODE_ENV === 'development'
    ? 'dev'
    : process.env.NODE_ENV;
}

/**
 * 根据project生成其专用配置
 * @param {*} project 项目
 * @returns
 */
const createSpecialConfig = project => {
  let env = getShortEnv();
  const bizConfigPath = path.join(pathConfig.SRC, project, `webpack.${env}.config.js`);
  if (!fs.existsSync(bizConfigPath)) {
    console.log(chalk.red(`${bizConfigPath} 配置文件缺失，请检查`));
    process.exit(1);
  }
  const bizConfig = require(bizConfigPath);
  return bizConfig;
};

module.exports = {
  parseArgv,
  checkValidArgs,
  createSpecialConfig
};
