/***
 * 配置官方参考链接：https://cli.vuejs.org/zh/config/
 */
const fs = require('fs');
const path = require('path');
// const chalk = require('chalk');
const _ = require('lodash');
const webpack = require('webpack');
const btool = require('./scripts/btool');
const resolve = dir => path.join(__dirname, dir);
// const pathConfig = require('./scripts/path-config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const FileManagerPlugin = require('filemanager-webpack-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
//按需加载lodash
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

// 是否开发环境
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
// console.log(chalk.bold.blue(`环境 NODE_ENV  ${process.env.NODE_ENV}`));

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
        ROUTER_BASE_URL: isDev ? JSON.stringify('/') : JSON.stringify('@routerBaseUrl'),
        VUE_APP_WAP_WATCH_MIDDLE: JSON.stringify(process.env.VUE_APP_WAP_WATCH_MIDDLE),
        VUE_APP_WEB_BASE_MIDDLE: JSON.stringify(process.env.VUE_APP_WEB_BASE_MIDDLE),
        // 化蝶pc观看端项目名
        VUE_MIDDLE_SAAS_WATCH_PC_PROJECT: JSON.stringify(
          process.env.VUE_MIDDLE_SAAS_WATCH_PC_PROJECT
        ),
        // 化蝶wap观看端项目名
        VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT: JSON.stringify(
          process.env.VUE_MIDDLE_SAAS_WATCH_WAP_PROJECT
        ),
        // 化蝶发起端项目名
        VUE_MIDDLE_SAAS_LIVE_PC_PROJECT: JSON.stringify(
          process.env.VUE_MIDDLE_SAAS_LIVE_PC_PROJECT
        ),
        //化蝶观看端(pc、wap)域名
        VUE_APP_WAP_WATCH: JSON.stringify(process.env.VUE_APP_WAP_WATCH),
        //化蝶发起端域名
        VUE_APP_WEB_BASE: JSON.stringify(process.env.VUE_APP_WEB_BASE),

        // 是否wap端
        VUE_APP_IS_WAP: argv.project === 'saas-wap'
      }
    })
  ];

  if (!isDev) {
    // 修改中台项目路由base为项目名: xxxx/saas-live/xxx
    if (argv.middle) {
      process.env.VUE_APP_ROUTER_BASE_URL = `/${argv.project}`;
    }

    // ReplaceInFileWebpackPlugin 参数
    const replaceInFileWebpackPluginData = [
      {
        dir: `dist/${argv.project}/docker`,
        files: ['index.html'],
        rules: [
          {
            search: /@projectName/g,
            replace: `${argv.project}`
          }
        ]
      },
      {
        dir: `dist/${argv.project}/cloud/static`,
        test: /\.js$/,
        rules: [
          {
            search: /@routerBaseUrl/g,
            replace: `${process.env.VUE_APP_ROUTER_BASE_URL}`
          },
          {
            search: /@projectName/g,
            replace: `${argv.project}`
          }
        ]
      }
    ];

    plugins.push(
      new FileManagerPlugin({
        events: {
          onEnd: {
            mkdir: [
              `dist/${argv.project}/docker`,
              `dist/${argv.project}/cloud`,
              `dist/${argv.project}/sourcemap`
            ],
            copy: [
              {
                source: `dist/${argv.project}/index.html`,
                destination: `dist/${argv.project}/docker/index.html`
              },
              {
                source: `dist/${argv.project}/static`,
                destination: `dist/${argv.project}/cloud/static`
              },
              {
                source: `dist/${argv.project}/static/**/*.js.map`,
                destination: `dist/${argv.project}/sourcemap/static/js`
              },
              {
                source: `dist/${argv.project}/static/**/*.css.map`,
                destination: `dist/${argv.project}/sourcemap/static/css`
              }
            ],
            delete: [`dist/${argv.project}/static/**/*.map`, `dist/${argv.project}/cloud/**/*.map`]
          }
        }
      }),
      // 修改文件内容替换路由标记
      new ReplaceInFileWebpackPlugin(replaceInFileWebpackPluginData),
      // 限制构建的chunk数量
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 5
      })
    );
  }
  return plugins;
}

/**
 * 共享配置
 */
const sharedConfig = {
  publicPath: isDev ? '/' : `${process.env.VUE_APP_PUBLIC_PATH}/common-static/@projectName/`,
  assetsDir: 'static', // 配置js、css静态资源二级目录的位置
  // 会通过webpack-merge 合并到最终的配置中
  configureWebpack: {
    devtool: isDev ? '#eval-source-map' : 'none',
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
      // moment: 'moment',
      'element-ui': 'ELEMENT',
      'middle-domain': 'middleDomain',
      // vant: 'vant',
      'vh5-ui': 'vant',
      lodash: '_',
      html2canvas: 'html2canvas',
      overlayscrollbars: 'OverlayScrollbars'
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
      // config.plugin('loadshReplace').use(new LodashModuleReplacementPlugin());
      config.devtool(false); // 这个是把本地的productionSourceMap给关掉了，用下面的，不关的话，会造成，编译好的js有两个sourceMap的指向（需要注意的地方）
      config
        .plugin('SourceMapDevToolPlugin')
        .use(webpack.SourceMapDevToolPlugin)
        .tap(args => {
          return [
            {
              filename: '[file].map',
              publicPath: `https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/sourcemap/${argv.project}/`,
              moduleFilenameTemplate: 'source-map'
            }
          ];
        });
    }
  },
  // 向 CSS 相关的 loader 传递选项
  // 可支持 css\postcss\sass\less\stylus-loader
  css: {
    // 是否将组件中的 CSS 提取至一个独立的 CSS 文件中(开发模式设为false,支持热更新)
    extract: isDev ? false : true,
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
        plugins: [
          // autoprefixer插件自动补全浏览器前缀
          require('autoprefixer')()
        ]
      }
    },
    // 启用 CSS modules for all css / pre-processor files.
    requireModuleExtension: true
  },
  pluginOptions: {
    // 配置全局less变量
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        resolve(`/src/${argv.project}/assets/styles/variables.less`),
        resolve(`/src/${argv.project}/assets/styles/mixins.less`)
      ]
    }
  },
  // 设置是否在开发环境下每次保存代码时都启用eslint验证
  lintOnSave: 'warning',
  // 不使用thread-loader, 否则有很大概率编译不通过
  parallel: false,
  devServer: {
    // port: 443,
    host: '0.0.0.0',
    // https: true,
    // disableHostCheck: true,
    // allowedHosts: [
    //   'dev-csd-saas-web.vhall.com'
    // ],
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

// 根据项目固定不同的端口，可配置
const portFile = path.join(__dirname, 'devport.json');
if (fs.existsSync(portFile)) {
  const portCfg = require(portFile);
  const port = portCfg[argv.project];
  if (port) {
    sharedConfig.devServer.port = port;
  }
}

if (['serve', 'build'].includes(cmd)) {
  // 动态修改运行环境的版本号
  process.env.VUE_APP_BUILD_VERSION = argv.version;
  process.env.VUE_APP_BUILD_HASH = argv.hash;

  // 根据参数获取专用配置信息
  const specialConfig = btool.createSpecialConfig(argv.project, argv.mode);

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
} else {
  module.exports = sharedConfig;
}
