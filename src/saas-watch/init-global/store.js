import Vue from 'vue';
import DomainStore from '@/app-shared/domain-store/index';
import {
  setBaseUrl,
  setRequestHeaders,
  setResponseInterceptors,
  useDocServer,
  useInteractiveServer,
  useRoomBaseServer,
  useMicServer,
  useMediaSettingServer,
  useVirtualAudienceServer,
  useUserServer,
  useGroupServer,
  useDesktopShareServer,
  useSplitScreenServer,
  useInsertFileServer,
  useMediaCheckServer,
  useVideoPollingServer,
  useChatServer,
  usePlayerServer,
  useSubscribeServer,
  useSubjectServer
} from 'middle-domain';

setBaseUrl({
  v3Url: process.env.VUE_APP_BASE_URL,
  middleUrl: process.env.VUE_APP_MIDDLE_BASE_URL,
  wxBindBaseUrl: process.env.VUE_APP_BIND_BASE_URL
});

/**
 * 平台标识
 * wiki:
 */
setRequestHeaders({
  platform: 7
});
setResponseInterceptors(e => {
  //如果是本地token（非地址栏中的token或live_token）失效，清空token
  if ([511006, 511007].includes(e?.data?.code)) {
    localStorage.removeItem('token');
  }
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
    mediaSettingServer: useMediaSettingServer().state,
    virtualAudienceServer: useVirtualAudienceServer().state,
    userServer: useUserServer().state,
    groupServer: useGroupServer().state,
    desktopShareServer: useDesktopShareServer().state,
    splitScreenServer: useSplitScreenServer().state,
    insertFileServer: useInsertFileServer().state,
    mediaCheckServer: useMediaCheckServer().state,
    videoPollingServer: useVideoPollingServer().state,
    chatServer: useChatServer().state,
    playerServer: usePlayerServer().state,
    subscribeServer: useSubscribeServer().state,
    subjectServer: useSubjectServer().state
  }
});
