const ua = navigator.userAgent.toLowerCase();

// 是否企业微信
export function isWxCom() {
  // return ua.indexOf('wxwork') > -1;
  const isWxCom = ua.indexOf('wxwork') > -1;
  console.log('isWxCom 是否为企业微信', isWxCom);
  return isWxCom;
}

// 是否微信
export function isWx() {
  // return  ua.indexOf('micromessenger') > -1 && !isWxCom();
  const isWx = ua.indexOf('micromessenger') > -1 && !isWxCom();
  console.log('isWx 是否为微信', isWx);
  return isWx;
}

// 是否qq
export function isQQ() {
  return ua.indexOf('qq') > -1;
}

// 是否为安卓
export function isAndroid() {
  return ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1;
}

// 是否为ios
export function isIOS() {
  return !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

// x5内核
export function isX5() {
  return !isIOS() && (ua.match(/MicroMessenger/i) || ua.match(/QQ/i));
}
