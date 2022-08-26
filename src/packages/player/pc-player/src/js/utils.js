/**
 * 录制时间格式转换
 * @param {*} val
 * @returns
 */
export function computeRecordTime(val) {
  const s = val; // 秒
  let m = 0; // 分
  if (s > 59) {
    m = s / 60;
  }
  return parseInt(m);
}

/**
 * 获取window系统版本
 * @returns version
 */
export function windowVersion() {
  const version = navigator.userAgent;
  if (version.indexOf('Windows') != -1) {
    if (version.indexOf('Windows NT 10.0') != -1) {
      return 'win10';
    } else if (version.indexOf('Windows NT 6.2') != -1) {
      return 'win8';
    } else if (version.indexOf('Windows NT 6.1') != -1) {
      return 'win7';
    }
  } else {
    return 'ios';
  }
}
