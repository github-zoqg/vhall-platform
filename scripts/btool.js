/**
 * Created by yangxy on 2021/12/06.
 * 编译辅助工具
 */
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const _ = require('lodash');

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

/**
 * 获取专用配置文件路径
 * @param {*} project
 * @returns
 */
const getSpecialConfigPath = project => {
  const isProd = process.env.NODE_ENV === 'production';
  /* prettier-ignore */
  return path.join(__dirname, '../vue-configs', project, isProd ? 'prod.config.js' : 'dev.config.js');
};

/**
 * 获取有效的端目录名
 * @param {*} project
 * @returns
 */
const getClientNames = project => {
  const dir = path.join(__dirname, '..', 'src', project);
  const names = fs.readdirSync(dir, { encoding: 'utf-8' });

  return names.filter(item => {
    const mainFile = path.join(dir, item, 'main.js');
    return fs.existsSync(mainFile);
  });
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
  const { project, client } = args;
  if (!project) {
    console.log(chalk.red('缺失参数 --project，请检查'));
    return false;
  }
  if (!client) {
    console.log(chalk.red('缺失参数 --client，请检查'));
    return false;
  }

  // 检查必要文件是否存在
  const cfgPath = getSpecialConfigPath(project);
  if (!fs.existsSync(cfgPath)) {
    console.log(chalk.red(`${project}/${client}配置文件缺失，请检查`));
    return false;
  }

  return true;
};

/**
 * 根据参数生成项目专用配置
 * @param {*} param0
 * @returns
 */
const createSpecialConfig = argv => {
  // 转换参数
  const args = parseArgv(argv);
  // 获得业务参数
  const { project, client } = args;
  // 获取项目的专用配置路径
  const bizConfigPath = getSpecialConfigPath(project);
  // 配置信息
  let clientCfg = require(bizConfigPath)[client];
  if (!clientCfg) {
    console.warn(`${project}/${client} 没有配置信息`);
    clientCfg = {};
  }
  const defaultCfg = require(path.join(__dirname, '..', 'vue-configs', 'default.config.js'));
  // 合并配置
  const { title, version, pages, htmlConfig } = _.merge({}, defaultCfg, clientCfg);
  // 实际页面配置内容
  const realPages = {};
  if (pages) {
    // 支持多页面
    Object.keys(pages).forEach(key => {
      const page = pages[key];
      const realHtmlConfig = _.merge({}, htmlConfig, page.htmlConfig);
      realPages[key] = {
        entry: path.join(__dirname, '..', 'src', project, client, page.entry),
        filename: page.filename || `${key}.html`,
        template: path.join(__dirname, '..', 'public', 'index.html'),
        title: page.title || title,
        ...realHtmlConfig
      };
    });
  } else {
    // 默认单页面配置
    realPages.index = {
      entry: path.join(__dirname, '..', 'src', project, client, 'main.js'),
      filename: 'index.html',
      template: path.join(__dirname, '..', 'public', 'index.html'),
      title: title || `${project}-${client}-${version}`,
      ...htmlConfig
    };
  }

  /** 每个项目自己的配置 */
  return {
    pages: realPages,
    outputDir: path.join(__dirname, '..', 'dist', project, client)
  };
};

module.exports = {
  parseArgv,
  getClientNames,
  checkValidArgs,
  createSpecialConfig
};
