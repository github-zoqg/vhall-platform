/**
 * Created by yangxy on 2022/01/13.
 * 通用工具类
 */
export const hasOwnProperty = function (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

/**
 * 延迟执行(setTimeout的promify写法)
 * @param {*} ms 毫秒数
 * @returns {Promise}
 */
export const sleep = function (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
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
 * @param method 当前组件配置的动作
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

/**
 * @description 校验当前所在浏览器环境
 * @return Boolean {*}
 */
const ua = navigator.userAgent.toLowerCase();

// 是否微信
export function isWechat() {
  return ua.indexOf('micromessenger') > -1; // 返回以前对微信环境的ua识别(阻止企业微信)
  // return ua.indexOf('micromessenger') > -1 && !isWechatCom();
  // const isWechat = ua.indexOf('micromessenger') > -1 && !isWechatCom();
  // console.log('isWechat 是否为微信', isWechat);
  // return isWechat;
}
// 是否qq浏览器
export function isQQ() {
  return ua.indexOf('qq') > -1;
}
// 是否企业微信
export function isWechatCom() {
  // return ua.indexOf('wxwork') > -1;
  const isWechatCom = ua.indexOf('wxwork') > -1;
  console.log('isWechatCom 是否为企业微信', isWechatCom);
  return isWechatCom;
}

// 是否移动端
export function isMobile() {
  return /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|wOSBrowser|BrowserNG|WebOS)/i.test(
    navigator.userAgent
  );
}
// 获取地址栏参数
export function getQueryString(name) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

// 返回四位版本数
function versionPadding(num, length) {
  for (let len = (num + '').length; len < length; len = num.length) {
    num = num + '0';
  }
  return num;
}

/**
 * 获取浏览器类型等相关信息
 */
export function getBrowserType() {
  // 权重：系统 + 系统版本 > 平台 > 内核 + 载体 + 内核版本 + 载体版本 > 外壳 + 外壳版本
  const ua = navigator.userAgent.toLowerCase();
  const testUa = regexp => regexp.test(ua);
  const testVs = regexp => (ua.match(regexp) + '').replace(/[^0-9|_.]/gi, '').replace(/_/gi, '.');
  // 系统
  let system = 'unknown';
  if (testUa(/windows|win32|win64|wow32|wow64/gi)) {
    system = 'windows'; // window系统
  } else if (testUa(/macintosh|macintel/gi)) {
    system = 'macos'; // macos系统
  } else if (testUa(/x11/gi)) {
    system = 'linux'; // linux系统
  } else if (testUa(/android|adr/gi)) {
    system = 'android'; // android系统
  } else if (testUa(/ios|iphone|ipad|ipod|iwatch/gi)) {
    system = 'ios'; // ios系统
  }

  // 系统版本
  let systemVs = 'unknown';
  if (system === 'windows') {
    if (testUa(/windows nt 5.0|windows 2000/gi)) {
      systemVs = '2000';
    } else if (testUa(/windows nt 5.1|windows xp/gi)) {
      systemVs = 'xp';
    } else if (testUa(/windows nt 5.2|windows 2003/gi)) {
      systemVs = '2003';
    } else if (testUa(/windows nt 6.0|windows vista/gi)) {
      systemVs = 'vista';
    } else if (testUa(/windows nt 6.1|windows 7/gi)) {
      systemVs = '7';
    } else if (testUa(/windows nt 6.2|windows 8/gi)) {
      systemVs = '8';
    } else if (testUa(/windows nt 6.3|windows 8.1/gi)) {
      systemVs = '8.1';
    } else if (testUa(/windows nt 10.0|windows 10/gi)) {
      systemVs = '10';
    }
  } else if (system === 'macos') {
    systemVs = testVs(/os x [\d._]+/gi);
  } else if (system === 'android') {
    systemVs = testVs(/android [\d._]+/gi);
  } else if (system === 'ios') {
    systemVs = testVs(/os [\d._]+/gi);
  }

  // 平台
  let platform = 'unknow';
  if (system === 'windows' || system === 'macos' || system === 'linux') {
    platform = 'desktop'; // 桌面端
  } else if (system === 'android' || system === 'ios' || testUa(/mobile/gi)) {
    platform = 'mobile'; // 移动端
  }
  // 内核和载体
  let engine = 'unknow';
  let supporter = 'unknow';
  if (testUa(/applewebkit/gi) && testUa(/safari/gi)) {
    engine = 'webkit'; // webkit内核
    if (testUa(/edge/gi)) {
      supporter = 'edge'; // edge浏览器
    } else if (testUa(/opr/gi)) {
      supporter = 'opera'; // opera浏览器
    } else if (testUa(/chrome/gi)) {
      supporter = 'chrome'; // chrome浏览器
    } else {
      supporter = 'safari'; // safari浏览器
    }
  } else if (testUa(/gecko/gi) && testUa(/firefox/gi)) {
    engine = 'gecko'; // gecko内核
    supporter = 'firefox'; // firefox浏览器
  } else if (testUa(/presto/gi)) {
    engine = 'presto'; // presto内核
    supporter = 'opera'; // opera浏览器
  } else if (testUa(/trident|compatible|msie/gi)) {
    engine = 'trident'; // trident内核
    supporter = 'iexplore'; // iexplore浏览器
  }
  // 内核版本
  let engineVs = 'unknow';
  if (engine === 'webkit') {
    engineVs = testVs(/applewebkit\/[\d.]+/gi);
  } else if (engine === 'gecko') {
    engineVs = testVs(/gecko\/[\d.]+/gi);
  } else if (engine === 'presto') {
    engineVs = testVs(/presto\/[\d.]+/gi);
  } else if (engine === 'trident') {
    engineVs = testVs(/trident\/[\d.]+/gi);
  }
  // 载体版本
  let supporterVs = 'unknow';
  if (supporter === 'chrome') {
    supporterVs = testVs(/chrome\/[\d.]+/gi);
  } else if (supporter === 'safari') {
    supporterVs = testVs(/version\/[\d.]+/gi);
  } else if (supporter === 'firefox') {
    supporterVs = testVs(/firefox\/[\d.]+/gi);
  } else if (supporter === 'opera') {
    supporterVs = testVs(/opr\/[\d.]+/gi);
  } else if (supporter === 'iexplore') {
    supporterVs = testVs(/(msie [\d.]+)|(rv:[\d.]+)/gi);
  } else if (supporter === 'edge') {
    supporterVs = testVs(/edge\/[\d.]+/gi);
  }
  // 外壳和外壳版本
  let shell = 'none';
  let shellVs = 'unknow';
  if (testUa(/micromessenger/gi)) {
    shell = 'wechat'; // 微信浏览器
    shellVs = testVs(/micromessenger\/[\d.]+/gi);
  } else if (testUa(/qqbrowser/gi)) {
    shell = 'qq'; // QQ浏览器
    shellVs = testVs(/qqbrowser\/[\d.]+/gi);
  } else if (testUa(/ubrowser/gi)) {
    shell = 'uc'; // UC浏览器
    shellVs = testVs(/ubrowser\/[\d.]+/gi);
  } else if (testUa(/2345explorer/gi)) {
    shell = '2345'; // 2345浏览器
    shellVs = testVs(/2345explorer\/[\d.]+/gi);
  } else if (testUa(/metasr/gi)) {
    shell = 'sougou'; // 搜狗浏览器
  } else if (testUa(/lbbrowser/gi)) {
    shell = 'liebao'; // 猎豹浏览器
  } else if (testUa(/maxthon/gi)) {
    shell = 'maxthon'; // 遨游浏览器
    shellVs = testVs(/maxthon\/[\d.]+/gi);
  } else if (testUa(/bidubrowser/gi)) {
    shell = 'baidu'; // 百度浏览器
    shellVs = testVs(/bidubrowser [\d.]+/gi);
  } else if (testUa(/360/gi)) {
    shell = '360'; // 360浏览器
    shellVs = testVs(/360 [\d.]+/gi);
  }

  return Object.assign(
    {
      engine, // webkit gecko presto trident
      engineVs,
      platform, // desktop mobile
      supporter, // chrome safari firefox opera iexplore edge
      supporterVs,
      system, // windows macos linux android ios
      systemVs
    },
    shell === 'none'
      ? {}
      : {
          shell, // wechat qq uc 2345 sougou liebao maxthon baidu 360
          shellVs
        }
  );
}

/**
 * @return {Boolean}  true 为支持 false不支持
 */
export function browserSupport() {
  const ua = navigator.userAgent;
  const { supporter, shell } = getBrowserType();
  const chromeTest = ua.match(/chrome\/([\d.]+)/i);
  const chromeVersion = chromeTest ? chromeTest[1] : 0;
  const safariTest = ua.match(/Version\/([\d.]+).*Safari/);
  const safariVersion = safariTest ? safariTest[1].replace(/\./g, '') : 0;
  const safariVersion4 = versionPadding(safariVersion, 4);
  const shells = ['qq', 'wechat', 'uc', '2345', 'sougou', 'liebao', 'maxthon', 'baidu'];
  if (
    ((supporter == 'chrome' && chromeVersion && chromeVersion.split('.')[0] >= 74) ||
      (supporter == 'safari' && Number(safariVersion4) > 1303)) &&
    !shells.includes(shell)
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * 获取上报os操作系统
 */
export function getVhallReportOs() {
  const { system } = getBrowserType();
  let os = 0; // 上报默认值
  if (system === 'windows') {
    os = 12;
  } else if (system === 'macos') {
    console.warn('getVhallReportOs--------->暂时没有指定该类型');
  } else if (system === 'android') {
    os = 10;
  } else if (system === 'ios') {
    os = 11;
  }
  return os;
}

/**
 * 手机号验证
 * */
export const validPhone = (rule, value, vueThis) => {
  const reg = /^1[3|4|5|6|7|8|9]\d{9}$/;
  if (!value) {
    return vueThis ? vueThis.$t('account.account_1025') : '请填写手机号码';
  } else if (!reg.test(value)) {
    return vueThis ? vueThis.$t('account.account_1069') : '请填写正确的手机号码';
  } else {
    return true;
  }
};
/**
 * 邮箱验证
 * */
export const validEmail = (required, value, vueThis) => {
  const reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
  if (!value && required) {
    return vueThis ? vueThis.$t('form.form_1007') : '请填写邮箱';
  } else if (value.length > 80) {
    return vueThis ? vueThis.$t('form.form_1009') : '邮箱长度不能大于80';
  } else if (value && !reg.test(value)) {
    return vueThis ? vueThis.$t('form.form_1010') : '请填写正确的邮箱';
  } else {
    return true;
  }
};
/**
 * 转化简介
 * @param {*} value
 * @returns
 */
export const replaceHtml = str => {
  let desc = null;
  desc = str.replace(/&nbsp;/g, '');
  desc = desc
    .replace(/<[^<>&]+>/g, '')
    .replace(/&(lt|gt|nbsp|amp|quot|middot);/gi, '')
    .replace(/(\r\n)|(\n)/g, '');
  desc = desc.replace(/<[^>]+>/g, ''); // 截取html标签
  desc = desc.length > 42 ? `${desc.trim().substring(0, 42)}...` : desc.trim();
  return desc;
};
