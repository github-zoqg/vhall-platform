import Vue from 'vue';
import DomainStore from './store';
import {
  setBaseUrl,
  setRequestHeaders,
  useDocServer,
  useInteractiveServer,
  useRoomBaseServer
} from 'middle-domain';

const paasAppId = 'fd8d3653';

// setBaseUrl('https://t-saas-dispatch.vhall.com');
setBaseUrl('https://dev-csd-api.vhall.com');
setRequestHeaders({
  token: localStorage.getItem('token') || '',
  platform: 7, // 7:PC网页版
  'biz-id': 2,
  'biz-application-id': paasAppId
  // 'x-login-user-info':
  //   '{"user_id":16422761,"platform":17,"exp_time":123434,"business_account_id":123,"ch":"B"}'
});

const roomBaseServer = useRoomBaseServer();
roomBaseServer.setPaasAppId(paasAppId);

Vue.use(DomainStore);

export default new DomainStore.Store({
  state: {
    roomBaseServer: roomBaseServer.state,
    docServer: useDocServer().state,
    interactiveServer: useInteractiveServer().state
  }
});
