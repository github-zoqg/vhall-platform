<template>
  <div class="vmp-footer-tools" v-if="!isEmbedVideo">
    <div class="vmp-footer-tools__left">
      <div class="vmp-footer-tools__left-setting" v-if="isInteractLive" @click="settingShow">
        <i class="vh-iconfont vh-line-setting"></i>
        设置
      </div>
      <div class="vmp-footer-tools__left-online" v-if="roomBaseState.watchInitData.online.show">
        <i class="vh-iconfont vh-line-user"></i>
        {{ onlineNum | formatHotNum }}
      </div>
      <div class="vmp-footer-tools__leftt-hot" v-if="roomBaseState.watchInitData.pv.show">
        <i class="vh-saas-iconfont vh-saas-line-heat"></i>
        {{ hotNum | formatHotNum }}
      </div>
      <div class="vmp-footer-tools__left-language" v-if="isEmbed">
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
    <!-- <div class="vmp-footer-tools__right">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </div> -->
    <!-- 上下麦按钮 -->
    <div class="vmp-footer-tools__center" v-if="!isBanned && isInteractLive">
      <handup></handup>
    </div>
    <!-- 用户被邀请dialog -->
    <get-invited :roomBaseState="roomBaseState"></get-invited>
    <!-- 互动工具 -->
    <ul v-if="!isTrySee && !groupState.groupInitData.isInGroup" class="vmp-footer-tools__right">
      <li v-if="isLiving">
        <!-- 公告 -->
        <notice></notice>
      </li>
      <li>
        <!-- 问卷-->
      </li>
      <li>
        <!-- 签到 -->
        <vmp-air-container :cuid="childrenCom[0]" :oneself="true"></vmp-air-container>
      </li>
      <li v-if="isLiving">
        <!-- 抽奖 -->
        <lottery-icon @clickIcon="checkLotteryIcon" />
      </li>
      <li>
        <red-packet-icon />
        <!-- 红包 -->
      </li>
      <li v-if="1">
        <!-- 计时器 -->
        <div v-if="openTimer" class="pr">
          <i v-if="showTimer" class="circle"></i>
          <img src="./img/timer.png" alt="" @click="openTimerHandle" />
        </div>
        <vmp-air-container :cuid="childrenCom[1]" :oneself="true"></vmp-air-container>
      </li>
      <li v-if="showGiftIcon">
        <!-- 礼物 -->
        <div class="vh-gifts-wrap">
          <img src="./img/iconGifts@2x.png" @click.stop="handleShowGift" />
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
      <li v-if="roomBaseState.configList['ui.hide_reward'] === '0'">
        <!-- 打赏 -->
        <div class="vh-icon-box">
          <img src="./img/reward-icon.png" alt="" @click="onClickReward" />
          <reward ref="reward" />
        </div>
      </li>
      <li v-if="roomBaseState.configList['ui.watch_hide_like'] == '0'">
        <!-- 点赞 -->
        <praise></praise>
      </li>
      <!-- 支付弹框 -->
      <li v-if="showPay">
        <Pay :wxQr="wxQr" :zfQr="zfQr" @changeShow="changeStatus"></Pay>
      </li>
    </ul>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import {
    useRoomBaseServer,
    useMsgServer,
    useMicServer,
    useChatServer,
    useGroupServer
  } from 'middle-domain';
  import handup from './handup.vue';
  import reward from './component/reward/index.vue';
  import vhGifts from './component/gifts/index.vue';
  import notice from './component/notice/index.vue';
  import praise from './component/praise/index.vue';
  import getInvited from './component/getInvited/index.vue';
  import Pay from './component/pay/index.vue';
  import RedPacketIcon from './component/red-packet-icon/index.vue';
  import LotteryIcon from './component/lottery-icon/index.vue';
  const langMap = {
    1: {
      label: '简体中文',
      type: 'zh',
      key: 1
    },
    2: {
      label: 'English',
      type: 'en',
      key: 2
    }
  };
  export default {
    name: 'VmpFooterTools',
    components: {
      handup,
      reward,
      vhGifts,
      notice,
      praise,
      getInvited,
      Pay,
      RedPacketIcon,
      LotteryIcon
    },
    data() {
      return {
        roomBaseState: null,
        showGiftIcon: true,
        showGift: false,
        showGiftCount: 0,
        openTimer: false,
        showTimer: false,
        groupInitData: {},
        showPay: false,
        zfQr: '',
        wxQr: '',
        isBanned: useChatServer().state.banned || useChatServer().state.allBanned, //true禁言，false未禁言
        lang: {},
        languageList: []
      };
    },
    filters: {
      formatHotNum(value) {
        value = parseInt(value);
        let unit = '';
        const k = 99999;
        const sizes = ['', '万', '亿', '万亿'];
        let i;
        if (value > k) {
          i = Math.floor(Math.log(value) / Math.log(k));
          value = (value / Math.pow(k / 10, i)).toFixed(1);
          unit = sizes[i];
        }
        return value + unit;
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
      // 是否正在直播
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
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
      isEmbedVideo() {
        // 是不是音视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      this.roomBaseState = this.roomBaseServer.state;
      if (this.isEmbed) {
        this.languageList = this.roomBaseState.languages.langList.map(item => {
          return langMap[item.language_type];
        });
        console.log(this.languageList, '??!32142435');
        const curLang = this.roomBaseState.languages.curLang;
        this.lang =
          langMap[sessionStorage.getItem('lang')] ||
          langMap[this.$route.query.lang] ||
          langMap[curLang.language_type];
        this.$i18n.locale = this.lang.type;
        sessionStorage.setItem('lang', this.lang.type);
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
    },
    mounted() {
      //监听禁言通知
      useChatServer().$on('banned', res => {
        this.isBanned = res;
      });
      //监听全体禁言通知
      useChatServer().$on('allBanned', res => {
        this.isBanned = res;
        if (this.isSpeakOn) {
          useMicServer().speakOff();
        }
      });
      //监听直播结束的通知，下麦并停止推流
      useMsgServer().$on('live_over', e => {
        if (this.isSpeakOn) {
          useMicServer().speakOff();
        }
      });
    },
    methods: {
      settingShow() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickMediaSetting'));
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
        this.$refs.notice && (this.$refs.notice.isShowNotice = false);
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
        this.showPay = true;
        this[data] = url;
      },
      changeLang(key) {
        sessionStorage.setItem('lang', key);
        window.location.reload();
      },
      needLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitNeedLogin'));
      },
      checkLotteryIcon() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLotteryIcon'));
      }
    }
  };
</script>
<style lang="less">
  .vmp-footer-tools {
    height: 56px;
    background: @bg-dark-section;
    line-height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    position: relative;
    z-index: 10;

    &__left {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
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
      top: 10px;
      right: 0px;
      position: absolute;
    }
    .pr {
      position: relative;
    }
  }
</style>
