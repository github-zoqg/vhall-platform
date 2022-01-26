import Vue from 'vue';

// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpAsideMenu from '@/packages/aside-menu';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import VmpHeaderRight from '@/packages/header-right';
import VmpPcPlayer from '@/packages/pc-player';
import VmpChat from '@/packages/chat';
import VmpLivePrivateChat from '@/packages/live-private-chat';
import VmpDocUne from '@/packages/doc-une';
import VmpDocDlglist from '@/packages/doc-dlglist';
import VmpStreamListLive from '@/packages/stream-list-live';
import VmpStreamLocal from '@/packages/stream-local';
import VmpStreamRemote from '@/packages/stream-remote';
import VmpMediaCheck from '@/packages/media-check';
import VmpMemberList from '@/packages/member-list';
import VmpInteractMenu from '@/packages/interact-menu';
import VmpShare from '@/packages/share'; // 发起端分享观看端地址
import VmpVirtualPeople from '@/packages/virtual-people'; // 虚拟人数弹窗
import VmpThirdStream from '@/packages/third-push-stream';
import VmpInsertVideo from '@/packages/insert-video-list';
import VmpInsertStream from '@/packages/insert-video-stream';
import VmpBasicCenterContainerLive from '@/packages/basic-center-container-live';
import VmpGroupDiscussion from '@/packages/group-discussion';
import 'overlayscrollbars/css/OverlayScrollbars.css';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';

// 全局注册组件
export function initUse() {
  Vue.use(VmpContainer);
  Vue.use(VmpAirContainer);
  Vue.use(VmpAsideMenu);
  Vue.use(VmpIconText);
  Vue.use(VmpLanguageChoice);
  Vue.use(VmpHeaderLeft);
  Vue.use(VmpHeaderRight);
  Vue.use(VmpPcPlayer);
  Vue.use(VmpChat);
  Vue.use(VmpLivePrivateChat);
  Vue.use(VmpDocUne);
  Vue.use(VmpDocDlglist);
  Vue.use(VmpStreamListLive);
  Vue.use(VmpStreamLocal);
  Vue.use(VmpStreamRemote);
  Vue.use(VmpMediaCheck);
  Vue.use(VmpMemberList);
  Vue.use(VmpInteractMenu);
  Vue.use(VmpShare);
  Vue.use(VmpVirtualPeople);
  Vue.use(VmpThirdStream);
  Vue.use(VmpInsertVideo);
  Vue.use(VmpInsertStream);
  Vue.use(VmpBasicCenterContainerLive);
  Vue.use(VmpGroupDiscussion);

  //初始化滚动插件，也可以考虑局部引用，这个可能会有其他组件使用
  Vue.use(OverlayScrollbarsPlugin);
}
