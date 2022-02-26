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
  useQaServer,
  useMediaSettingServer,
  useVirtualAudienceServer
} from 'middle-domain';

setBaseUrl(process.env.VUE_APP_BASE_URL);
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
    qaServer: useQaServer().state,
    mediaSettingServer: useMediaSettingServer().state,
    virtualAudienceServer: useVirtualAudienceServer().state
  }
});
