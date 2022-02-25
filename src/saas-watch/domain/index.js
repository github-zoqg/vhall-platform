import Vue from 'vue';
import DomainStore from './store';
import {
  setBaseUrl,
  setRequestHeaders,
  useDocServer,
  useInteractiveServer,
  useRoomBaseServer,
  useMicServer,
  useMediaSettingServer,
  useVirtualAudienceServer,
  useUserServer,
  useGroupServer
} from 'middle-domain';

setBaseUrl({
  v3Url: process.env.VUE_APP_BASE_URL,
  middleUrl: process.env.VUE_APP_MIDDLE_BASE_URL
});
setRequestHeaders({
  platform: 7
});

Vue.use(DomainStore);

export default new DomainStore.Store({
  state: {
    roomBaseServer: useRoomBaseServer().state,
    docServer: useDocServer().state,
    interactiveServer: useInteractiveServer().state,
    micServer: useMicServer().state,
    mediaSettingServer: useMediaSettingServer().state,
    virtualAudienceServer: useVirtualAudienceServer().state,
    userServer: useUserServer().state,
    groupServer: useGroupServer().state
  }
});
