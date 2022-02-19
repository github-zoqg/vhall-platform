import Vue from 'vue';

// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpHeaderWatchWap from '@/packages/header-watch-wap'; //头部box
import VmpWapPlayer from '@/packages/wap-player';
import VmpStreamList from '@/packages/stream-list';
import VmpStreamLocal from '@/packages/stream-local';
import VmpStreamRemote from '@/packages/stream-remote';
import VmpRegLoginWap from '@/packages/reg-login-wap';
//观看端成员列表
import VmpMemberList from '@/packages/member-list';
//观看端私聊
import VmpWatchPrivateChat from '@/packages/watch-private-chat';
//观看端报名表单
import VmpSignUpForm from '@/packages/sign-up-form';
import VmpTabMenuWap from '@/packages/tab-menu-wap';
import VmpIntroWap from '@/packages/intro-wap';
//wap互动工具计时器弹窗
import VmpWapTimer from '@/packages/wap-timer';
//wap互动工具box
import VmpContainerRightWap from '@/packages/basic-right-container-wap';
//wap公告
import VmpNoticeWap from '@/packages/notice-watch-wap';
import VmpRecommendWap from '@/packages/recommend-wap';
import VmpMemberListWap from '@/packages/member-list-wap';

// 自定义菜单
import VmpCustomMenuWap from '@/packages/custom-menu-wap';

// 商品列表
import VmpGoodListWap from '@/packages/good-wap';
import VmpChatWap from '@/packages/chat-wap';
//wap互动工具box
import VmpInteractToolsWap from '@/packages/interact-tools-wap';
// wap互动工具-签到
import VmpSignWap from '@/packages/interact-sign-wap';

// 二维码弹框
import VmpWapQrCode from '@/packages/qrcode-wap';

// Wap互动推流组件
import VmpWapStreamLocal from '@/packages/wap-stream-local';
// wap 抽奖
import VmpLotteryWap from '@/packages/lottery-wap';

// 全局注册组件
export function initUse() {
  Vue.use(VmpContainer);
  Vue.use(VmpAirContainer);
  Vue.use(VmpHeaderWatchWap);
  Vue.use(VmpWapPlayer);
  Vue.use(VmpStreamList);
  Vue.use(VmpStreamLocal);
  Vue.use(VmpStreamRemote);
  Vue.use(VmpRegLoginWap);
  Vue.use(VmpMemberList);
  Vue.use(VmpWatchPrivateChat);
  Vue.use(VmpSignUpForm);
  Vue.use(VmpTabMenuWap);
  Vue.use(VmpIntroWap);
  Vue.use(VmpWapTimer);
  Vue.use(VmpContainerRightWap);
  Vue.use(VmpNoticeWap);
  Vue.use(VmpRecommendWap);
  Vue.use(VmpGoodListWap);
  Vue.use(VmpWapQrCode);
  Vue.use(VmpInteractToolsWap);
  Vue.use(VmpChatWap);
  Vue.use(VmpCustomMenuWap);
  Vue.use(VmpSignWap);
  Vue.use(VmpMemberListWap);
  Vue.use(VmpWapStreamLocal);
  Vue.use(VmpLotteryWap);
}
