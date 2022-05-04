import semver from 'semver';
import UAParser from 'ua-parser-js';
export function computeRecordTime(val) {
  const s = val; // 秒
  let m = 0; // 分
  if (s > 59) {
    m = s / 60;
  }
  return parseInt(m);
}
export const isMse = function () {
  window.semver = semver;
  const result = Object.create(null);
  const uaResult = new UAParser().getResult();
  result.isTencent =
    (uaResult.ua.match(/mqqbrowser|qzone|qqbrowser|qq|micromessenger/i) || []).length > 0;
  result.browser = uaResult.browser.name.toLowerCase();
  result.browserVersion = uaResult.browser.version;
  result.os = uaResult.os.name.toLowerCase();
  result.osVersion = uaResult.os.version;
  result.platform =
    (
      uaResult.ua.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      ) || []
    ).length > 0
      ? 'mobile'
      : 'pc';
  // cv short for convert version.
  const cv = ov => semver.coerce(ov);

  // 基于 https://caniuse.com/#search=mediasource 2019-08-23日结果
  const judgeMSE = () => {
    // iOS safari 完全不支持
    if (result.os === 'ios' && result.browser.indexOf('safari')) {
      return false;
    }

    // chrome 小于23 完全不支持
    if (result.browser === 'chrome' && semver.lt(cv(result.browserVersion), cv(23))) {
      return false;
    }

    // firefox 42以下不支持
    if (result.browser === 'firefox' && semver.lt(cv(result.browserVersion), cv(42))) {
      return false;
    }

    // ie 11 以下不支持(11版本部分支持)
    if (result.browser === 'ie' && semver.lt(cv(result.browserVersion), cv(11))) {
      return false;
    }

    // 安卓4.4以下不支持
    if (result.os === 'android' && semver.lt(cv(result.osVersion), cv(4.4))) {
      return false;
    }

    // opera 15以下不支持
    if (result.browser === 'opera' && semver.lt(cv(result.browserVersion), cv(15))) {
      return false;
    }

    // opera mobile46以下不支持
    if (result.browser === 'opera mobile' && semver.lt(cv(result.browserVersion), cv(46))) {
      return false;
    }

    // opera mini 不支持
    if (result.browser === 'opera mini') {
      return false;
    }

    // 三星不支持
    if (result.browser.indexOf('samsung') >= 0) {
      return false;
    }

    // 如果window上都没有MediaSource不存在，不支持MSE
    if (typeof window !== 'undefined') {
      // 判断是否有mediaSource
      const existMediaSource = window.MediaSource || window.WebKitMediaSource;
      // 判断是否有SourceBuffer
      const sourceBuffer = window.SourceBuffer || window.WebKitSourceBuffer;
      // 判断sourceBuffer 是否有appendBuffer
      const validSourceBufferApi =
        (sourceBuffer &&
          sourceBuffer.prototype &&
          typeof sourceBuffer.prototype.appendBuffer === 'function' &&
          typeof sourceBuffer.prototype.remove === 'function') ||
        false;

      return existMediaSource && validSourceBufferApi;
    }

    return true;
  };
  result.supportMSE = judgeMSE();
  return result;
};

// 判断访问终端
var browser = {
  versions: (function () {
    var u = navigator.userAgent;
    // var app = navigator.appVersion
    // console.log(app)
    var isIphoneX =
      !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) &&
      window.devicePixelRatio &&
      (window.devicePixelRatio === 3 || window.devicePixelRatio === 2) &&
      (window.screen.width === 414 || window.screen.width === 375) &&
      (window.screen.height === 896 || window.screen.height === 812);
    let jude9 = false;
    const ios9 = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    if (ios9) {
      const iosVersion = u
        .toLowerCase()
        .match(/os (.*?) like mac os/)[1]
        .replace(/_/g, '.')
        .substr(0, 2);
      // // ios系统低于且等于9的
      if (iosVersion <= 9) {
        jude9 = true;
      }
    }
    // 判断是否为X系列
    var terminalHei = u.match(/QQ/i) == 'QQ' || u.indexOf('MicroMessenger') > -1;
    window.u = u;
    return {
      trident: u.indexOf('Trident') > -1, // IE内核
      presto: u.indexOf('Presto') > -1, // opera内核
      webKit: u.indexOf('AppleWebKit') > -1, // 苹果、谷歌内核
      gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, // 火狐内核
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
      android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, // android终端
      iPhone: u.indexOf('iPhone') > -1, // 是否为iPhone或者QQHD浏览器
      iPad: u.indexOf('iPad') > -1, // 是否iPad
      webApp: u.indexOf('Safari') == -1, // 是否web应该程序，没有头部与底部
      weixin: u.indexOf('MicroMessenger') > -1, // 是否微信 （2015-01-22新增）
      qq: u.match(/QQ/i) == 'QQ', // 是否QQ
      iPhoneX: isIphoneX, // 是否为iPhonex系列
      ios9: ios9,
      terminal: terminalHei,
      judeLow9: jude9,
      u: u,
      X5: u.indexOf('TBS') > -1 ? true : false
    };
  })(),
  language: (navigator.browserLanguage || navigator.language).toLowerCase()
};

export default browser;
