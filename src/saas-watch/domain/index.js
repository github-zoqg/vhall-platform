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
  useVirtualAudienceServer
} from 'middle-domain';

setBaseUrl('https://t-saas-dispatch.vhall.com');
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
    virtualAudienceServer: useVirtualAudienceServer().state
  }
});
