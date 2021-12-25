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
 * 获取某业务线专用配置文件路径
 * @param {*} lob
 * @returns
 */
const getSpecialConfigPath = lob => {
  /* prettier-ignore */
  return path.join(__dirname, '../vue-configs', lob,`${process.env.NODE_ENV}.config.js`);
};

/**
 * 获取有效的项目目录名
 * @param {*} project
 * @returns
 */
const getProjectNames = project => {
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
  const { lob, project } = args;
  if (!lob) {
    console.log(chalk.red('缺失业务线参数 --lob，请检查'));
    return false;
  }
  if (!project) {
    console.log(chalk.red('缺失项目参数 --project，请检查'));
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
  const { lob, project } = args;
  // 获取项目的专用配置路径
  const bizConfigPath = getSpecialConfigPath(lob);
  console.log(bizConfigPath);
  if (!fs.existsSync(bizConfigPath)) {
    console.log(chalk.red(`${bizConfigPath} 配置文件缺失，请检查`));
    process.exit(1);
  }
  // 配置信息
  let projectCfg = require(bizConfigPath)[project];
  if (!projectCfg) {
    console.warn(`${lob}/${project} 没有配置信息`);
    projectCfg = {};
  }
  const defaultCfg = require(path.join(__dirname, '..', 'vue-configs', 'default.config.js'));
  // 合并配置
  const { title, version, pages, htmlConfig } = _.merge({}, defaultCfg, projectCfg);
  // 实际页面配置内容
  const realPages = {};
  if (pages) {
    // 支持多页面
    Object.keys(pages).forEach(key => {
      const page = pages[key];
      const realHtmlConfig = _.merge({}, htmlConfig, page.htmlConfig);
      realPages[key] = {
        entry: path.join(__dirname, '..', 'src', lob, project, page.entry),
        filename: page.filename || `${key}.html`,
        template: path.join(__dirname, '..', 'public', 'index.html'),
        title: page.title || title,
        ...realHtmlConfig
      };
    });
  } else {
    // 默认单页面配置
    realPages.index = {
      entry: path.join(__dirname, '..', 'src', lob, project, 'main.js'),
      filename: 'index.html',
      template: path.join(__dirname, '..', 'public', 'index.html'),
      title: title || `${lob}-${project}-${version}`,
      ...htmlConfig
    };
  }

  /** 每个项目自己的配置 */
  return {
    pages: realPages,
    outputDir: path.join(__dirname, '..', 'dist', lob, project)
  };
};

module.exports = {
  parseArgv,
  getProjectNames,
  checkValidArgs,
  createSpecialConfig
};
