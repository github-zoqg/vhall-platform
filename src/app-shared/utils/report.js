// 本文件用于封装发起端、观看端通用的日志上报方法
// 所有封装的上报的方法,全部添加 try catch 避免数据上报出错影响业务流程

import { _toString } from '@/app-shared/utils/toString';

// 观看端通用数据
export function getReceiveCommonLogData() {
  return {
    ua: navigator.userAgent,
    visitorId: sessionStorage.getItem('visitorId'),
    interact_token: sessionStorage.getItem('interact_token'),
    kickId: sessionStorage.getItem('kickId'),
    kickMark: sessionStorage.getItem('kickMark'),
    ssoEnabled: sessionStorage.getItem('ssoEnabled'),
    initGrayId: sessionStorage.getItem('initGrayId'),
    token: localStorage.getItem('token'),
    userInfo: localStorage.getItem('userInfo'),
    lang: localStorage.getItem('lang')
  };
}

// 发起端通用数据
export function getSendCommonLogData() {
  return {
    ua: navigator.userAgent,
    token: localStorage.getItem('token'),
    visitorId: sessionStorage.getItem('visitorId'),
    interact_token: sessionStorage.getItem('interact_token'),
    kickMark: sessionStorage.getItem('kickMark'),
    initGrayId: sessionStorage.getItem('initGrayId')
  };
}

/**
 * 房间初始化失败的上报
 * @param {Object} options isSend 是否是发起端   error 报错信息
 */
export function logRoomInitFailed(options = { isSend: false, error: {} }) {
  try {
    const commonData = options.isSend ? getSendCommonLogData() : getReceiveCommonLogData();
    console.log('--------------初始化错误日志上报--------------开始---------');
    window.vhallLog({
      tag: 'live_room_init_error', // 日志所属功能模块
      ...commonData,
      error: _toString(options.error),
      type: 'log' // log 日志埋点，event 业务数据埋点
    });
  } catch (err) {
    console.log(err);
  }
}
