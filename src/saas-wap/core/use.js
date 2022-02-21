import Vue from 'vue';

// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpHeaderWatchWap from '@/packages/header-watch-wap'; //头部box
import VmpWapPlayer from '@/packages/wap-player';
import VmpDocWap from '@/packages/doc-wap';
import VmpWapStreamList from '@/packages/wap-stream-list';
import VmpWapStreamLocal from '@/packages/wap-stream-local';
import VmpWapStreamRemote from '@/packages/wap-stream-remote';
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

// 用来判断显示播放器还是流
import VmpWapBody from '@/packages/wap-body';
// 开屏页
import VmpScreenPostWap from '@/packages/screen-post-wap';
// 打开 个人中心
import VmpUserCenterWap from '@/packages/user-center-wap';
// wap 抽奖
import VmpLotteryWap from '@/packages/lottery-wap';

// 送礼物飘屏动画
import VmpWapRewardEffect from '@/packages/wap-reward-effect';

// 全局注册组件
export function initUse() {
  Vue.use(VmpContainer);
  Vue.use(VmpAirContainer);
  Vue.use(VmpHeaderWatchWap);
  Vue.use(VmpWapPlayer);
  Vue.use(VmpDocWap);
  Vue.use(VmpWapStreamList);
  Vue.use(VmpWapStreamLocal);
  Vue.use(VmpWapStreamRemote);
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
  Vue.use(VmpWapBody);
  Vue.use(VmpWapRewardEffect);
  Vue.use(VmpScreenPostWap);
  Vue.use(VmpUserCenterWap);
  Vue.use(VmpLotteryWap);
}
