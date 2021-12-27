const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const btool = require('./scripts/btool');
const resolve = dir => path.join(__dirname, dir);
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// 是否生产环境
const isProd = process.env.NODE_ENV === 'production';
console.log(chalk.bold.bgBlue(`环境 NODE_ENV `), chalk.bold.blue(`${process.env.NODE_ENV}`));

/**
 * 基础配置，静态统一配置
 */
const sharedConfig = {
  // 相对路径
  publicPath: './',
  // 会通过webpack-merge 合并到最终的配置中
  configureWebpack: {
    devtool: isProd ? '' : '#source-map',
    // 该选项可以控制 webpack 如何通知「资源(asset)和入口起点超过指定文件限制」
    performance: {
      hints: isProd ? 'warning' : false,
      maxAssetSize: 512000, // 整数类型（以字节为单位）
      maxEntrypointSize: 400000 // 整数类型（以字节为单位）
    },
    // 防止将某些 import 的包(package)打包到 bundle 中
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      'vue-i18n': 'VueI18n',
      moment: 'moment',
      'element-ui': 'ELEMENT',
      'vhall-sass-domain': 'middleDomain'
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve('src'));
  },
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: false,
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器
    loaderOptions: {
      less: {
        lessOptions: loaderContext => {
          const { resourcePath, rootContext } = loaderContext;
          console.log('resourcePath:', resourcePath);
          console.log('rootContext:', rootContext);
          // const relativePath = path.relative(rootContext, resourcePath);
          return {
            javascriptEnabled: true
          };
        }
      }
    },
    // 启用 CSS modules for all css / pre-processor files.
    requireModuleExtension: true
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [resolve('/src/packages/common/css/common.less')]
    }
  },
  // 设置是否在开发环境下每次保存代码时都启用eslint验证
  lintOnSave: 'warning',
  // 不使用thread-loader, 否则有很大概率编译不通过
  parallel: false,
  devServer: Object.assign({
    port: 8080,
    host: '0.0.0.0',
    contentBase: [resolve('public'), resolve('src/packages/theme-chalk')],
    proxy: {
      '/mock': {
        target: 'http://yapi.vhall.domain',
        changeOrigin: true,
        pathRewrite: { '^/mock': '/mock/749' }
      }
    }
  })
};

const argv = btool.parseArgv(process.argv);
const cmd = argv._[0];
console.log('---argv---', argv);

// 打包分析
if (argv.analyze) {
  sharedConfig.configureWebpack.plugins || (sharedConfig.configureWebpack.plugins = []);
  sharedConfig.configureWebpack.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerPort: 9001,
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      openAnalyzer: true,
      generateStatsFile: false,
      statsFilename: 'stats.json',
      statsOptions: null,
      logLevel: 'info'
    })
  );
}

if (['serve', 'build'].includes(cmd)) {
  // 根据参数获取专用配置信息
  const specialConfig = btool.createSpecialConfig(process.argv);

  // 合并配置
  const vueConfig = _.merge(sharedConfig, specialConfig);

  // console.log(chalk.bold.bgBlue(` vueConfig `));
  // console.log(chalk.bold.green(JSON.stringify(vueConfig).replace('/,/g', ',\r\n')));

  // 导出
  module.exports = vueConfig;
  return;
}

module.exports = sharedConfig;
