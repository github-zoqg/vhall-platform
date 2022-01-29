/**
 * 字符串查询
 * @param {*} name
 * @returns
 */
export function getQueryString(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

// 抽离成公共方法
export function awaitWrap(promise) {
  return promise.then(data => [null, data]).catch(err => [err, null]);
}
