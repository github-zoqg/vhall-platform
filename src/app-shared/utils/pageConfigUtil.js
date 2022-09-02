import { isFunction } from '@/app-shared/utils/tool.js';
/**
 * 设置页面配置
 * @param {Object} page 页面配置json
 * @param {String} name 配置名称
 */
export const setPage = (page, name) => {
  window.$serverConfig = page;
  window.$serverConfig._page = name;
};

/**
 * 更新页面配置的某一个节点
 * @param {String} nodeKey
 * @param {*} varParam1
 * @param {*} varParam2
 * @description !!!注意：如果是简单的修改，可以直接调用这个方法进行快速修改。如果是复杂的节点更新，建议在配置文件中添加一个新节点，进行节点替换
 */
export const updatePageNode = (nodeKey, varParam1, varParam2) => {
  // 如果第三个参数不传, varParam1 为要设置的值或者设置值的方法
  if (!varParam2) {
    window.$serverConfig[nodeKey] = !isFunction(varParam1)
      ? varParam1
      : varParam1(window.$serverConfig[nodeKey]);
  } else {
    // 如果第三个参数传了，则 varParam1 为将要修改节点的某一个属性的 key，varParam2 为要设置的值或者设置值的方法
    window.$serverConfig[nodeKey][varParam1] = !isFunction(varParam2)
      ? varParam2
      : varParam2(window.$serverConfig[nodeKey][varParam1]);
  }
};
