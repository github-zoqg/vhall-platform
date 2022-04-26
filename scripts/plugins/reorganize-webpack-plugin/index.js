/**
 * Created by yangxy on 2022/01/07.
 * 自定义webpack插件
 * 因为项目编译后的文件需要按照我们约定的方式通过jenkens发布，这会导致 路由及部分资源 路径指向不正确。
 * 插件的作用是：在编译完成后重新组织逻辑，生成相应的目录和资源
 */
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const walk = require('fs-walk');

const PLUGIN_NAME = 'reorganizePlugin';
const patternForStatic = /"\/static\//g;
const patternForRouter = /base:[\S\s]+?(",)/g;

class ReorganizeWebpackPlugin {
  constructor(options) {
    this.options = {
      ...options
    };
  }

  apply(compiler) {
    // 生成资源到 output 目录之后
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, async () => {
      console.log(
        '  Building for production...<i> ' +
          chalk.bold.green('[ReorganizePlugin] reorganize the all resource in dist dir')
      );
      const { dist, project, version, resoucePrefix, routerBase } = this.options;
      console.log(this.options);
      // {
      //   resoucePrefix: '//t-alistatic01.e.vhall.com/common-static/saas-live',
      //   dist: '/Users/yangxinyuan/vhall/fork-middle-platform/dist',
      //   project: 'saas-live',
      //   version: '1.0.0'
      //   routerBase: '/v3'
      // }
      const projectPath = path.join(dist, project);
      const dockerPath = path.join(projectPath, 'docker');
      const cloudPath = path.join(projectPath, 'cloud-0');
      fs.ensureDirSync(path.join(dockerPath, version));
      fs.ensureDirSync(cloudPath);

      // 读取工程目录
      const files = fs.readdirSync(projectPath);
      for (const filename of files) {
        if (['docker', 'cloud-0', 'cloud'].includes(filename)) {
          continue;
        }
        const fPath = path.join(projectPath, filename);
        // 找到html文件处理后写入不同的目录
        if (path.extname(filename).toLowerCase() === '.html') {
          let content = fs.readFileSync(fPath, 'utf-8');
          if (content.match(patternForStatic)) {
            // 写入docker目录
            let content1 = content.replace(patternForStatic, `"${resoucePrefix}static/`);
            fs.writeFileSync(path.join(dockerPath, filename), content1, 'utf-8');
            // 写入docker/${version}目录
            let content2 = content.replace(patternForStatic, `"${resoucePrefix}${version}/static/`);
            fs.writeFileSync(path.join(dockerPath, version, filename), content2, 'utf-8');
          }
        } else {
          //  拷贝到clould临时目录两份，其中一份在版本号目录下
          fs.copySync(fPath, path.join(cloudPath, filename));
          fs.copySync(fPath, path.join(cloudPath, version, filename));
        }
      }

      // 处理cloud临时目录的数据
      walk.walkSync(cloudPath, function (basedir, filename, stat) {
        // console.log('basedir:', basedir, ';filename:', filename, 'stat:', stat);
        if (stat.isFile && path.extname(filename).toLowerCase() === '.js') {
          let filePath = path.join(basedir, filename);
          let content = fs.readFileSync(filePath, 'utf-8');
          content = content
            .replace(patternForStatic, '"../../static/')
            .replace(/exports=\w.*?static\/img/g, `exports="${resoucePrefix}static/img`);
          if (basedir.indexOf(version) > -1) {
            content = content.replace(patternForRouter, `base: "${routerBase}/${version}",`);
          }
          fs.writeFileSync(filePath, content, 'utf-8');
        }
      });
      // 重命名cloud目录
      fs.renameSync(cloudPath, path.join(projectPath, 'cloud'));
    });
  }
}

module.exports = ReorganizeWebpackPlugin;
