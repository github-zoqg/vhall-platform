const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const semver = require('semver');
const { execSync } = require('child_process');
const jsonfile = require('jsonfile');
const btool = require('./btool');
const pkg = require('../package.json');
const cLog = console.log;

// 获取命令行参数
const argv = process.argv;
// 解析参数成数组形式：['serve']
const cmdArgs = Array.prototype.slice.call(argv, 2);
cLog(chalk.bold.bgBlue(` cmdArgs `), cmdArgs);
if (cmdArgs[0] === 'serve') {
  run();
}

/**
 * 选择版本号命令行交互
 */
async function promptChooseVersion(version, message) {
  const patchVersion = semver.inc(version, 'patch'); //补丁版本号递增
  const minorVersion = semver.inc(version, 'minor'); //次版本号递增
  const majorVersion = semver.inc(version, 'major'); //主版本号递增
  // 组织选项
  const choices = {};
  choices[`Unchanged (${version})`] = version;
  choices[`Patch (${patchVersion})`] = patchVersion;
  choices[`Minor (${minorVersion})`] = minorVersion;
  choices[`Major (${majorVersion})`] = majorVersion;
  choices['Custom Version'] = 'Custom Version';
  // 交互提示
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'VERSION',
      message,
      choices: Object.keys(choices),
      default: ''
    }
  ]);
  // 选择结果
  let resultVersion = choices[answer.VERSION];
  if (resultVersion === 'Custom Version') {
    // 自定义版本号
    resultVersion = await promptCustomVersion(version);
  }
  return resultVersion;
}

/**
 * 用户输入自定义版本号交互
 * @returns inputVersion 自定义版本号
 */
async function promptCustomVersion(version) {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'CUSTOM_VERSION',
      message: 'Enter a custom version:'
    }
  ]);
  // 得到自定义的版本号
  let inputVersion = answer.CUSTOM_VERSION;
  // 各种验证
  if (!semver.valid(inputVersion)) {
    // 验证自定义版本号是否合法
    cLog(chalk.redBright('custom version is invalid! please input again...'));
    inputVersion = await promptCustomVersion(version);
  }
  return semver.clean(inputVersion);
}

/**
 * 更新 package.json 的 version
 * @param {*} val 版本号
 */
function updateVersion({ version, domainVersion, autoToGit }) {
  const pkgPath = path.join(__dirname, '../package.json');
  // 读取 package.json文件数据
  const file = jsonfile.readFileSync(pkgPath);
  file.version = version; //修改版本号
  file.domainVersion = domainVersion; //修改domain版本号
  // 更新 package.json文件数据
  jsonfile.writeFileSync(pkgPath, file, { spaces: 2, EOL: '\r\n' });
  if (autoToGit) {
    // 自动提交到git
    try {
      execSync(`git add package.json`);
      execSync(`git commit -m "chore: upgrade version to ${version}"`);
      execSync('git push');

      cLog(chalk.green.bold(`\n   Upgrade version successfully\n`));
    } catch (ex) {
      cLog(chalk.redBright(ex));
    }
  }
}

async function run() {
  const currentVersion = pkg.version;

  // 开启提示文字
  btool.bootstripTip(
    {
      ProjectVersion: currentVersion,
      DomainVersion: pkg.domainVersion
    },
    {
      lLen: 18,
      rLen: 15
    }
  );

  // 获得项目新版本号
  const newVersion = await promptChooseVersion(currentVersion, 'Please pick the project version:');
  // 获得domain新版本号
  const newDomainVersion = await promptChooseVersion(
    pkg.domainVersion,
    'Please pick the domain version:'
  );

  // 确认更新
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'autoToGit',
        message: 'After updating the version, the code is automatically submitted to GIT',
        default: false
      }
    ])
    .then(answers => {
      // 更新版本
      updateVersion({
        version: newVersion,
        domainVersion: newDomainVersion,
        autoToGit: answers.autoToGit
      });
    })
    .catch(error => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

module.exports = run;
