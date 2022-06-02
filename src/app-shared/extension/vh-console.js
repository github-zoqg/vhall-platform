/**
 * 重写console日志输出，可以通过开关控制
 * 支持在PC端和wap端使用, 其中wap端网页调试工具使用eruda
 * 以下情况（满足一条就行）会开启日志打印：
 * 1、sessionStorage中存在key=__openDebug__，且值=1
 * 2、地址链接中有debug=true
 * 3、非生产环境默认开启日志
 */
const isProd = process.env.NODE_ENV === 'production';
const cacheKey = '__openDebug__';
let debugStatusCache = sessionStorage.getItem(cacheKey);
const debugSwitch = window.location.search.indexOf('debug=true') > -1;
if (!isProd && debugStatusCache === null) {
  // 非生产环境，如果从未设置过__openDebug__的任何值，默认开启日志打印
  debugStatusCache = 1;
}

const openLog = debugStatusCache == 1 || debugSwitch;
if (openLog) {
  // 防止当前页面跳转后丢失开关状态
  sessionStorage.setItem(cacheKey, 1);
  if (window.eruda) {
    // 移动端使用eruda工具
    window.eruda.init();
  } else {
    loadjs('https://s4.e.vhall.com/common-static/middle/eruda/2.4.1/eruda.js', function () {
      window.eruda && window.eruda.init();
    });
  }
}

// 重写console.log
console.log = (function (oriLogFunc) {
  return function () {
    if (openLog) {
      oriLogFunc.call(console, ...arguments);
    }
  };
})(console.log);

// 重写console.info
console.info = (function (oriLogFunc) {
  return function () {
    if (openLog) {
      oriLogFunc.call(console, ...arguments);
    }
  };
})(console.info);

// 重写console.warn
console.warn = (function (oriLogFunc) {
  return function () {
    if (openLog) {
      oriLogFunc.call(console, ...arguments);
    }
  };
})(console.warn);

// 重写console.error
console.error = (function (oriLogFunc) {
  return function () {
    if (openLog) {
      oriLogFunc.call(console, ...arguments);
    }
  };
})(console.error);

// 重写console.table
console.table = (function (oriLogFunc) {
  return function () {
    if (openLog) {
      oriLogFunc.call(console, ...arguments);
    }
  };
})(console.table);
