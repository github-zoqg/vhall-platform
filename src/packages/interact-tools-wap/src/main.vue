<template>
  <div :class="['vmp-interact-tools-wap', isConcise ? 'vmp-interact-tools-wap__concise' : '']">
    <div class="icon-wrapper" v-if="!groupInitData.isInGroup">
      <!-- TODO:支付牌照问题 -->
      <div class="liwu" auth="{ 'ui.hide_gifts': 0 }" v-if="localRoomInfo.isShowGift">
        <img class="tool gift-img" src="./img/icon_gift.png" @click="opneGifts" />
        <GiftCard
          @showLogin="showLogin"
          ref="gifts"
          :isEmbed="localRoomInfo.isEmbed"
          :joinInfoInGift="joinInfoInGift"
          :roomId="localRoomInfo.room_id"
          :localRoomInfo="localRoomInfo"
        />
      </div>
      <!-- 打赏 -->
      <!-- TODO:支付牌照问题 -->
      <!-- <div v-show="!localRoomInfo.isEmbed && localRoomInfo.isShowReward" class="redpacket-box">
        <img class="tool redpacket-img" src="./img/icon_reward.png" @click="openReward" />
        <RewardCard
          ref="reward"
          :webinarData="webinarData"
          :localRoomInfo="localRoomInfo"
          :cuid="cuid"
        />
      </div> -->
      <!-- 邀请卡 -->
      <div v-if="showInviteCard && !localRoomInfo.isEmbed" class="share-box" @click="report">
        <a
          target="_blank"
          :href="`${location}/lives/invite/${this.$route.params.id}?invite_id=${localRoomInfo.saasJoinId}`"
        >
          <img class="tool share-img" src="./img/icon_share.png" />
        </a>
      </div>
      <!-- 极简模式下, 菜单入口 -->
      <div v-show="isShowMenuByConcise">
        <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container>
      </div>
      <!-- 点赞 -->
      <div v-if="localRoomInfo.showLike">
        <!-- <i class="vh-saas-iconfont vh-saas-a-color-givealike"></i> -->
        <Parise :hideChatHistory="joinInfoInGift.hideChatHistory" :localRoomInfo="localRoomInfo" />
      </div>
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer, useGroupServer } from 'middle-domain';
  import GiftCard from './component/GiftCard.vue';
  // import RewardCard from './component/reward.vue';
  import Parise from './component/parise.vue';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';

  export default {
    name: 'VmpInteractToolsWap',
    components: { GiftCard, Parise },
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
      let webinarData = roomBaseState.watchInitData;

      let skin_json_wap = {
        style: 1
      };
      const skinInfo = roomBaseState.skinInfo;
      if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
        skin_json_wap = skinInfo.skin_json_wap;
      }
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
        isConcise: skin_json_wap?.style == 3, // 是否极简模式
        childrenComp: [],
        visibleMenuLength: 0
      };
    },
    computed: {
      // 是否展示自定义菜单组件
      isShowMenuByConcise() {
        // 进入了小组 & 当前展示成员列表 & 极简模式
        return this.isConcise && this.visibleMenuLength > 0;
      }
    },
    created() {
      window.interactTools = this;
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      this.joinInfoInGift = {
        avatar: this.roomBaseState.watchInitData.join_info.avatar,
        nickname: this.roomBaseState.watchInitData.join_info.nickname,
        hideChatHistory: this.configList['ui.hide_chat_history'] == 1
      };
    },
    methods: {
      showLogin() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitNeedLogin'));
      },
      opneGifts() {
        this.$refs.gifts.showgift();
      },
      openReward() {
        console.log('showReward');
        this.$refs.reward.showReward();
      },
      report() {
        window.vhallReportForWatch?.report(170020, {
          share_channel: 4
        });
      },
      setVisibleMenuLength(len = 0) {
        console.log('当前菜单是否进入', len);
        this.visibleMenuLength = len;
      }
    }
  };
</script>

<style lang="less">
  .vmp-interact-tools-wap {
    .icon-wrapper {
      display: flex;
      & > div {
        font-size: 43px;
        margin-right: 24px;
        display: flex;
        align-items: center;
        &:last-child {
          margin-right: 0px;
        }
      }
      .tool {
        width: 48px;
        height: 48px;
      }
    }
    .vh-saas-iconfont,
    .vh-iconfont {
      font-size: 47px;
      color: #666666;
    }
    .share-box {
      position: relative;
      top: 2px;
      .tool {
        width: 50px;
        height: 50px;
      }
    }
    .redpacket-box {
      position: relative;
      top: -2px;
    }
    &.vmp-interact-tools-wap__concise {
      .vh-saas-iconfont,
      .vh-iconfont {
        font-size: unset;
        color: unset;
      }
      .vmp-send-box__qa,
      .vmp-send-box__private {
        .icon-wrap-chat_set {
          color: var(--theme-qa-chat-input-placeholder-font) !important;
          .vh-line-audit {
            font-size: 32px;
            border-right: 1px solid var(--theme-qa-chat-input-space-color) !important;
          }
        }
      }
    }
  }
</style>
