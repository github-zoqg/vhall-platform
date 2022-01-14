import Vue from 'vue';
import DomainStore from './store';
import {
  setBaseUrl,
  setRequestHeaders,
  useDocServer,
  useInteractiveServer,
  useRoomBaseServer
} from 'middle-domain';

setBaseUrl('https://t-saas-dispatch.vhall.com');
setRequestHeaders({
  platform: 10
});

Vue.use(DomainStore);

export default new DomainStore.Store({
  state: {
    docServer: useDocServer().state,
    interactiveServer: useInteractiveServer().state,
    roomBaseServer: useRoomBaseServer().state
  }
});
