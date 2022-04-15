/**
 * 保存观看协议到本地, 规则为当天24点前有效,cookie自动过期清除
 * @param {*} webinarId key的名字, 值默认是当前时间, key用agree-活动id形式
 */
export function saveCookieAgreeCurDay(webinarId) {
  const curDayTime = moment().format();
  const endDayTime = moment().endOf('day');
  // const remainingTime = endDayTime.diff(curDayTime);
  // console.log('curDayTime---->', curDayTime);
  // console.log('endDayTime---->', endDayTime);
  const inFifteenMinutes = new Date(endDayTime);

  //test
  // const inFifteenMinutes = new Date(new Date().getTime() + 10 * 1000);
  // console.log('inFifteenMinutes--------->', inFifteenMinutes);
  // 创建一个从现在起到当天24点过期的cookie，在整个站点上有效：
  Cookies.set(webinarId, curDayTime, { expires: inFifteenMinutes });
}

/**
 * 获取观看协议对应数据
 * @param {*} webinarId
 * @returns 如果返回值为 true 表示用户同意了该协议、false表示取消
 */
export function getCookieAgreeCurDay(webinarId) {
  const agreeData = Cookies.get(webinarId);
  if (agreeData) {
    return true;
  } else {
    return false;
  }
}

// 测试下
// window.saveCookieAgreeCurDay = saveCookieAgreeCurDay;
// window.getCookieAgreeCurDay = getCookieAgreeCurDay;
