// import istanbul from '../plugins/vite-plugin-istanbul';

/**
 * @parent vite.plugins
 * @desc 需要解构[...]
 * @note 由于istanbul对构建的性能消耗极大
 * @note 1. pre预发布环境不进行打包
 * @note 2. 测试环境打包istanbul，但是不进行legacy兼容版本打包
 * @returns
 */
export function useIstanbul({ isDev = true }) {
  if (!isDev) return [];

  return [
    // istanbul({
    //   include: 'src/*',
    //   exclude: 'node_modules',
    //   forceBuildInstrument: true,
    //   coverageVariable: '__coverage__saas_platform'
    // })
  ];
}
