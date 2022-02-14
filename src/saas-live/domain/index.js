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
  useGroupServer,
  useChatAuthServer
} from 'middle-domain';

setBaseUrl('https://t-saas-dispatch.vhall.com');
setRequestHeaders({
  platform: 7, // 7:PC网页版
  token: localStorage.getItem('token') || '',
  'interact-token': sessionStorage.getItem('interact_token') || ''
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
    groupServer: useGroupServer().state,
    chatAuthServer: useChatAuthServer().state
  }
});
