import semver from 'semver';
import UAParser from 'ua-parser-js';
export const isMse = function () {
  // window.semver = semver;
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
