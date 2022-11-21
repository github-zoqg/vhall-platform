import Vue from 'vue';

//字体图标样式
// import '../assets/icon-font/iconfont.css';
// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpWatchAsideMenu from '@/packages/watch-aside-menu';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import VmpHeaderWatch from '@/packages/header-watch-pc';
import VmpPcPlayer from '@/packages/player/pc-player';
import VmpChat from '@/packages/chat';
import VmpDocUne from '@/packages/doc-une';
import VmpDocDlglist from '@/packages/doc-dlglist';
import VmpStreamList from '@/packages/stream-list';
import VmpStreamLocal from '@/packages/stream-local';
import VmpStreamRemote from '@/packages/stream-remote';
import VmpFooter from '@/packages/footer';
import VmpFooterTools from '@/packages/footer-tools';
import VmpRegLogin from '@/packages/reg-login';
import VmpNoticeColumn from '@/packages/notice-column'; //公告滚动显示
import VmpBasicRightContainer from '@/packages/basic-right-container';
import VmpBasicCenterContainer from '@/packages/basic-center-container';
import VmpBasicCenterMain from '@/packages/basic-center-main';
import VmpShare from '@/packages/share'; // 观看端分享
import VmpOfficialPc from '@/packages/official-module/official-pc'; //公众号弹窗
import VmpWatchAuth from '@/packages/watch-auth'; // 观看端公权限验证
import VmpPrivacyCompliance from '@/packages/privacy-compliance'; // 隐私合规
//观看端成员列表
import VmpMemberList from '@/packages/member-list';
//观看端私聊
import VmpWatchPrivateChat from '@/packages/watch-private-chat';
//观看端报名表单
import VmpSignUpForm from '@/packages/sign-up-form';
import VmpUserAccount from '@/packages/user-account'; // 个人资料
import VmpCash from '@/packages/cash'; // 提现
import VmpWatchNavMenu from '@/packages/watch-nav-menu'; // 观看端侧边栏
import VmpWatchTimer from '@/packages/watch-timer'; // 观看端计时器
import VmpChapter from '@/packages/watch-chapter-pc'; // 观看端章节
import VmpLotteryWatch from '@/packages/lottery/watch'; // 观看端计时器
import VmpPcRewardEffect from '@/packages/pc-reward-effect'; // 观看端计时器
import VmpPcRewardEffectFullScreen from '@/packages/pc-reward-effect-full-screen'; // 观看端计时器
import VmpTabMenu from '@/packages/tab-menu';
import VmpQa from '@/packages/qa';
import VmpCustomMenu from '@/packages/custom-menu';
import VmpRecommend from '@/packages/recommend';
import VmpPcMediaSetting from '@/packages/media-setting';
import VmpLivingEnd from '@/packages/living-end-pc';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
import VmpSignWatch from '@/packages/sign-module/sign-watch';
import VmpWatchPayFee from '@/packages/pay-fee-auth/';
import VmpQuestionnaireWatch from '@/packages/questionnaire/watch';
import VmpRedPacketCommandWatch from '@/packages/red-packet-command/watch';
import VmpStreamDesktopScreen from '@/packages/stream-desktop-screen';
import VmpInsertStream from '@/packages/insert-video-stream';

// 商品列表
import VmpGoodList from '@/packages/good';
// 商品详情
import VmpGoodDetailPc from '@/packages/pc-goods-detail';

// 开屏海报
import VmpScreenPost from '@/packages/screen-post';

import VmpIntro from '@/packages/intro';

// 预约页面配置
import VmpSubscribeBody from '@/packages/subscribe-body/index';

// 邀请上麦
import VmpMicInvited from '@/packages/mic-invited/index';
// 摄像头检测及设置
import VmpCameraCheck from '@/packages/camera-check/index';

import VmpViewRestriction from '@/packages/view-restriction/index';

// 专题预览页
import VmpSubjectBody from '@/packages/subject-body/index';
import VmpSubjectHeader from '@/packages/subject-header/index';

// 全局注册组件
// Vue.use(ElementUI);
Vue.use(VmpContainer);
Vue.use(VmpAirContainer);
Vue.use(VmpWatchAsideMenu);
Vue.use(VmpIconText);
Vue.use(VmpLanguageChoice);
Vue.use(VmpHeaderLeft);
Vue.use(VmpHeaderWatch);
Vue.use(VmpPcPlayer);
Vue.use(VmpChat);
Vue.use(VmpDocUne);
Vue.use(VmpDocDlglist);
Vue.use(VmpStreamList);
Vue.use(VmpStreamLocal);
Vue.use(VmpStreamRemote);
Vue.use(VmpFooter);
Vue.use(VmpFooterTools);
Vue.use(VmpRegLogin);
Vue.use(VmpNoticeColumn);
Vue.use(VmpBasicRightContainer);
Vue.use(VmpBasicCenterContainer);
Vue.use(VmpBasicCenterMain);
Vue.use(VmpShare);
Vue.use(VmpOfficialPc);
Vue.use(VmpWatchAuth);
Vue.use(VmpMemberList);
Vue.use(VmpWatchPrivateChat);
Vue.use(VmpSignUpForm);
Vue.use(VmpUserAccount);
Vue.use(VmpCash);
Vue.use(VmpWatchNavMenu);
Vue.use(VmpWatchTimer);
Vue.use(VmpGoodList);
Vue.use(VmpGoodDetailPc);
Vue.use(VmpLotteryWatch);
Vue.use(VmpChapter);
Vue.use(VmpScreenPost);
Vue.use(VmpPcRewardEffect);
Vue.use(VmpPcRewardEffectFullScreen);
Vue.use(VmpTabMenu);
Vue.use(VmpCustomMenu);
Vue.use(VmpRecommend);
Vue.use(VmpPcMediaSetting);
Vue.use(VmpIntro);
Vue.use(VmpLivingEnd);
Vue.use(VmpSignWatch);
Vue.use(VmpWatchPayFee);
Vue.use(VmpRedPacketCommandWatch);

Vue.use(VmpSubscribeBody);
Vue.use(VmpQa);
Vue.use(VmpQuestionnaireWatch);

// 专题
Vue.use(VmpSubjectBody);
Vue.use(VmpSubjectHeader);

//初始化滚动插件，也可以考虑局部引用，这个可能会有其他组件使用
Vue.use(OverlayScrollbarsPlugin);
Vue.use(VmpStreamDesktopScreen);
Vue.use(VmpInsertStream);
Vue.use(VmpMicInvited);
Vue.use(VmpCameraCheck);
Vue.use(VmpViewRestriction);
Vue.use(VmpPrivacyCompliance);
