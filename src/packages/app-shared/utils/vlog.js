/***
 * 移动端网页调试工具，使用的eruda
 */
window.Vlog = {
  clear() {},
  group() {},
  table() {},
  time() {},
  timeEnd() {},
  log() {},
  warn() {},
  error() {}
};
/* eslint-disable */
const isProd = process.env.NODE_ENV === 'production';
const cacheKey = '__openDebug__';
const debugStatusCache = sessionStorage.getItem(cacheKey);
const debugSwitch = window.location.search.indexOf('debug=true') > -1;
if (!isProd || debugStatusCache || debugSwitch) {
  // 正式环境, 没有session缓存, 链接没有debug
  window.Vlog = console;
  sessionStorage.setItem(cacheKey, 1); // 防止当前页面跳转后丢失开关状态
  if (window.eruda) {
    window.eruda.init();
  }
}
/* eslint-enable */
