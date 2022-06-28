import Vue from 'vue';
// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpHeaderWatchWap from '@/packages/header-watch-wap'; //头部box
import VmpWapPlayer from '@/packages/player/wap-player';
import VmpDocWap from '@/packages/doc-wap';
import VmpWapStreamList from '@/packages/wap-stream-list';
import VmpWapStreamLocal from '@/packages/wap-stream-local';
import VmpWapStreamRemote from '@/packages/wap-stream-remote';
import VmpRegLoginWap from '@/packages/reg-login-wap';
//观看端成员列表
import VmpMemberList from '@/packages/member-list';
//观看端私聊
import VmpWapPrivateChat from '@/packages/wap-private-chat';
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
import VmpGoodsDetail from '@/packages/wap-goods-detail';

import 'overlayscrollbars/css/OverlayScrollbars.css';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';

//wap互动工具box
import VmpInteractToolsWap from '@/packages/interact-tools-wap';
// wap互动工具-签到
import VmpSignWap from '@/packages/interact-sign-wap';

// 二维码弹框
import VmpWapQrCode from '@/packages/official-module/official-wap';

// 用来判断显示播放器还是流
import VmpWapBody from '@/packages/wap-body';

import VmpWapBodyCenter from '@/packages/wap-body-center';

// 开屏页
import VmpScreenPostWap from '@/packages/screen-post-wap';
// 个人中心
import VmpUserCenterWap from '@/packages/user-center-wap';
// 个人资料
import VmpUserAccountWap from '@/packages/user-account-wap';
// 提现管理
import VmpCashWap from '@/packages/cash-wap';
// wap 抽奖
import VmpLotteryWap from '@/packages/lottery-wap';

// 送礼物飘屏动画
import VmpWapRewardEffect from '@/packages/wap-reward-effect';
// 送礼物飘屏动画svga
import VmpWapRewardEffectFullScreen from '@/packages/wap-reward-effect-full-screen';

// 章节
import VmpChapterWap from '@/packages/watch-chapter-wap';
//问答
import VmpQaWap from '@/packages/qa-wap/index.js';
// 问卷
import VmpQuestionnaireWap from '@/packages/questionnaire-wap';
// 报名表单
import VmpWapSignUpForm from '@/packages/wap-sign-up-form';

// 预约页面
import VmpSubscribeBody from '@/packages/wap-subscribe-body';
// 红包
import VmpRedPacketWap from '@/packages/red-packet-wap/index';

import VmpWapDesktopScreen from '@/packages/stream-desktop-screen-wap';

import VmpWapInsertFIle from '@/packages/stream-insert-file-wap';

// 被邀请上麦的弹窗
import VmpInviteHandup from '@/packages/inviteHandup';
// 观看协议
import VmpViewRestrictionWap from '@/packages/view-restriction-wap';

// 全局注册组件
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
Vue.use(VmpWapPrivateChat);
Vue.use(VmpSignUpForm);
Vue.use(VmpTabMenuWap);
Vue.use(VmpIntroWap);
Vue.use(VmpWapTimer);
Vue.use(VmpContainerRightWap);
Vue.use(VmpNoticeWap);
Vue.use(VmpRecommendWap);
Vue.use(VmpGoodListWap);
Vue.use(VmpGoodsDetail);
Vue.use(VmpWapQrCode);
Vue.use(OverlayScrollbarsPlugin);
Vue.use(VmpInteractToolsWap);
Vue.use(VmpChatWap);
Vue.use(VmpCustomMenuWap);
Vue.use(VmpSignWap);
Vue.use(VmpMemberListWap);
Vue.use(VmpWapBody);
Vue.use(VmpWapBodyCenter);
Vue.use(VmpWapRewardEffect);
Vue.use(VmpWapRewardEffectFullScreen);
Vue.use(VmpScreenPostWap);
Vue.use(VmpUserCenterWap);
Vue.use(VmpUserAccountWap);
Vue.use(VmpCashWap);
Vue.use(VmpLotteryWap);
Vue.use(VmpChapterWap);
Vue.use(VmpQaWap);
Vue.use(VmpQuestionnaireWap);
Vue.use(VmpRedPacketWap);
Vue.use(VmpSubscribeBody);
Vue.use(VmpWapSignUpForm);
Vue.use(VmpWapDesktopScreen);
Vue.use(VmpWapInsertFIle);
Vue.use(VmpInviteHandup);
Vue.use(VmpViewRestrictionWap);
