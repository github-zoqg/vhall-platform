import Vue from 'vue';
// 瀑布流
// 组件库组件
import VmpContainer from '@/packages/container';
import VmpAirContainer from '@/packages/air-container';
import VmpAsideMenu from '@/packages/aside-menu';
import VmpIconText from '@/packages/icon-text';
import VmpLanguageChoice from '@/packages/language-choice';
import VmpHeaderLeft from '@/packages/header-left';
import VmpHeaderRight from '@/packages/header-right';
import VmpPcPlayer from '@/packages/player/pc-player';
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
import VmpInsertVideoList from '@/packages/insert-video-list';
import VmpInsertStream from '@/packages/insert-video-stream';
import VmpBasicCenterContainerLive from '@/packages/basic-center-container-live';
import VmpPcMediaSetting from '@/packages/media-setting';
import VmpGroupDiscussion from '@/packages/group-discussion';
import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue';
import VmpTabMenu from '@/packages/tab-menu';
import VmpCustomMenu from '@/packages/custom-menu';
import VmpNoticeList from '@/packages/notice'; // 公告列表
import VmpLiveTimerSet from '@/packages/live-timer-set';
import VmpLiveTimer from '@/packages/live-timer';
import VmpRebroadcastList from '@/packages/rebroadcast-list';
import VmpRebroadCastStream from '@/packages/rebroadcast-stream';
import VmpRecommend from '@/packages/recommend';
import VmpLotteryLive from '@/packages/lottery/live';
import VmpQuestionnaire from '@/packages/questionnaire';
import VmpExam from '@/packages/exam'; // 快问快答
import VmpExamPreview from '@/packages/exam-preview'; // 快问快答-预览
import VmpSignLive from '@/packages/sign-module/sign-live';
import VmpQa from '@/packages/qa';
import VmpRedPacketLive from '@/packages/red-packet-live';
import VmpStreamDesktopScreen from '@/packages/stream-desktop-screen';
import VmpRecordVideoSuccess from '@/packages/record-video-success';
import VmpPcRewardEffect from '@/packages/pc-reward-effect';
// 分屏页面
import VmpSplitScreen from '@/packages/split-screen';
// 视频轮询
import VmpVideoPolling from '@/packages/video-polling';
// 视频轮巡设置弹窗
import VmpPollingSetting from '@/packages/video-polling-setting';
// 视频轮询流订阅
import VmpStreamPollingRemote from '@/packages/stream-polling-remote';
// 客户端嵌入页
// import VmpEmbedClient from '@/packages/embed-client-live';
// 邀请上麦
import VmpMicInvited from '@/packages/mic-invited/index';
// 云导播播放器&本地流推送组件
import VmpPcPlayerLiveYun from '@/packages/pc-player-live-yun';
// 隐私合规文案
import VmpPrivacyCompliance from '@/packages/privacy-compliance';
// 瀑布流组件
// 全局注册组件
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
Vue.use(VmpInsertVideoList);
Vue.use(VmpInsertStream);
Vue.use(VmpBasicCenterContainerLive);
// Vue.use(VmpGroupSetting);
Vue.use(VmpTabMenu);
Vue.use(VmpCustomMenu);
Vue.use(VmpPcMediaSetting);
Vue.use(VmpGroupDiscussion);
Vue.use(VmpNoticeList);
Vue.use(VmpLiveTimerSet);
Vue.use(VmpLiveTimer);
Vue.use(VmpRebroadcastList);
Vue.use(VmpRebroadCastStream);
Vue.use(VmpRecommend);
Vue.use(VmpLotteryLive);
Vue.use(VmpQuestionnaire);
Vue.use(VmpExam);
Vue.use(VmpExamPreview);
Vue.use(VmpSignLive);
Vue.use(VmpQa);
Vue.use(VmpRecordVideoSuccess);
Vue.use(VmpRedPacketLive);
Vue.use(VmpPcRewardEffect);
Vue.use(VmpSplitScreen);
Vue.use(VmpVideoPolling);
Vue.use(VmpPollingSetting);
Vue.use(VmpStreamPollingRemote);

//初始化滚动插件，也可以考虑局部引用，这个可能会有其他组件使用
Vue.use(OverlayScrollbarsPlugin);
Vue.use(VmpStreamDesktopScreen);

// Vue.use(VmpEmbedClient);
Vue.use(VmpMicInvited);
Vue.use(VmpPcPlayerLiveYun);
Vue.use(VmpPrivacyCompliance);
