<template>
  <div class="tools-box">
    <div class="icon-wrapper" v-if="!groupInitData.isInGroup">
      <div class="liwu" auth="{ 'ui.hide_gifts': 0 }">
        <i class="vh-saas-iconfont vh-saas-color-gift" @click="opneGifts"></i>
        <GiftCard
          ref="gifts"
          :isEmbed="localRoomInfo.isEmbed"
          :joinInfoInGift="joinInfoInGift"
          :roomId="localRoomInfo.room_id"
          :localRoomInfo="localRoomInfo"
        />
      </div>
      <!-- 打赏 -->
      <div v-if="!localRoomInfo.isEmbed" auth="{ 'ui.hide_reward': 0 }">
        <i class="vh-saas-iconfont vh-saas-a-color-redpacket" @click="openReward"></i>
        <RewardCard ref="reward" :webinarData="webinarData" :localRoomInfo="localRoomInfo" />
      </div>
      <!-- 邀请卡 -->
      <a
        v-if="showInviteCard && !localRoomInfo.isEmbed"
        target="_blank"
        :href="`${location}/lives/invite/${this.$route.params.id}?invite_id=${localRoomInfo.saasJoinId}`"
      >
        <i class="vh-saas-iconfont iconyaoqingka"></i>
      </a>
      <!-- 点赞 -->
      <div auth="{ 'ui.watch_hide_like': 0 }">
        <i class="vh-saas-iconfont vh-saas-a-color-givealike"></i>
        <!-- <praise :hideChatHistory="joinInfoInGift.hideChatHistory" :totalLike="totalLike" /> -->
      </div>
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer, useGroupServer } from 'middle-domain';
  import GiftCard from './component/GiftCard.vue';
  import RewardCard from './component/reward.vue';
  export default {
    name: 'VmpInteractToolsWap',
    components: { GiftCard, RewardCard },
    data() {
      let { configList } = useRoomBaseServer().state;
      let { groupInitData } = useGroupServer().state;
      let roomBaseState = useRoomBaseServer().state;
      let localRoomInfo = {
        OnlineNum: 0,
        authId: 'visit_v1493542725516496896',
        insertChannelId: '',
        isEmbed: false,
        isLogin: false,
        isNeedLogin: true,
        isShowGift: true,
        isShowOnselfMdess: false,
        like: '',
        roomId: 'lss_cb5550b1',
        saasJoinId: 1962556,
        showLike: true,
        showShare: true,
        staticSrc: 'https://t-alistatic01.e.vhall.com',
        type: 1,
        uploadSrc: 'https://t-alistatic01.e.vhall.com/upload',
        webSrc: '//t.e.vhall.com/v3',
        webinarId: '723145973'
      };
      let webinarData = roomBaseState.watchInitData.webinar;
      return {
        roomBaseState,
        localRoomInfo,
        webinarData,
        configList,
        groupInitData,
        joinInfoInGift: {},
        showInviteCard: false,
        totalLike: '',
        location:
          window.location.protocol + process.env.VUE_APP_WATCH_URL + process.env.VUE_APP_WEB_KEY,
        qwe: 1
      };
    },
    mounted() {
      console.log(this.roomBaseState, 'roomBaseState');
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
    .vh-saas-iconfont {
      font-size: 47px;
    }
  }
</style>
