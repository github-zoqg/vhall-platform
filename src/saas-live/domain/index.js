import Vue from 'vue';
import DomainStore from './store';
import {
  setBaseUrl,
  setRequestHeaders,
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
  useMediaCheckServer
} from 'middle-domain';

setBaseUrl({
  v3Url: process.env.VUE_APP_BASE_URL,
  middleUrl: process.env.VUE_APP_MIDDLE_BASE_URL,
  wxBindBaseUrl: process.env.VUE_APP_BIND_BASE_URL
});
setRequestHeaders({
  platform: 7, // 7:PC网页版
  token: localStorage.getItem('token') || '',
  'biz-id': 2, //业务线标识 saas: 2 知客: 4
  'biz-application-id': 'fd8d3653' //paas应用id saas: fd8d3653 知客: 02391153
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
    videoPollingServer: useVideoPollingServer().state
  }
});
