import Vue from 'vue';
import DomainStore from './store';
import { setBaseUrl, setRequestHeaders, useDocServer } from 'middleDomain';

setBaseUrl('https://t-saas-dispatch.vhall.com');
setRequestHeaders({
  platform: 10
});

Vue.use(DomainStore);

export default new DomainStore.Store({
  state: {
    docServer: useDocServer().state
  }
});
