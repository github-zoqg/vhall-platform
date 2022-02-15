import Vue from 'vue';

// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpAsideMenu from '@/packages/aside-menu';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import VmpHeaderWatchWap from '@/packages/header-watch-wap'; //头部box
import VmpPcPlayer from '@/packages/pc-player';
import VmpChat from '@/packages/chat';
import VmpDocUne from '@/packages/doc-une';
import VmpStreamList from '@/packages/stream-list';
import VmpStreamLocal from '@/packages/stream-local';
import VmpStreamRemote from '@/packages/stream-remote';
import VmpFooter from '@/packages/footer';
import VmpFooterTools from '@/packages/footer-tools';
import VmpRegLoginWap from '@/packages/reg-login-wap';
import VmpPraise from '@/packages/praise';
import VmpNoticeList from '@/packages/notice'; // 公告列表
import VmpNoticeColumn from '@/packages/notice-column'; //公告滚动显示
import VmpBasicRightContainer from '@/packages/basic-right-container';
import VmpBasicCenterContainer from '@/packages/basic-center-container';
import VmpShare from '@/packages/share'; // 观看端分享
import VmpAttention from '@/packages/attention-watch'; // 观看端关注
import VmpOfficial from '@/packages/official-watch-pc'; // 观看端公众号
import VmpWatchAuth from '@/packages/watch-auth'; // 观看端公众号
//观看端成员列表
import VmpMemberList from '@/packages/member-list';
//观看端私聊
import VmpWatchPrivateChat from '@/packages/watch-private-chat';
//观看端报名表单
import VmpSignUpForm from '@/packages/sign-up-form';
import VmpTabMenuWap from '@/packages/tab-menu-wap';
import VmpTabContainer from '@/packages/tab-container';
import VmpIntroWap from '@/packages/intro-wap';
//wap互动工具计时器弹窗
import VmpWapTimer from '@/packages/wap-timer';
//wap互动工具box
import VmpContainerRightWap from '@/packages/basic-right-container-wap';
//wap公告
import VmpNoticeWap from '@/packages/notice-watch-wap';

// 全局注册组件
export function initUse() {
  Vue.use(VmpContainer);
  Vue.use(VmpAirContainer);
  Vue.use(VmpAsideMenu);
  Vue.use(VmpIconText);
  Vue.use(VmpLanguageChoice);
  Vue.use(VmpHeaderLeft);
  Vue.use(VmpHeaderWatchWap);
  Vue.use(VmpPcPlayer);
  Vue.use(VmpChat);
  Vue.use(VmpDocUne);
  Vue.use(VmpStreamList);
  Vue.use(VmpStreamLocal);
  Vue.use(VmpStreamRemote);
  Vue.use(VmpFooter);
  Vue.use(VmpFooterTools);
  Vue.use(VmpRegLoginWap);
  Vue.use(VmpPraise);
  Vue.use(VmpNoticeList);
  Vue.use(VmpNoticeColumn);
  Vue.use(VmpBasicRightContainer);
  Vue.use(VmpBasicCenterContainer);
  Vue.use(VmpShare);
  Vue.use(VmpAttention);
  Vue.use(VmpOfficial);
  Vue.use(VmpWatchAuth);
  Vue.use(VmpMemberList);
  Vue.use(VmpWatchPrivateChat);
  Vue.use(VmpSignUpForm);
  Vue.use(VmpContainer);
  Vue.use(VmpTabMenuWap);
  Vue.use(VmpTabContainer);
  Vue.use(VmpIntroWap);
  Vue.use(VmpWapTimer);
  Vue.use(VmpContainerRightWap);
  Vue.use(VmpNoticeWap);
}
