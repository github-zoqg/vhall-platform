<template>
  <div
    :class="[
      'vmp-living-end',
      {
        'vmp-living-end-embedFull': isEmbedVideo,
        'vmp-living-end-embed': isEmbed && !isEmbedVideo
      }
    ]"
    v-if="isLivingEnd"
    v-parseImgOss="{ type: 'bg', url: webinarsBgImg }"
    :style="`backgroundImage: url('${webinarsBgImg}')`"
  >
    <div>
      <div class="end_img">
        <img src="../src/img/liveEnd.png" alt="" />
      </div>
      <h1>{{ isRehearsal ? $t('player.player_1027') : $t('player.player_1017') }}</h1>
      <p v-if="isEmbedVideo">
        <i class="vh-saas-iconfont vh-saas-line-heat"></i>
        {{ hotNum | formatHotNum }}
      </p>
    </div>
    <section class="vmp-living-end-to" v-if="isShowLiveStartNotice">
      <section class="vmp-living-end-to-start">
        <section class="vmp-living-end-cover"></section>
        <span>{{ $t('appointment.appointment_1033') }}</span>
        <button class="vmp-living-end__btn" @click="reloadPage">
          {{ $t('player.player_1013') }}
        </button>
      </section>
    </section>
  </div>
</template>
<script>
  import { useRoomBaseServer, useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpLivingEnd',
    computed: {
      // 是否是彩排
      isRehearsal() {
        return this.$domainStore.state.roomBaseServer.watchInitData.live_type == 2;
      },
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/images/mobile/video_default_nologo.png';
        const { webinar } = this.roomBaseServer.state.watchInitData;
        return webinar.img_url || cover;
      },
      webinarsType() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      },
      // 是否是嵌入
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      isEmbedVideo() {
        // 是不是单视频嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embedVideo;
      },
      hotNum() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvHot) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualHot) +
          1
        );
      }
    },
    data() {
      return {
        isShowLiveStartNotice: false,
        isLivingEnd: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
    },
    created() {
      if (this.webinarsType == 3) {
        this.isLivingEnd = true;
      }
    },
    mounted() {
      this.msgServer.$onMsg('ROOM_MSG', msg => {
        // live_start 开始直播
        if (msg.data.type == 'live_start' && this.isRehearsal) {
          this.isShowLiveStartNotice = true;
        }
        // live_over 结束直播
        if (msg.data.type == 'live_over') {
          this.isLivingEnd = true;
        }
        if (msg.data.type == 'group_switch_end') {
          if (msg.data.over_type) {
            this.isLivingEnd = true;
          }
        }
      });
    },
    methods: {
      reloadPage() {
        location.reload();
      }
    }
  };
</script>
<style lang="less">
  .vmp-living-end {
    position: absolute;
    top: 0;
    bottom: 56px;
    width: calc(100% - 380px);
    height: calc(100% - 56px);
    z-index: 11;
    background-repeat: no-repeat;
    &-embed {
      width: calc(100% - 360px);
      height: calc(100% - 56px);
    }
    &-embedFull {
      width: 100%;
      height: 100%;
    }
    > div {
      height: 100%;
      width: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .end_img {
      width: 164px;
      height: 120px;

      img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
    }
    h1 {
      font-size: 16px;
      line-height: 50px;
      height: 50px;
      color: #999;
      padding-left: 38px;
      font-weight: 400;
    }
    p {
      font-size: 16px;
      line-height: 30px;
      height: 30px;
      color: #999;
      padding-left: 38px;
      font-weight: 400;
    }
    &-to {
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0px;
      left: 0px;
      background: rgba(0, 0, 0, 0.6);
      z-index: 35;
      &-start {
        width: 400px;
        height: 260px;
        background: #ffffff;
        border-radius: 4px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        text-align: center;
        padding-top: 54px;
        box-sizing: border-box;
        margin: 20vh auto 0px auto;
        .vmp-living-end-cover {
          display: block;
          width: 80px;
          height: 80px;
          margin: 0px auto;
          margin-bottom: 10px;
          background: url('./img/live_start.png') no-repeat;
          background-size: 100%;
          background-position: center;
        }
        span {
          display: block;
          text-align: center;
          margin-bottom: 18px;
          height: 20px;
          line-height: 20px;
        }
        .vmp-living-end__btn {
          width: 160px;
          height: 40px;
          background: #fb3a32;
          border-radius: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #ffffff;
          line-height: 40px;
          border: none;
          outline: none;
        }
      }
    }
  }
</style>
