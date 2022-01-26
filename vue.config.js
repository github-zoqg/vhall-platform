/***
 * 配置官方参考链接：https://cli.vuejs.org/zh/config/
 */
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const webpack = require('webpack');
const btool = require('./scripts/btool');
const resolve = dir => path.join(__dirname, dir);
const pathConfig = require('./scripts/path-config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ReorganizePlugin = require('./scripts/plugins/reorganize-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

// 是否开发环境
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
console.log(chalk.bold.bgBlue(`环境 NODE_ENV `), chalk.bold.blue(`${process.env.NODE_ENV}`));

// 解析参数成key-value形式：
// {
//   _: ['serve'],
//   lob: 'demo',
//   project: 'live-pc',
//   mode: 'development'
// };
const argv = btool.parseArgv(process.argv);
const cmd = argv._[0];

// 插件配置
function getPlugins() {
  const plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        // https://router.vuejs.org/zh/api/#base 应用的基路径。例如，如果整个单页应用服务在 /app/ 下，然后 base 就应该设为 "/app/"
        ROUTER_BASE_URL: JSON.stringify('/middle') // 路由base
      }
    })
  ];

  if (!isDev) {
    // 项目资源路径
    let projectResourceDir = path.join(pathConfig.ROOT, `dist/${argv.project}/static/js/`);

    plugins.push(
      new SentryCliPlugin({
        release: `${argv.version}`, // 版本号
        include: projectResourceDir, // 需要上传到sentry服务器的资源目录,会自动匹配js 以及map文件
        // ignore: ['node_modules'], // 忽略文件目录,当然我们在inlcude中制定了文件路径,这个忽略目录可以不加
        configFile: `sentry/${argv.project}/sentry.properties`,
        urlPrefix: `~/${argv.project}/static/js/` //  线上对应的url资源的相对路径 比如我的域名是 http://XXX.com/,静态资源都在 static文件夹里面
      }),
      new FileManagerPlugin({
        events: {
          onEnd: {
            mkdir: [`dist/${argv.project}/sourcemap`],
            copy: [
              {
                source: `dist/${argv.project}/static/**/*.map`,
                destination: `dist/${argv.project}/sourcemap`
              }
            ],
            delete: [`dist/${argv.project}/static/**/*.map`, `dist/${argv.project}/cloud/**/*.map`]
          }
        }
      }),
      // 修改文件内容替换路由标记
      new ReplaceInFileWebpackPlugin([
        {
          dir: `dist/${argv.project}`,
          test: /\.js$/,
          rules: [
            {
              search: /sourceMappingURL=/gi,
              replace: `https://t-alistatic01.e.vhall.com/common-static/sourcemap/${argv.project}/`
            }
          ]
        }
      ])
    );
  }
  return plugins;
}

/**
 * 共享配置
 */
const sharedConfig = {
  publicPath: '/',
  assetsDir: 'static', // 配置js、css静态资源二级目录的位置
  // 会通过webpack-merge 合并到最终的配置中
  configureWebpack: {
    devtool: isDev ? '#cheap-module-eval-source-map' : 'source-map',
    // 该选项可以控制 webpack 如何通知「资源(asset)和入口起点超过指定文件限制」
    performance: {
      hints: isDev ? false : 'warning',
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
    },
    // 插件
    plugins: getPlugins()
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve('src'));
    // 输出js文件增加hash防止缓存
    config.output.filename('static/js/[name].[hash:8].js').end();
    config.output.chunkFilename('static/js/[name].[hash:8].js').end();

    if (!isDev) {
      config.optimization.minimize(true);
    }
    if (cmd === 'build' && ['test', 'production'].includes(process.env.NODE_ENV)) {
      // 编译结束后重新组织编译结果
      config.plugin('reorganize').use(
        new ReorganizePlugin({
          resoucePrefix: `${process.env.VUE_APP_PUBLIC_PATH}/common-static/${argv.project}/`,
          dist: path.resolve('dist'),
          project: argv.project,
          version: argv.version
        })
      );
    }
  },
  // 向 CSS 相关的 loader 传递选项
  // 可支持 css\postcss\sass\less\stylus-loader
  css: {
    // 是否将组件中的 CSS 提取至一个独立的 CSS 文件中
    extract: true,
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器
    loaderOptions: {
      less: {
        lessOptions: loaderContext => {
          return {
            javascriptEnabled: true
          };
        }
      },
      // PostCSS 是一个用 JavaScript 工具和插件转换 CSS 代码的工具. https://www.postcss.com.cn/
      postcss: {
        // autoprefixer插件自动补全浏览器前缀
        plugins: [require('autoprefixer')]
      }
    },
    // 启用 CSS modules for all css / pre-processor files.
    requireModuleExtension: true
  },
  pluginOptions: {
    // 配置全局less变量
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [resolve(`/src/${argv.project}/assets/styles/variables.less`)]
    }
  },
  // 设置是否在开发环境下每次保存代码时都启用eslint验证
  lintOnSave: 'warning',
  // 不使用thread-loader, 否则有很大概率编译不通过
  parallel: false,
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    contentBase: resolve('public'),
    proxy: {
      '/mock': {
        target: 'http://yapi.vhall.domain',
        changeOrigin: true,
        pathRewrite: { '^/mock': '/mock/749' }
      }
    }
  }
};

if (['serve', 'build'].includes(cmd)) {
  // 动态修改运行环境的版本号
  process.env.VUE_APP_BUILD_VERSION = argv.version;

  // 根据参数获取专用配置信息
  const specialConfig = btool.createSpecialConfig(argv.project);

  // 合并配置
  const vueConfig = _.merge(sharedConfig, specialConfig);

  // 打包分析
  if (argv.analyze) {
    vueConfig.configureWebpack.plugins.push(
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

  // console.log(chalk.bold.bgBlue(` vueConfig `));
  // console.log(chalk.bold.green(JSON.stringify(vueConfig).replace('/,/g', ',\r\n')));

  // 导出
  module.exports = vueConfig;
  return;
}

module.exports = sharedConfig;
