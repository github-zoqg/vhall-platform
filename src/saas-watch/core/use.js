import Vue from 'vue';
// element-ui
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import '../assets/icon-font/iconfont.css';
// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpAsideMenu from '@/packages/aside-menu';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import VmpHeaderWatch from '@/packages/header-watch-pc';
import VmpPcPlayer from '@/packages/pc-player';
import VmpChat from '@/packages/chat';
import VmpDocUne from '@/packages/doc-une';
import VmpDocToolbar from '@/packages/doc-toolbar';
import VmpStreamList from '@/packages/stream-list';
import VmpStreamLocal from '@/packages/stream-local';
import VmpStreamRemote from '@/packages/stream-remote';
import VmpFooter from '@/packages/footer';
import VmpFooterTools from '@/packages/footer-tools';
import VmpPraise from '@/packages/praise';
import VmpNoticeList from '@/packages/notice'; // 公告列表
import VmpNoticeColumn from '@/packages/notice-column'; //公告滚动显示
import VmpBasicRightContainer from '@/packages/basic-right-container';
import VmpBasicCenterContainer from '@/packages/basic-center-container';

// 全局注册组件
export function initUse() {
  Vue.use(ElementUI);
  Vue.use(VmpContainer);
  Vue.use(VmpAirContainer);
  Vue.use(VmpAsideMenu);
  Vue.use(VmpIconText);
  Vue.use(VmpLanguageChoice);
  Vue.use(VmpHeaderLeft);
  Vue.use(VmpHeaderWatch);
  Vue.use(VmpPcPlayer);
  Vue.use(VmpChat);
  Vue.use(VmpDocUne);
  Vue.use(VmpDocToolbar);
  Vue.use(VmpStreamList);
  Vue.use(VmpStreamLocal);
  Vue.use(VmpStreamRemote);
  Vue.use(VmpFooter);
  Vue.use(VmpFooterTools);
  Vue.use(VmpPraise);
  Vue.use(VmpNoticeList);
  Vue.use(VmpNoticeColumn);
  Vue.use(VmpBasicRightContainer);
  Vue.use(VmpBasicCenterContainer);
}
