/**
 * Created by yangxy on 2022/01/13.
 * 通用工具类
 */
export const hasOwnProperty = function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
