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
