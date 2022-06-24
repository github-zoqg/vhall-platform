/***
 * 多页面独立编排配置分离原配置用的脚本
 * 执行命令：
 *  nvm run 16.15.1 scripts/multi-page.mjs saas-live 'splitScreenRoot'
 */
import url from 'url';
import path from 'path';
import fs from 'fs-extra';

const getPath = url2 => {
  const __filename = url.fileURLToPath(url2);
  const __dirname = path.dirname(__filename);
  return { __filename, __dirname };
};
const { __dirname } = getPath(import.meta.url);

async function run(project, roots) {
  // 创建 .page-config 临时目录
  const tempDir = fs.ensureDirSync(path.join(__dirname, '../', '.page-config'));
  const oriConfigPath = path.join(__dirname, '../src', `${project}`, 'config.js');
  const copyConfigPath = path.join(tempDir, 'config.mjs');
  // 复制config.js文件到临时目录，并改后缀为.mjs
  fs.copyFileSync(oriConfigPath, copyConfigPath);
  // 读取文件的配置信息
  const { serverConfig } = await import(copyConfigPath);
  // listify
  roots = roots.push ? roots : roots.split(',');

  for (const root of roots) {
    const result = tree(root, serverConfig);
    if (result) {
      // console.log(result);
      const page = path.join(tempDir, 'pages', `${root}.js`);
      fs.outputFileSync(page, 'export default ' + JSON.stringify(result));
    }
  }
}

function tree(root, oriConfig, result) {
  if (!result) result = {};
  if (oriConfig[root]) {
    result[root] = oriConfig[root];
    if (result[root].children && result[root].children.length) {
      for (const item of result[root].children) {
        tree(item, oriConfig, result);
      }
    }
  }
  return result;
}

console.log(process.argv);
const argv = process.argv.slice(2);
const project = argv[0];
const roots = argv[1];
if (!fs.pathExistsSync(path.join(__dirname, '../src', `${project}`))) {
  console.error('不存在的项目');
  process.exit(1);
}
if (!roots) {
  console.error('roots参数缺失');
}
run(project, roots);
// run(
//   'saas-live',
//   'layerRoot,recordVideoRoot,splitScreenRoot,embedClientRoot,videoPollingRoot,liveStreamYunRoot'
// );
