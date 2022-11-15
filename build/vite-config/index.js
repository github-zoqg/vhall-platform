import { defineConfig } from 'vite';

import * as preset from './preset'; // 较重较内聚，不离散的配置逻辑放到预设中
import * as utils from './vite-config-utils';
import { DEFAULT_CONF } from './static.js';
import packageJson from '../../package.json';
import { getCmdArgs } from '../cli/run-utils';

// plugins---语法类
import { createVuePlugin } from 'vite-plugin-vue2'; // <VUE2.7 使用。IMPORTANT: 如升级到VUE2.7后要更换插件
import vueJsx from '@vitejs/plugin-vue-jsx'; // JSX语法支持
import requireTransform from './plugins/vite-plugin-require-transform'; // 支持require语法，减少业务代码改造
// plugins---打包类
import legacy from '@vitejs/plugin-legacy'; // 生成低版本浏览器代码
import { ViteEjsPlugin } from 'vite-plugin-ejs'; // HTML-EJS
// plugins---cdn类
import externalGlobals from 'rollup-plugin-external-globals'; // build-cdn用
import createExternal from 'vite-plugin-external'; // server-cdn用
// plugins---其他类
// import istanbul from './plugins/vite-plugin-istanbul';
import mkcert from 'vite-plugin-mkcert'; // https证书，以支持server可用Https

export default defineConfig(async () => {
  const { VITE_SHELL_CMD_MODE: mode, VITE_SHELL_CMD_MAIN } = utils.getViteShellCmdArgs();
  const args = getCmdArgs();
  let DOT_ENV = utils.parseDotEnvFile(mode); // 用户自定义的.env.xxx 环境变量
  // --- 动态设置环境变量
  DOT_ENV = preset.mixinDynamicEnvVar(DOT_ENV);

  // --- 获取具体的项目配置
  const { project, less, cdn } = utils.getProjectConfigByArgs({
    custom_env: DOT_ENV,
    merge: true // 合并base.config和someEnv.conf后返回一个合并后对象
  });

  const isDev = VITE_SHELL_CMD_MAIN === 'serve';

  return {
    envPrefix: DEFAULT_CONF.ENV_PREFIX,

    // --- 变量定义
    define: {
      'process.env': {
        ...DOT_ENV,
        ROUTER_BASE_URL: isDev ? '/' : DOT_ENV.VUE_APP_ROUTER_BASE_URL,
        VUE_APP_IS_WAP: project.isWap
      }
    },

    base: isDev ? '/' : `${DOT_ENV.VUE_APP_PUBLIC_PATH}/common-static/${project.name}/`,

    // --- 模块解析
    resolve: {
      alias: [
        { find: '@', replacement: utils.resolvePathByRoot('/src') },
        {
          find: /^~(.*)$/,
          replacement: 'node_modules/$1'
        }
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.vue', '.less']
    },

    // ---  VITE 插件
    plugins: [
      // 本地使用https服务器。启用https2，提高网络IO并发速度
      // mkcert(),
      // VUE支持
      createVuePlugin(),
      // VUE-JSX特性支持
      vueJsx(),
      // html模板配置
      ViteEjsPlugin({
        projectName: project.name || DEFAULT_CONF.PROJECT_NAME, // 项目名[必填]，用于找到src/**/main.js
        prefetch: cdn.prefetch,
        scripts: Object.values(cdn.js), // JS文件
        styles: Object.values(cdn.css), // 样式文件

        // header写入
        isWap: project?.isWap, // 手机端
        title: project.title || DEFAULT_CONF.HTML_PAGE_TITLE, // 标题
        env: DOT_ENV.VUE_APP_SAAS_ENV, // 环境
        version: DOT_ENV.VUE_APP_BUILD_VERSION, // 运维写入version
        gitlabHash: DOT_ENV.VUE_APP_BUILD_HASH // 运维写入gitlab-hash
      }),
      // legacy({
      //   targets: ['ie >= 11'],
      //   additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      // }),
      // 支持require语法
      requireTransform({
        fileRegex: /.ts$|.tsx$|.vue$/,
        importPathHandler(requirePath) {
          // 该插件考虑不完善，需要重新映射@
          return requirePath.replace(/(\.|\?|-|\/|@)/g, '_');
        }
      }),
      createExternal({
        externals: { ...cdn.externalsVar }
      }),
      ...preset.useIstanbul({ isDev: DOT_ENV.VUE_APP_SAAS_ENV !== 'production' })
    ],

    // --- 开发服务器
    server: {
      https: false, // 和 vite的plugin mkcert结合使用
      port: utils.getPortByDevPortFile({ projectName: project.name }),
      proxy: {
        '/mock': {
          target: 'http://yapi.vhall.domain',
          changeOrigin: true,
          pathRewrite: { '^/mock': '/mock/749' }
        }
      }
    },

    // --- CSS配置
    css: {
      postcss: {
        plugins: [...preset.useRemOnWap(project.isWap)]
      },
      preprocessorOptions: { less }
    },

    // --- 打包配置
    build: {
      sourcemap: true,
      outDir: utils.resolvePathByRoot(`dist/${project.name}/`),
      assetsDir: './static', // 相对于outDir，此处只用给出相对路径
      rollupOptions: {
        output: {
          sourcemapBaseUrl: `https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/sourcemap/${project.name}/`,
          external: [...Object.keys(cdn.externalsVar)],
          // prefetch-更改输出的目录内部结构
          ...preset.useDistStructConfig()
        },
        plugins: [
          externalGlobals(cdn.externalsVar),
          preset.useDevOpsFileStruct({ project, version: packageJson.version })
        ]
      }
    }
  };
});
