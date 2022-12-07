<template>
  <div
    :class="[
      'vmp-basic-center',
      {
        'vmp-basic-center-embed': isEmbed
      }
    ]"
    :style="{ background: mainBackground }"
  >
    <!-- 流列表 -->
    <vmp-air-container :cuid="cuid"></vmp-air-container>
    <!-- 封面，无延迟直播或者上麦观众刷新页面显示 -->
    <div
      :class="[
        'vmp-basic-center__cover',
        {
          cover_embed: isEmbed
        }
      ]"
      v-show="showcoverImg"
    >
      <img :src="coverImgUrl" v-parseImgOss="{ url: coverImgUrl, default: 3 }" alt />
      <p class="vmp-basic-center__cover-icon" @click.stop="handleAllVideoPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </div>
  </div>
</template>

<script>
  import { useInteractiveServer } from 'middle-domain';
  export default {
    name: 'VmpBasicCenterContainer',
    data() {
      return { showcoverImg: false };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 文档区域是否展示 在上麦或者分组时，右上角为主屏画面，一般在主屏画面处设置播放按钮
      // switchStatusDoc() {
      //   if (this.mode == 6) {
      //     return true;
      //   } else {
      //     return false;
      //   }
      // },
      coverImgUrl() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.img_url;
      },
      mainBackground() {
        let skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        let skinJsonPc = {};
        if (skinInfo?.skin_json_pc && skinInfo.skin_json_pc != 'null') {
          skinJsonPc = skinInfo.skin_json_pc;
        }
        return skinJsonPc?.videoBackGroundColor || '#000';
      }
    },
    created() {
      useInteractiveServer().$on('EVENT_STREAM_PLAYABORT', () => {
        this.playboartCount ? ++this.playboartCount : (this.playboartCount = 1);
        if (this.playboartCount > 1) {
          return;
        }
        this.showcoverImg = true;
      });
      // // 如果是当前活动是无延迟直播，后者当前用户在麦上，刷新的时候展示封面图
      // if (this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar) {
      //   this.showcoverImg = true;
      // }
    },
    methods: {
      handleAllVideoPlay() {
        // document.querySelectorAll('video').forEach(video => video.play());
        // document.querySelectorAll('.vmp-stream-remote audio').forEach(audio => audio.play());
        useInteractiveServer().playAbortStreams();
        this.showcoverImg = false;
      }
    }
  };
</script>

<style lang="less">
  .vmp-basic-center {
    display: flex;
    background-size: cover;
    flex-direction: column;
    background-color: #2d2d2d;
    width: calc(100% - 380px);
    height: calc(100%- 56px);
    border-radius: 4px;
    &-embed {
      height: 100%;
      width: calc(100% - 360px) !important;
      .vmp-basic-center__mainscreen-pos {
        width: 100%;
        padding-top: 0;
      }
    }
    &__mainscreen-pos {
      height: 100%;
    }
    &__cover {
      position: absolute;
      top: 0;
      bottom: 56px;
      width: calc(100% - 380px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 11;
      background-color: #000;
      &.cover_embed {
        width: calc(100% - 360px) !important;
      }
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      &-1 {
        object-fit: fill;
      }
      &-2 {
        object-fit: cover;
        object-position: left top;
      }
      &-3 {
        object-fit: contain;
        object-position: center;
      }
      &-icon {
        background: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        width: 88px;
        height: 88px;
        z-index: 1;
        .vh-iconfont {
          font-size: 34px;
          color: #e6e6e6;
        }
      }
    }
  }
  // .vmp-basic-center
  .vmp-basic-center__mainscreen-pos {
    width: 100%;
    padding-top: calc(56.25% - 0.5px);
  }
</style>
