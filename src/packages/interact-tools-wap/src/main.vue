<template>
  <div class="tools-box">
    <div class="icon-wrapper" v-if="!groupInitData.isInGroup">
      <!-- 上麦 -->
      <div
        v-if="device_status === 1 && !isBanned && (isAllowhandup || isSpeakOn) && !live_over"
        style="position: relative"
        auth="{ 'ui.hide_reward': 0 }"
      >
        <i
          v-if="!handUpStatus"
          class="vh-saas-iconfont vh-saas-line-drag"
          @click="$refs.handup.openConnectPop()"
        ></i>
        <i
          v-else
          class="vh-saas-iconfont vh-saas-a-line-offthemicrophone"
          @click="$refs.handup.openConnectPop()"
        ></i>
        <span class="red-dot" v-if="handUpStatus"></span>
        <Handup
          ref="handup"
          @handupLoading="
            s => {
              handUpStatus = s;
            }
          "
        />
      </div>
      <div class="liwu" auth="{ 'ui.hide_gifts': 0 }" v-if="localRoomInfo.isShowGift">
        <i class="vh-saas-iconfont vh-saas-color-gift" @click="opneGifts"></i>
        <GiftCard
          ref="gifts"
          :isEmbed="localRoomInfo.isEmbed"
          :joinInfoInGift="joinInfoInGift"
          :roomId="localRoomInfo.room_id"
          :localRoomInfo="localRoomInfo"
          :cuid="cuid"
        />
      </div>
      <!-- 打赏 -->
      <div
        v-if="!localRoomInfo.isEmbed && localRoomInfo.isShowReward"
        auth="{ 'ui.hide_reward': 0 }"
      >
        <i class="vh-saas-iconfont vh-saas-a-color-redpacket" @click="openReward"></i>
        <RewardCard
          ref="reward"
          :webinarData="webinarData"
          :localRoomInfo="localRoomInfo"
          :cuid="cuid"
        />
      </div>
      <!-- 邀请卡 -->
      <div v-if="showInviteCard && !localRoomInfo.isEmbed">
        <a
          target="_blank"
          :href="`${location}/lives/invite/${this.$route.params.id}?invite_id=${localRoomInfo.saasJoinId}`"
        >
          <i class="vh-iconfont vh-line-share"></i>
        </a>
      </div>

      <!-- 点赞 -->
      <div auth="{ 'ui.watch_hide_like': 0 }" v-if="localRoomInfo.showLike">
        <!-- <i class="vh-saas-iconfont vh-saas-a-color-givealike"></i> -->
        <Parise :hideChatHistory="joinInfoInGift.hideChatHistory" :localRoomInfo="localRoomInfo" />
      </div>
    </div>
  </div>
</template>

<script>
  import {
    useRoomBaseServer,
    useMicServer,
    useChatServer,
    useGroupServer,
    useInteractiveServer,
    useMediaCheckServer
  } from 'middle-domain';
  import GiftCard from './component/GiftCard.vue';
  import RewardCard from './component/reward.vue';
  import Parise from './component/parise.vue';
  import Handup from './component/handup.vue';

  export default {
    name: 'VmpInteractToolsWap',
    components: { GiftCard, RewardCard, Parise, Handup },
    data() {
      let { configList } = useRoomBaseServer().state;
      let { groupInitData } = useGroupServer().state;
      let roomBaseState = useRoomBaseServer().state;
      let localRoomInfo = {
        authId: roomBaseState.watchInitData.join_info.third_party_user_id,
        insertChannelId: roomBaseState.watchInitData.webinar.rebroadcast
          ? roomBaseState.watchInitData.webinar.rebroadcast.channel_id
          : '',
        isEmbed: /embed/.test(this.$route.path),
        isLogin: !!roomBaseState.watchInitData.join_info.user_id,
        isNeedLogin: !roomBaseState.watchInitData.join_info.user_id,
        isShowGift: configList['ui.hide_gifts'] != 1,
        showLike: configList['ui.watch_hide_like'] != 1,
        showShare: configList['ui.watch_hide_share'] != 1,
        isShowReward: configList['ui.hide_reward'] != 1,
        roomId: roomBaseState.watchInitData.interact.room_id,
        saasJoinId: roomBaseState.watchInitData.join_info.join_id,
        staticSrc: roomBaseState.watchInitData.urls.static_url,
        type: roomBaseState.watchInitData.webinar.type,
        uploadSrc: roomBaseState.watchInitData.urls.upload_url,
        webSrc: roomBaseState.watchInitData.urls.web_url,
        webinarId: roomBaseState.watchInitData.webinar.id
      };
      let webinarData = roomBaseState.watchInitData.webinar;
      return {
        roomBaseState,
        localRoomInfo,
        webinarData,
        configList,
        groupInitData,
        joinInfoInGift: {},
        showInviteCard: roomBaseState.inviteCard.status == '1',
        location:
          window.location.protocol + process.env.VUE_APP_WAP_WATCH + process.env.VUE_APP_WEB_KEY,
        qwe: 1,
        handUpStatus: false,
        isBanned: useChatServer().state.banned || useChatServer().state.allBanned, //true禁言，false未禁言
        live_over: false
      };
    },
    computed: {
      device_status() {
        // 设备状态  0未检测 1可以上麦 2不可以上麦
        return useMediaCheckServer().state.deviceInfo.device_status;
      },
      // 是否开启举手
      isAllowhandup() {
        let status = this.$domainStore.state.roomBaseServer.interactToolStatus.is_handsup;
        return status;
      },
      // 是否是上麦状态
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      }
    },
    created() {
      if (this.isSpeakOn && useChatServer().state.allBanned) {
        useMicServer().speakOff();
      }

      window.interactTools = this;
    },
    mounted() {
      console.log(this.configList, useRoomBaseServer().state, 'this.configList');
      this.joinInfoInGift = {
        avatar: this.roomBaseState.watchInitData.join_info.avatar,
        nickname: this.roomBaseState.watchInitData.join_info.nickname,
        hideChatHistory: this.configList['ui.hide_chat_history'] == 1
      };
      //监听禁言通知
      useChatServer().$on('banned', res => {
        this.isBanned = res;
        if (this.isSpeakOn) {
          useMicServer().speakOff();
        }
      });
      //监听全体禁言通知
      useChatServer().$on('allBanned', res => {
        this.isBanned = res;
        if (this.isSpeakOn) {
          useMicServer().speakOff();
        }
      });

      // 结束直播
      useInteractiveServer().$on('live_over', () => {
        this.live_over = true;
      });

      useMicServer().$on('vrtc_connect_open', msg => {
        this.$toast(this.$t('interact.interact_1003'));
      });

      useMicServer().$on('vrtc_connect_close', msg => {
        this.$toast(this.$t('interact.interact_1002'));
      });
    },
    methods: {
      opneGifts() {
        this.$refs.gifts.showgift();
      },
      openReward() {
        console.log('showReward');
        this.$refs.reward.showReward();
      }
    }
  };
</script>

<style lang="less" scoped>
  .tools-box {
    .icon-wrapper {
      display: flex;
      div {
        font-size: 43px;
        margin-right: 36px;
        &:last-child {
          margin-right: 0px;
        }
      }
    }
    .vh-saas-iconfont,
    .vh-iconfont {
      font-size: 47px;
      color: #666666;
    }

    .red-dot {
      position: absolute;
      right: 0;
      top: 0;
      width: 10px;
      height: 10px;
      background-color: #ff3030;
      border-radius: 10px;
    }
  }
</style>
