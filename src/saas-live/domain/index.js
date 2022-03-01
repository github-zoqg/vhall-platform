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
  useUserServer
} from 'middle-domain';

setBaseUrl({
  v3Url: process.env.VUE_APP_BASE_URL,
  middleUrl: process.env.VUE_APP_MIDDLE_BASE_URL
});
setRequestHeaders({
  platform: 7, // 7:PC网页版
  token: localStorage.getItem('token') || ''
});

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
    userServer: useUserServer().state
  }
});
