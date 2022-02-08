/**
 * Created by yangxy on 2022/01/13.
 * 通用工具类
 */
export const hasOwnProperty = function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

//防抖
export function debounce(fn, t = 300) {
  let lastTime;
  return function () {
    window.clearTimeout(lastTime);
    const [that, args] = [this, arguments];
    lastTime = window.setTimeout(() => {
      fn.apply(that, args);
    }, t);
  };
}

// 节流
export function throttle(fn, t = 300) {
  let last;
  let timer;
  return function () {
    let th = this;
    let args = arguments;
    let now = +new Date();
    if (last && now - last < t) {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        last = now;
        fn.apply(th, args);
      }, t);
    } else {
      last = now;
      fn.apply(th, args);
    }
  };
}

/**
 * 封装使用事件驱动需要的参数
 * @param cuid 当前组件的唯一标识
 * @param cuid 当前组件配置的动作
 * @param params 动态参数
 */
export function boxEventOpitons(cuid, method, params) {
  const actions = window.$serverConfig?.[cuid]?.[method];
  return {
    actions,
    params,
    cuid,
    method
  };
}

/**
 * 计算uuid唯一标识
 */
export function uuid() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = [];
  let i;
  let r;

  uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';

  for (i = 0; i < 36; i++) {
    if (!uuid[i]) {
      r = 0 | (Math.random() * 16);
      uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
    }
  }
  return uuid.join('');
}
