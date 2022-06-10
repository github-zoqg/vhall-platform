import Vue from 'vue';
import DomainStore from '@/app-shared/domain-store/index';
import {
  setBaseUrl,
  setRequestHeaders,
  useDocServer,
  useInteractiveServer,
  useRoomBaseServer,
  useMicServer,
  useGroupServer,
  useUserServer,
  useVirtualAudienceServer,
  useDesktopShareServer,
  useInsertFileServer,
  useMediaCheckServer,
  usePlayerServer,
  useChatServer
} from 'middle-domain';

setBaseUrl({
  v3Url: process.env.VUE_APP_BASE_URL,
  middleUrl: process.env.VUE_APP_MIDDLE_BASE_URL,
  wxBindBaseUrl: process.env.VUE_APP_BIND_BASE_URL
});
setRequestHeaders({
  platform: 10
});

// 平台标识
window.platform = 10;

Vue.use(DomainStore);

export default new DomainStore.Store({
  state: {
    roomBaseServer: useRoomBaseServer().state,
    docServer: useDocServer().state,
    interactiveServer: useInteractiveServer().state,
    micServer: useMicServer().state,
    groupServer: useGroupServer().state,
    virtualAudienceServer: useVirtualAudienceServer().state,
    userServer: useUserServer().state,
    desktopShareServer: useDesktopShareServer().state,
    insertFileServer: useInsertFileServer().state,
    mediaCheckServer: useMediaCheckServer().state,
    playerServer: usePlayerServer().state,
    chatServer: useChatServer().state
  }
});