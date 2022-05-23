<template>
  <div class="vmp-interact-tools-wap">
    <div class="icon-wrapper" v-if="!groupInitData.isInGroup">
      <div class="liwu" auth="{ 'ui.hide_gifts': 0 }" v-if="localRoomInfo.isShowGift">
        <img class="tool gift-img" src="./img/icon_gift.png" @click="opneGifts" />
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
      <div v-show="!localRoomInfo.isEmbed && localRoomInfo.isShowReward">
        <img class="tool redpacket-img" src="./img/icon_reward.png" @click="openReward" />
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
          <img class="tool share-img" src="./img/icon_share.png" />
        </a>
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
  import RewardCard from './component/reward.vue';
  import Parise from './component/parise.vue';

  export default {
    name: 'VmpInteractToolsWap',
    components: { GiftCard, RewardCard, Parise },
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
        qwe: 1
      };
    },
    created() {
      window.interactTools = this;
    },
    mounted() {
      this.joinInfoInGift = {
        avatar: this.roomBaseState.watchInitData.join_info.avatar,
        nickname: this.roomBaseState.watchInitData.join_info.nickname,
        hideChatHistory: this.configList['ui.hide_chat_history'] == 1
      };
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

<style lang="less">
  .vmp-interact-tools-wap {
    .icon-wrapper {
      display: flex;
      & > div {
        font-size: 43px;
        margin-right: 36px;
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
  }
</style>
