// 输出的目录格式为 dist/[projectName]/static/[js|css|media|fonts}...]

import { RollupFilemanager } from 'filemanager-plugin';

/**
 * @parent build.rollupOptions.output
 * @desc 需要解构[...]
 * @returns
 */
export function useDistStructConfig() {
  return {
    // 分包策略
    manualChunks: (id, { getModuleInfo }) => {
      if (id.includes('node_modules')) {
        return 'chunk-vendor';
      }

      // importers:所有静态导入此模块的模块的id
      // dynamicImporters:通过动态import()导入此模块的所有模块的id
      // const { importers, dynamicImporters } = getModuleInfo(id);

      // const isFragments = importers.length + dynamicImporters.length > 1;
      // if (isFragments && id.includes('src')) return 'chunk';
    },
    chunkFileNames: 'static/js/[name]-[hash].js',
    entryFileNames: 'static/js/[name]-[hash].js',
    assetFileNames: assetInfo => {
      const info = assetInfo.name.split('.');
      let extType = info[info.length - 1];

      const jsReg = new RegExp(/\.(js|jsx|ts|tsx)(\?.*)?$/i);
      const cssReg = new RegExp(/\.(css|less)(\?.*)?$/i);
      const mediaReg = new RegExp(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i);
      const imageReg = new RegExp(/\.(png|jpe?g|gif|svg)(\?.*)?$/);
      const fontReg = new RegExp(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i);

      if (mediaReg.test(assetInfo.name)) {
        extType = 'media';
      } else if (imageReg.test(assetInfo.name)) {
        extType = 'img';
      } else if (fontReg.test(assetInfo.name)) {
        extType = 'fonts';
      } else if (jsReg.test(assetInfo.name)) {
        extType = 'js';
      } else if (cssReg.test(assetInfo.name)) {
        extType = 'css';
      }

      return `static/${extType}/[name]-[hash][extname]`;
    }
  };
}

//  操作生成后的dist文件夹,按照运维发布要求进行重构
export function useDevOpsFileStruct({ project, version }) {
  const projectDistRootPath = `dist/${project.name}`;

  function createHooks() {
    return {
      hookName: 'writeBundle',
      commands: {
        copy: {
          items: [
            // sourcemap
            {
              source: `${projectDistRootPath}/static/**/*.js.map`,
              destination: `${projectDistRootPath}/sourcemap/static/js`
            },
            {
              source: `${projectDistRootPath}/static/**/*.css.map`,
              destination: `${projectDistRootPath}/sourcemap/static/css`
            },
            // docker
            {
              source: `${projectDistRootPath}/index.html`,
              destination: `${projectDistRootPath}/docker/`
            },

            // cloud
            {
              source: `${projectDistRootPath}/static/`,
              destination: `${projectDistRootPath}/cloud/`
            }
          ]
        },
        del: {
          items: [
            `${projectDistRootPath}/static/**/*.js.map`,
            `${projectDistRootPath}/static/**/*.css.map`,
            `${projectDistRootPath}/cloud/static/**/*.js.map`,
            `${projectDistRootPath}/cloud/static/**/*.css.map`
          ]
        }
      }
    };
  }

  return new RollupFilemanager({
    customHooks: [createHooks()],
    options: { cache: false } // 如果cache为true，多个output下会被缓存操作，第二个output会直接跳过文件操作。
  });
}
