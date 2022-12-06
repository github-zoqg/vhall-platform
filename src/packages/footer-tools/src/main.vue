<template>
  <div class="vmp-footer-tools">
    <div class="vmp-footer-tools__left">
      <div
        class="vmp-footer-tools__left-setting"
        v-if="isInteractLive || (isVideoLive && isVideoPolling && isLiving)"
        @click="settingShow()"
      >
        <i class="vh-iconfont vh-line-setting"></i>
        {{ $t('account.account_1005') }}
      </div>
      <div
        class="vmp-footer-tools__left-online"
        v-if="roomBaseState.watchInitData.online.show && !isInGroup"
      >
        <i class="vh-iconfont vh-line-user"></i>
        {{ onlineNumTxt | formatHotNum }}
      </div>
      <div
        class="vmp-footer-tools__left-hot"
        v-if="roomBaseState.watchInitData.pv.show && !isInGroup"
      >
        <i class="vh-saas-iconfont vh-saas-line-heat"></i>
        {{ hotNumTxt | formatHotNum }}
      </div>
      <div
        class="vmp-footer-tools__left-language"
        v-if="isEmbed && languageList.length > 1 && !isInGroup"
      >
        <el-dropdown @command="changeLang" trigger="click" placement="bottom">
          <span class="language__icon">
            <i class="vh-saas-iconfont vh-saas-line-multilingual"></i>
            {{ lang.label }}
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :command="item.key"
              :key="index"
              :class="{ active: item.key == lang.key }"
              v-for="(item, index) in languageList"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- 上下麦按钮 -->
    <div class="vmp-footer-tools__center" v-if="!hideItem">
      <handup class=""></handup>
    </div>
    <!-- 互动工具 -->
    <ul v-if="!isTrySee && !isInGroup && vodType != 'shikan'" class="vmp-footer-tools__right">
      <li v-if="isLiving">
        <!-- 公告 直播显示公告 -->
        <notice ref="notice"></notice>
      </li>
      <li v-if="isLiving">
        <!-- 计时器 -->
        <div v-if="openTimer" class="pr">
          <i v-if="showTimer" class="circle"></i>
          <div class="vmp-timer-icon">
            <img src="./img/timer.png" alt="" @click="openTimerHandle" class="show_img" />
          </div>
        </div>
        <vmp-air-container :cuid="childrenCom[1]" :oneself="true"></vmp-air-container>
      </li>
      <li>
        <!-- 快问快答-->
        <exam-icon @clickIcon="checkExamIcon" />
        <vmp-air-container :cuid="childrenCom[5]" :oneself="true"></vmp-air-container>
        <vmp-air-container :cuid="childrenCom[6]" :oneself="true"></vmp-air-container>
        <vmp-air-container :cuid="childrenCom[7]" :oneself="true"></vmp-air-container>
      </li>
      <li>
        <!-- 问卷-->
        <questionnaire-icon @clickIcon="checkQuestionIcon" />
        <vmp-air-container :cuid="childrenCom[2]" :oneself="true"></vmp-air-container>
      </li>
      <li v-if="isLiving">
        <!-- 签到 -->
        <vmp-air-container :cuid="childrenCom[0]" :oneself="true"></vmp-air-container>
      </li>
      <li v-if="isLiving || isEnding">
        <!-- 抽奖 -->
        <lottery-icon @clickIcon="checkLotteryIcon" @takeAward="takeAward" />
        <vmp-air-container :cuid="childrenCom[3]" :oneself="true"></vmp-air-container>
      </li>
      <li v-if="!isEmbed && isLiving">
        <red-packet-icon @clickIcon="checkredPacketIcon" />
        <vmp-air-container :cuid="childrenCom[4]" :oneself="true"></vmp-air-container>
        <!-- 红包 -->
      </li>
      <!-- TODO:支付牌照问题 -->
      <li v-if="showGiftIcon && roomBaseState.configList['ui.hide_gifts'] == '0'">
        <!-- 礼物 -->
        <div class="vh-gifts-wrap">
          <img
            src="./img/iconGifts@2x.png"
            @click.stop="throttleHandleShowGift"
            alt=""
            class="show_img"
          />
          <!-- showCount展示次数，只有第一次点击礼物图标的时候才会调接口 -->
          <vh-gifts
            v-show="showGift && roomBaseState.watchInitData.interact.room_id"
            :roomId="roomBaseState.watchInitData.interact.room_id"
            :show-gift-count="showGiftCount"
            @changeShowGift="changeStatus"
            @acceptPay="acceptPay"
            @needLogin="needLogin"
          />
        </div>
      </li>
      <!-- TODO:支付牌照问题 -->
      <!-- 打赏 -->
      <!-- <li v-if="roomBaseState.configList['ui.hide_reward'] == '0' && !isEmbed">
        <div class="vh-icon-box">
          <div class="vmp-reward-icon">
            <img src="./img/reward-icon.png" alt="" @click="onClickReward" class="show_img" />
          </div>
          <reward ref="reward" />
        </div>
      </li> -->
      <li v-if="roomBaseState.configList['ui.watch_hide_like'] == '0'">
        <!-- 点赞 -->
        <praise></praise>
      </li>
      <!-- 支付弹框 -->
      <li v-if="showPay">
        <Pay
          :wxQr="wxQr"
          :zfQr="zfQr"
          @changeShow="changeStatus"
          :style="{ zIndex: zIndexServerState.zIndexMap.giftPay }"
        ></Pay>
      </li>
    </ul>
    <el-dialog
      :title="$t('account.account_1061')"
      :visible.sync="pollingVisible"
      :close-on-click-modal="true"
      :modal-append-to-body="true"
      custom-class="polling-dialog"
      @closed="closePollingDialog"
      width="400px"
    >
      <div class="polling-dialog_warp">
        <i18n path="interact.interact_1038">
          <span place="n" class="polling-dialog_color" @click="settingPollingShow">
            {{ $t('account.account_1005') }}
          </span>
        </i18n>
        <div class="polling-dialog_btn">
          <el-button type="primary" round @click="pollingVisible = false">
            {{ $t('other.other_1015') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import {
    useRoomBaseServer,
    useZIndexServer,
    useMicServer,
    useChatServer,
    useGroupServer,
    useMediaCheckServer,
    useVideoPollingServer
  } from 'middle-domain';
  import handup from './component/handup/index.vue';
  import vhGifts from './component/gifts/index.vue';
  import notice from './component/notice/index.vue';
  import praise from './component/praise/index.vue';
  import Pay from './component/pay/index.vue';
  import RedPacketIcon from './component/red-packet-icon/index.vue';
  import QuestionnaireIcon from './component/questionnaire-icon/index.vue';
  import ExamIcon from './component/exam-icon/index.vue';
  import LotteryIcon from './component/lottery-icon/index.vue';
  import { throttle } from 'lodash';
  import alternateStylesheet from 'caniuse-lite/data/features/alternate-stylesheet';
  export default {
    name: 'VmpFooterTools',
    components: {
      handup,
      // reward,
      vhGifts,
      notice,
      praise,
      Pay,
      RedPacketIcon,
      QuestionnaireIcon,
      ExamIcon,
      LotteryIcon
    },
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        roomBaseState: null,
        showGiftIcon: true,
        showGift: false,
        showGiftCount: 0,
        openTimer: false,
        showTimer: false,
        groupInitData: {},
        showPay: false,
        pollingVisible: false,
        zfQr: '',
        wxQr: '',
        lang: {},
        languageList: [],
        onlineNumTxt: 0,
        hotNumTxt: 0
      };
    },
    watch: {
      isInGroup(val) {
        if (val) {
          this.roomBaseServer.state.timerInfo = {};
        }
      },
      onlineNum(val) {
        this.updateOnlineNum(val);
      },
      hotNum(val) {
        this.updateHotNum(val);
      }
    },
    computed: {
      // 是否已上麦
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      },
      isInteractLive() {
        const { watchInitData } = this.roomBaseState;
        return (
          (watchInitData.webinar.mode == 3 || watchInitData.webinar.mode == 6) &&
          watchInitData.webinar.type == 1
        );
      },
      // 是否是视频直播
      isVideoLive() {
        const { watchInitData } = this.roomBaseState;
        return watchInitData.webinar.mode == 2;
      },
      // 是否开启视频轮巡
      isVideoPolling() {
        return this.roomBaseServer.state.configList['video_polling'] == 1;
      },
      // 是否开启视频轮巡
      hasVideoPollingStart() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus?.video_polling == 1;
      },
      // 是否正在直播
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      // 是否结束直播
      isEnding() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 3;
      },
      isTrySee() {
        const { watchInitData } = this.roomBaseState;
        return (
          watchInitData.status == 'subscribe' &&
          watchInitData.preview_paas_record_id &&
          watchInitData.is_subscribe == 0
        );
      },
      isInGroup() {
        return this.groupServer.state.groupInitData.isInGroup;
      },
      hotNum() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvHot) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualHot) +
          1
        );
      },
      onlineNum() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvOnline) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualOnline)
        );
      },
      isEmbed() {
        // 是不是嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      device_status() {
        // 设备状态  0未检测 1可以上麦 2不可以上麦
        return this.$domainStore.state.mediaCheckServer.deviceInfo.device_status;
      },
      isBanned() {
        return !this.isInGroup && (useChatServer().state.banned || useChatServer().state.allBanned); //true禁言，false未禁言
      },
      // 隐藏部分文案及选项(安利定制)
      hideItem() {
        return this.roomBaseServer.state.configList['watch_embed_close_entrance'] && this.isEmbed;
      },
      // 是否是试看
      vodType() {
        const { webinar, status } = this.roomBaseServer.state.watchInitData;
        if (status !== 'live' && (webinar.type === 5 || webinar.type === 4)) {
          return 'shikan';
        } else {
          return '';
        }
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.videoPollingServer = useVideoPollingServer();
    },
    created() {
      this.onlineNumTxt = this.onlineNum;
      this.hotNumTxt = this.hotNum;
      this.childrenCom = window.$serverConfig[this.cuid].children;
      this.roomBaseState = this.roomBaseServer.state;
      if (this.isEmbed) {
        this.languageList = this.roomBaseState.languages.langList;
        this.lang = this.roomBaseServer.state.languages.lang;
      }
      this.groupState = this.groupServer.state;
      window.addEventListener('click', () => {
        if (this.showGift) {
          this.showGift = false;
        }
      });
      if (this.isSpeakOn && useChatServer().state.allBanned) {
        useMicServer().speakOff();
      }
      const liveMode = this.roomBaseServer.state.watchInitData.webinar.mode;
      // 视频、直播支持视频轮巡
      if (this.isVideoPolling && [2, 3].includes(liveMode)) {
        this.videoPollingServer._addListeners();
      }
      this.throttleHandleShowGift = throttle(this.handleShowGift, 500, { trailing: false });
    },
    mounted() {
      const roomId = this.roomBaseServer.state.watchInitData.webinar.id;
      this.videoPollingServer.$on('VIDEO_POLLING_START', () => {
        this.pollingVisible = true;
        useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: false });
        sessionStorage.setItem(`hasVideoPollingStart_${roomId}`, 1);
      });
      if (sessionStorage.getItem(`hasVideoPollingStart_${roomId}`) == 1) return;
      if (this.hasVideoPollingStart) {
        this.pollingVisible = true;
        useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: false });
        sessionStorage.setItem(`hasVideoPollingStart_${roomId}`, 1);
      }
    },
    methods: {
      updateOnlineNum: throttle(function (val) {
        this.onlineNumTxt = val;
      }, 500),
      updateHotNum: throttle(function (val) {
        this.hotNumTxt = val;
      }, 500),
      closePollingDialog() {
        sessionStorage.setItem(
          `pollingAgreeStatus_${this.roomBaseServer.state.watchInitData.webinar.id}`,
          1
        );
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClosePollingDialog'));
      },
      settingShow() {
        if (this.isInteractLive) {
          // 互动直播
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickMediaSetting'));
        } else {
          // 视频直播
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickCameraCheck'));
        }
      },
      // 开启视频轮训，设置弹窗
      settingPollingShow() {
        this.pollingVisible = false;
        if (this.isInteractLive) {
          // 互动直播
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickMediaSetting'));
        } else {
          // 视频直播
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickCameraCheck'));
        }
      },
      changeStatus(data, status) {
        console.log(data, status, 'data, status');
        this[data] = status;
      },
      // 打开计时器弹框
      openTimerHandle() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimer'));
        this.changeStatus('showTimer', false);
      },
      // 打开礼物弹框
      handleShowGift() {
        this.showGift = !this.showGift;
        if (this.showGift) {
          this.showGiftCount++;
        }
        // TODO:是否需要处理
        this.$refs.notice && this.$refs.notice.closeNoticeList();
      },
      // 打开打赏弹框
      onClickReward() {
        // 需校验是否登陆
        if (this.roomBaseState.watchInitData.join_info.user_id == 0) {
          this.needLogin();
          // window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitNeedLogin'));
          return false;
        }
        this.$refs.reward.onClickReward();
      },
      // 接收支付码
      acceptPay(data, url) {
        // 修改付费礼物支付弹窗层级
        this.zIndexServer.setDialogZIndex('giftPay');
        this.showPay = true;
        this[data] = url;
      },
      // 切换语言
      changeLang(key) {
        localStorage.setItem('lang', key);
        const params = this.$route.query;
        // 如果地址栏中有语言类型，当切换语言时，对应的地址栏参数要改变
        if (params.lang) {
          params.lang = key;
          let sourceUrl =
            window.location.origin + process.env.VUE_APP_ROUTER_BASE_URL + this.$route.path;
          let queryKeys = '';
          for (const k in params) {
            queryKeys += k + '=' + params[k] + '&';
          }
          queryKeys = queryKeys.substring(0, queryKeys.length - 1);
          sourceUrl = sourceUrl + '?' + queryKeys;
          window.location.href = sourceUrl;
        } else {
          window.location.reload();
        }
      },
      needLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitNeedLogin'));
      },
      checkLotteryIcon() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLotteryIcon'));
      },
      takeAward(lottery) {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitTakeAward', [lottery]));
      },
      checkredPacketIcon(redPacketId) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickRedPacketIcon', [redPacketId])
        );
      },
      checkQuestionIcon(questionnaireId) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickQuestionIcon', [questionnaireId])
        );
      },
      checkExamIcon(vo) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickExamIcon', [vo.examId, vo.type, vo.source])
        );
      }
    }
  };
</script>
<style lang="less">
  .vmp-footer-tools {
    flex-shrink: 0;
    height: 56px;
    background: var(--chat-background-color-base);
    line-height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    position: relative;
    // z-index: 10;

    &__left {
      display: flex;
      align-items: center;
      color: var(--chat-font-color-msg-nickname);
      font-size: 14px;
      > div {
        margin-right: 16px;
        .iconfont {
          vertical-align: bottom;
        }
      }
      &-setting {
        cursor: pointer;
      }
      &-language {
        .language__icon {
          color: #ccc;
          cursor: pointer;
        }
      }
    }
    &__right {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-left: 16px;
      }
      li {
        line-height: initial; // 防止继承外部属性值
      }
      li > div > img {
        width: 32px;
        height: 32px;
        margin-left: 16px;
        border-radius: 16px;
        cursor: pointer;
      }
      .vh-gifts-wrap {
        border-radius: 16px;
        position: relative;
        width: 32px;
        height: 32px;
        line-height: 32px;
        background: linear-gradient(180deg, #fca810 0%, #fe7d00 100%);
        border-radius: 16px;
        cursor: pointer;
        margin-left: 16px;
        img.show_img {
          width: 32px;
          height: 32px;
          -webkit-transform-origin: left center;
          transform-origin: left center;
          margin: -1px 0 0 0;
        }
      }
    }
    &__center {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .circle {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      // top: 10px;
      right: 0px;
      position: absolute;
    }
    .pr {
      position: relative;
    }
    .polling-dialog {
      .el-dialog__header {
        padding: 24px;
      }
      line-height: 22px;
      &_color {
        color: #3562fa;
      }
      &_btn {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
        .el-button.is-round {
          padding: 7px 28px;
        }
      }
    }
  }
  .vmp-reward-icon {
    width: 32px;
    height: 32px;
    line-height: 32px;
    background: linear-gradient(180deg, #ff9d30 0%, #ff9e31 100%);
    border-radius: 16px;
    cursor: pointer;
    margin-left: 16px;
    img.show_img {
      width: 32px;
      height: 32px;
      -webkit-transform-origin: left center;
      transform-origin: left center;
      margin: -1px 0 0 0;
    }
  }
  .vmp-timer-icon {
    width: 32px;
    height: 32px;
    line-height: 32px;
    background: linear-gradient(180deg, #5464f7 0%, #848cfe 100%);
    border-radius: 16px;
    cursor: pointer;
    margin-left: 16px;
    img.show_img {
      width: 32px;
      height: 32px;
      -webkit-transform-origin: left center;
      transform-origin: left center;
      margin: -3px 0 0 0;
    }
  }
</style>
