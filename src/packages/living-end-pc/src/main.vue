<template>
  <div
    :class="[
      'vmp-living-end',
      {
        'vmp-living-end-embedFull': isEmbedVideo,
        'vmp-living-end-embed': isEmbed && !isEmbedVideo
      },
      `ending_bg_${imageCropperMode}`
    ]"
    v-if="isLivingEnd"
    :style="`backgroundImage: url('${webinarsBgImg}')`"
  >
    <div>
      <div class="end_img">
        <img src="../src/img/liveEnd.png" alt="" />
      </div>
      <h1>{{ $t('player.player_1017') }}</h1>
      <p v-if="isEmbedVideo">
        <i class="vh-saas-iconfont vh-saas-line-heat"></i>
        {{ hotNum | formatHotNum }}
      </p>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useMsgServer } from 'middle-domain';
  import { cropperImage } from '@/app-shared/utils/common';
  import { parseImgOssQueryString } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpLivingEnd',
    computed: {
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
        isLivingEnd: false,
        imageCropperMode: 1
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
      this.handlerImageInfo();
    },
    mounted() {
      this.msgServer.$onMsg('ROOM_MSG', msg => {
        // live_over 结束直播
        if (msg.data.type == 'live_over') {
          this.isLivingEnd = true;
        }
        if (msg.data.type == 'group_switch_end') {
          if (msg.data.over_live) {
            this.isLivingEnd = true;
          }
        }
      });
    },
    methods: {
      // 解析图片地址
      handlerImageInfo() {
        if (cropperImage(this.webinarsBgImg)) {
          let obj = parseImgOssQueryString(this.webinarsBgImg);
          this.imageCropperMode = Number(obj.mode);
        }
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
    background-size: 100% 100%;
    background-repeat: no-repeat;
    &.ending_bg_2 {
      background-size: cover;
    }
    &.ending_bg_3 {
      background-size: contain;
    }
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
  }
</style>
