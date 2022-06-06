/**
 * Created by yangxy on 2021/12/06.
 * 编译辅助工具
 */
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const _ = require('lodash');
const axios = require('axios');
const lineByLine = require('n-readlines');
const pathConfig = require('./path-config');
const CMDLIST = ['serve', 'build', 'inspect', 'lint', 'help'];
const cLog = console.log;

/**
 * 开启提示文字
 * @param {*} tips 提示内容，key-value形式
 * @param {*} param
 *  tLen 总长度
 *  lLen 左边key的长度
 *  rLen 右边value的长度
 */
function bootstripTip(tips, { tLen = 44, lLen = 12, rLen = 25 } = {}) {
  const chalkBorder = chalk.hex('#0FA86E'); //边框
  const chalkLabel = chalk.hex('#00AED0').bold;
  cLog(chalkBorder('╭'.padEnd(tLen - 1, '─') + '╮'));
  cLog(chalkBorder('│'.padEnd(tLen - 1, ' ') + '│'));
  for (const [key, value] of Object.entries(tips)) {
    cLog(
      chalkBorder('│  '),
      chalkLabel(`▸ ${key}:`.padEnd(lLen)),
      `${value}`.padEnd(rLen),
      chalkBorder('│')
    );
  }
  cLog(chalkBorder('│'.padEnd(tLen - 1, ' ') + '│'));
  cLog(chalkBorder('╰'.padEnd(tLen - 1, '─') + '╯'));
}

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
    cLog(chalk.red('命令参数缺失，请检查'));
    return false;
  } else if (!CMDLIST.includes(cmd)) {
    cLog(chalk.red('命令参数不支持，请检查'));
    return false;
  }

  // 检查业务参数
  const { project } = args;
  if (!project) {
    cLog(chalk.red('缺失项目参数 --project，请检查'));
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
    cLog(chalk.red(`${bizConfigPath} 配置文件缺失，请检查`));
    process.exit(1);
  }
  const bizConfig = require(bizConfigPath);
  return bizConfig;
};

const getVueMode = (cmd, mode) => {
  if (!mode) {
    mode = cmd === 'build' ? 'production' : 'development';
  }
  return mode;
};

const getNodeEnv = mode => {
  const envFile = path.join(pathConfig.ROOT, `.env.${mode}`);
  if (!fs.existsSync(envFile)) {
    cLog(chalk.redBright('文件不存在，请检查'));
    cLog(chalk.redBright(`→ ${envFile}\n`));
  }
  const liner = new lineByLine(envFile);
  let line;
  while ((line = liner.next())) {
    line = line.toString('utf-8');
    if (line.startsWith('NODE_ENV')) {
      break;
    }
  }
  const lineArr = line.split('=');
  return (lineArr[1] || '').trim();
};

/**
 * 检测资源的可访问情况
 * @param {String} url 资源访问URL
 * @returns
 */
async function checkRes(url) {
  try {
    const response = await axios.get(url, {
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    });
    if (response.status === 200) {
      //资源存在
      return { status: 1, url };
    } else if (response.status >= 400 || response.status <= 499) {
      // 资源不存在
      return { status: 0, url };
    } else {
      // 资源访问错误
      return { status: -2, url };
    }
  } catch (error) {
    //访问资源异常
    return { status: -1, url, errMsg: error };
  }
}

async function checkDomainRes(project) {
  try {
    const vConfig = this.createSpecialConfig(project);
    let domainUrl = vConfig.pages.index.cdnJs['MiddleDomain'];
    if (domainUrl.startsWith('//')) {
      domainUrl = `https:${domainUrl}`;
    }
    const { status, url, errMsg } = await this.checkRes(domainUrl);
    if (status === 0) {
      cLog(chalk.redBright('domain资源不存在,请检查'));
      cLog(chalk.redBright(`→ ${url}\n`));
    } else if (status === -1) {
      cLog(chalk.redBright(`资源访问存在异常:${url}`));
      cLog(chalk.redBright(errMsg));
      cLog();
    } else if (status < 0) {
      cLog(chalk.redBright('访问资源出现错误,请检查'));
      cLog(chalk.redBright(`→ ${url}\n`));
    }
    return { status, url, errMsg };
  } catch (ex) {
    cLog(chalk.redBright('检测domain资源出现异常'));
    cLog(chalk.redBright(ex));
    cLog();
    return { status: -3, errMsg: ex };
  }
}

module.exports = {
  bootstripTip,
  parseArgv,
  checkValidArgs,
  createSpecialConfig,
  getVueMode,
  getNodeEnv,
  checkRes,
  checkDomainRes
};
