import Vue from 'vue';
import DomainStore from '@/app-shared/domain-store/index';
import { getQueryString } from '@/app-shared/utils/tool';
import { bu_appId } from './businessData';

import {
  setBaseUrl,
  setRequestHeaders,
  setResponseInterceptors,
  useDocServer,
  useInteractiveServer,
  useRoomBaseServer,
  useMicServer,
  useMemberServer,
  useQaAdminServer,
  useGroupServer,
  useChatAuthServer,
  useMediaSettingServer,
  useUserServer,
  useInsertFileServer,
  useDesktopShareServer,
  useSplitScreenServer,
  useVideoPollingServer,
  useMediaCheckServer,
  useChatServer
} from 'middle-domain';

setBaseUrl({
  v3Url: process.env.VUE_APP_BASE_URL,
  middleUrl: process.env.VUE_APP_MIDDLE_BASE_URL,
  wxBindBaseUrl: process.env.VUE_APP_BIND_BASE_URL
});
const linkToken =
  getQueryString('token') || getQueryString('liveT') || getQueryString('live_token') || '';
setRequestHeaders({
  platform: 7, // 7:PC网页版
  token: linkToken ? '' : localStorage.getItem('token') || '', //如果地址栏有token则不设置token。优先级
  'biz-id': 2, //业务线标识 saas: 2 知客: 4
  'biz-application-id': bu_appId[process.env.VUE_APP_SAAS_ENV]
});
setResponseInterceptors(e => {
  //进入发起端，如果是本地token（非地址栏中的token或live_token）失效，清空token刷新页面跳转到B端登录页
  if ([512506, 512507, 511058, 511005, 511006, 511007, 510008].includes(e.data.code)) {
    localStorage.removeItem('token');
    location.href = `${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_WEB_KEY}/login?${location.search}`;
  }
});
// 平台标识
window.platform = 7;

Vue.use(DomainStore);

export default new DomainStore.Store({
  state: {
    roomBaseServer: useRoomBaseServer().state,
    docServer: useDocServer().state,
    interactiveServer: useInteractiveServer().state,
    micServer: useMicServer().state,
    memberServer: useMemberServer().state,
    qaServer: useQaAdminServer().state,
    groupServer: useGroupServer().state,
    chatAuthServer: useChatAuthServer().state,
    mediaSettingServer: useMediaSettingServer().state,
    mediaCheckServer: useMediaCheckServer().state,
    userServer: useUserServer().state,
    insertFileServer: useInsertFileServer().state,
    desktopShareServer: useDesktopShareServer().state,
    splitScreenServer: useSplitScreenServer().state,
    videoPollingServer: useVideoPollingServer().state,
    chatServer: useChatServer().state
  }
});
