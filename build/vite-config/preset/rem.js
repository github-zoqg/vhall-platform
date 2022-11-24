import postCssPxToRem from 'postcss-pxtorem';

/**
 * @parent css.postcss.plugins
 * @desc 需要解构
 * @returns
 */
export function useRemOnWap(isWap) {
  if (!isWap) return [];

  const rem = postCssPxToRem({
    rootValue: 75,
    propList: ['*'],
    exclude: /node_modules/,
    minPixelValue: 2
  });

  return [rem];
}
