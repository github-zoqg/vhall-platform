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

/**
 * 观看端上报的公用数据(大部分)
 * @param watchInitData 参会接口后的domain挂载数据
 * @param userInfo userServer的state的用户信息
 * @param shareId url链接上的参数
 */
export function generateWatchReportCommonParams(watchInitData = {}, userInfo = {}, shareId = '') {
  const cacheKey = '__report__sid__';
  let sid = sessionStorage.getItem(cacheKey);
  if (!sid) {
    const current = new Date().getTime();
    const visitorId = watchInitData?.visitor_id || watchInitData?.join_info?.third_party_user_id;
    sid = `${watchInitData?.interact?.paas_app_id}_${visitorId}${current}`;
    sessionStorage.setItem(cacheKey, sid);
  }
  const params = {
    s: sid,
    visitor_id: watchInitData?.visitor_id,
    reg_id: watchInitData?.join_info?.join_id,
    nickname: encodeURIComponent(watchInitData?.join_info?.nickname),
    business_uid: watchInitData?.webinar?.userinfo?.user_id,
    app_id: watchInitData?.interact?.paas_app_id,
    webinar_id: watchInitData?.webinar?.id,
    webinar_name: encodeURIComponent(watchInitData?.webinar?.subject),
    room_id: watchInitData?.interact?.room_id,
    inav_id: watchInitData?.interact?.inav_id,
    channel_id: watchInitData?.interact?.channel_id,
    switch_id: watchInitData?.switch?.switch_id,
    record_id: watchInitData?.record?.paas_record_id,
    webinar_type: watchInitData?.webinar?.mode,
    file_type: watchInitData?.webinar?.type,
    role_name: watchInitData?.join_info?.role_name,
    ua: navigator.userAgent,
    ref_url: document.referrer,
    language_type: localStorage.getItem('lang') || 1,
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };
  if (watchInitData?.join_info?.user_id === 0) {
    // 未登录
    params.is_login = 0;
  } else {
    params.is_login = 1;
    params.user_id = watchInitData?.join_info?.user_id;
    params.sso_union_id = userInfo?.union_id;
  }
  if (shareId) {
    params.share_id = shareId;
    const strArr = `${shareId}`.split('-');
    const sourceChannel = strArr[strArr.length - 1];
    if (['0', '1', '2', '3', '4'].includes(sourceChannel)) {
      params.source_channel = sourceChannel;
    }
  }
  return params;
}
