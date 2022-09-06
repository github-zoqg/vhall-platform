import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';

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

// 是否微信
export function isWechat() {
  const ua = navigator.userAgent.toLowerCase();
  const isWechat = ua.indexOf('micromessenger') > -1 && !isWechatCom();
  console.log('isWechat 是否为微信', isWechat);
  return isWechat;
}

// 是否qq浏览器
export function isQQ() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('qq') > -1;
}

// 是否企业微信
export function isWechatCom() {
  const ua = navigator.userAgent.toLowerCase();
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
export const replaceHtml = (str, length = 42) => {
  let desc = null;
  desc = str.replace(/&nbsp;/g, '');
  desc = desc
    .replace(/<[^<>&]+>/g, '')
    .replace(/&(lt|gt|nbsp|amp|quot|middot);/gi, '')
    .replace(/(\r\n)|(\n)/g, '');
  desc = desc.replace(/<[^>]+>/g, ''); // 截取html标签
  desc = desc.length > length ? `${desc.trim().substring(0, length)}...` : desc.trim();
  return desc;
};

/**
 * 转换html文本中的xss(仅替换script与style标签)
 * @param {*} string
 * @returns string
 */
export const replaceXss = htmltext => {
  const scriptReg = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g;
  const styleReg = /<style(([\s\S])*?)<\/style>/g;
  return `${htmltext}`.replace(scriptReg, '').replace(styleReg, '');
};

/**
 * @description 多次替换对一个问题做替换(使用uuid作为占位符)
 * @param longText String 替换前文本
 * @param rules Array 替换前后的数据封装体
 * @returns string
 */
export const replaceWithRules = (longText, rules = []) => {
  rules.forEach(rule => {
    rule.tempSign = uuid(); // 先替换为占位符
    longText = longText.replace(rule.before, rule.tempSign);
  });
  rules.forEach(rule => {
    longText = longText.replace(rule.tempSign, rule.after);
  });
  return longText;
};

/**
 * @description 获取浏览器的cookie (当前域下,且非http-only)
 */
export const getCookie = name => {
  var reg = RegExp(name + '=([^;]+)');
  var arr = document.cookie.match(reg);
  if (arr) {
    return arr[1];
  } else {
    return '';
  }
};

export const isFunction = val => {
  return typeof val === 'function';
};

export const handleIntroInfo = str => {
  if (!str) return '';
  const regImg = /<img.*?(?:>|\/>)/g;
  const imgArr = str.match(regImg);
  const strArr = str.split(regImg);
  const regUrl =
    /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/g;
  strArr.forEach((item, index) => {
    const tempStr = item.replace(regUrl, function (match) {
      return `<a class='show-link' href='${match}' target='_blank'>${match}</a>`;
    });
    strArr[index] = tempStr;
  });
  if (imgArr) {
    const imgArrLength = imgArr.length;
    let imgIndex = 0;
    for (let strIndex = 0; strIndex < imgArrLength; ++strIndex) {
      strArr.splice(strIndex + imgIndex + 1, 0, imgArr[imgIndex]);
      imgIndex++;
    }
  }
  return strArr.join('');
};

// 去除不必要的地址栏参数 delUrlParams(window.location.search, ['isIndependent']);
export function delUrlParams(searchUrl, keyList) {
  const urlParam = searchUrl.substring(1); //页面参数
  let nextUrl = '';
  var arr = new Array();
  if (urlParam != '') {
    const urlParamArr = urlParam.split('&'); //将参数按照&符分成数组
    for (let i = 0; i < urlParamArr.length; i++) {
      let paramArr = urlParamArr[i].split('='); //将参数键，值拆开
      //如果键与要删除的不一致，则加入到参数中
      if (!keyList.includes(paramArr[0])) {
        arr.push(urlParamArr[i]);
      }
    }
  }
  if (arr.length > 0) {
    nextUrl = '?' + arr.join('&');
  }
  console.log('当前地址栏结果', nextUrl);
  return nextUrl;
}
// 判断是否IE
export function isIE() {
  return (
    !!window.ActiveXObject || 'ActiveXObject' in window || navigator.userAgent.indexOf('Edge') > -1
  );
}

/**
 * 将 queryString 转换成 key-value 形式
 * @param {String} url url地址
 * @returns object
 */
export const parseQueryString = url => {
  return [...new URL(url).searchParams].reduce(
    (cur, [key, value]) => ((cur[key] = value), cur),
    {}
  );
};

/**
 * 将oss图片地址中的图片处理参数解析成 key-value 的形式
 * @param {String} imgUrl 图片地址
 * @returns Object
 */
export const parseImgOssQueryString = imgUrl => {
  const queryObj = parseQueryString(imgUrl);
  let result = {};

  if (!queryObj['x-oss-process']) {
    return queryObj;
  } else {
    result = { ...queryObj };
    delete result['x-oss-process'];
  }

  const xOssProcessStr = queryObj['x-oss-process'];
  const xOssProcessArr = xOssProcessStr.split(/image\/|x-oss-process=image\/|\//);

  // 解析最外层参数，blur  bright  crop等
  return xOssProcessArr.reduce((currentObj, item) => {
    if (!item) return currentObj;
    const resultKey = item.substring(0, item.indexOf(','));
    let resultVal = null;
    let itemVal = item.substring(item.indexOf(',') + 1);
    if (
      // 亮度、对比度、锐化、渐进显示、旋转、自适应方向、格式转换，直接就是值，不需要再做第二层解析
      ['bright', 'contrast', 'sharpen', 'interlace', 'rotate', 'auto-orient', 'format'].includes(
        resultKey
      )
    ) {
      resultVal = itemVal;
    } else {
      // 解析每个参数具体的值，blur  bright  crop等对应的具体的值
      resultVal = itemVal.split(',').reduce((cur, itemStr) => {
        if (!itemStr) return cur;
        const itemArr = itemStr.split('_');
        cur[itemArr[0]] = itemArr[1];
        return cur;
      }, {});
    }
    currentObj[resultKey] = resultVal;
    return currentObj;
  }, result);
};

/**
 * @description 拼接地址栏参数，自带去重
 */
export const getUrl = (url = '', data = {}) => {
  const qsObj = parseQueryString(url);
  // 截取除去queryString的部分
  const indexOfSeparator = url.indexOf('?');
  if (indexOfSeparator > -1) {
    url = url.substring(0, indexOfSeparator);
  }
  // 去重拼接
  return (
    url +
    '?' +
    getParam({
      ...qsObj,
      ...data
    })
  );
};

/**
 * @description 传入对象返回url参数
 */
export const getParam = data => {
  let url = '';
  for (let k in data) {
    let value = data[k] !== undefined ? data[k] : '';
    url += `&${k}=${encodeURIComponent(value)}`;
  }
  return url ? url.substring(1) : '';
};
