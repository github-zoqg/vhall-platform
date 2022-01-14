import Vue from 'vue';

// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpAsideMenu from '@/packages/aside-menu';
import VmpIconText from '@/packages/icon-text';
import VmpIconItem from '@/packages/icon-item';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import VmpHeaderRight from '@/packages/header-right';
import VmpPcPlayer from '@/packages/pc-player';
import VmpChat from '@/packages/chat';
import VmpDocUne from '@/packages/doc-une';
import VmpDocDlglist from '@/packages/doc-dlglist';
import VmpStreamList from '@/packages/stream-list';
import VmpStreamLocal from '@/packages/stream-local';
import VmpStreamRemote from '@/packages/stream-remote';
import VmpMediaCheck from '@/packages/media-check';
import VmpMemberList from '@/packages/member-list';
import VmpInteractMenu from '@/packages/interact-menu';
import VmpShare from '@/packages/share'; // 发起端分享观看端地址
import VmpVirtualPeople from '@/packages/virtual-people'; // 虚拟人数弹窗

// 全局注册组件
export function initUse() {
  Vue.use(VmpContainer);
  Vue.use(VmpAirContainer);
  Vue.use(VmpAsideMenu);
  Vue.use(VmpIconText);
  Vue.use(VmpIconItem);
  Vue.use(VmpLanguageChoice);
  Vue.use(VmpHeaderLeft);
  Vue.use(VmpHeaderRight);
  Vue.use(VmpPcPlayer);
  Vue.use(VmpChat);
  Vue.use(VmpDocUne);
  Vue.use(VmpDocDlglist);
  Vue.use(VmpStreamList);
  Vue.use(VmpStreamLocal);
  Vue.use(VmpStreamRemote);
  Vue.use(VmpMediaCheck);
  Vue.use(VmpMemberList);
  Vue.use(VmpInteractMenu);
  Vue.use(VmpShare);
  Vue.use(VmpVirtualPeople);
}
