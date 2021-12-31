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
import VmpPcPlayer from '@/packages/pc-player';
import VmpChat from '@/packages/chat';
import VmpDocUne from '@/packages/doc-une';
import VmpDocToolbar from '@/packages/doc-toolbar';

// 全局注册组件
export function initUse() {
  Vue.use(ElementUI);
  Vue.use(VmpContainer);
  Vue.use(VmpAirContainer);
  Vue.use(VmpAsideMenu);
  Vue.use(VmpIconText);
  Vue.use(VmpLanguageChoice);
  Vue.use(VmpHeaderLeft);
  Vue.use(VmpPcPlayer);
  Vue.use(VmpChat);
  Vue.use(VmpDocUne);
  Vue.use(VmpDocToolbar);
}
