<template>
  <div class="vmp-concise-center-wap">
    <!-- 播放 按钮 -->
    <div
      v-show="isWapBodyDocSwitchFullScreen && !isPlayering && !isVodEnd && !isSmallPlayer"
      class="vmp-wap-player-pause"
    >
      <p @click.stop="startPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </div>
    <!-- 回放结束（正常回放和试看回放结束） -->
    <div
      v-show="isVodEnd && !isPlayering"
      :class="`vmp-wap-player-ending ending_bg_${imageCropperModeVod}`"
      :style="`backgroundImage: url('${webinarsBgImgVod}')`"
    >
      <!-- 回放播放结束 -->
      <div class="vmp-wap-player-ending-box" @click.stop="startPlay">
        <p class="vmp-wap-player-ending-box-noraml">
          <i class="vh-iconfont vh-line-refresh-left"></i>
        </p>
        <p class="vmp-wap-player-ending-box-reset">{{ $t('player.player_1016') }}</p>
      </div>
    </div>

    <!-- 直播结束 -->
    <div
      v-if="isLivingEnd"
      :class="`vmp-wap-body-ending ending_bg_${imageCropperModeLive}`"
      :style="`backgroundImage: url('${webinarsBgImgLive}')`"
    >
      <div class="vmp-wap-body-ending-box">
        <div class="vmp-wap-body-ending-box-img">
          <img src="./img/livingEnd@2x.png" alt="" />
        </div>
        <h1 class="vmp-wap-body-ending-box-text">
          {{ $t('player.player_1017') }}
        </h1>
      </div>
    </div>

    <!-- 音频直播 -->
    <div class="vmp-wap-player-audie" v-if="(isAudio || audioStatus) && !isVodEnd && isPlayering">
      <p>{{ $t('player.player_1014') }}</p>
    </div>

    <div
      class="vmp-concise-center-wap__doc-container"
      :class="{
        'doc-container__mini': switchDrag,
        'doc-container__sticktop': isDocStickTop,
        'doc-container__becovered':
          isDocBeCovered || !switchStatus || (isDocStickTop && isWapBodyDocSwitchFullScreen)
      }"
      v-drag="{ close: !switchDrag }"
    >
      <!-- doc组件-->
      <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';

  export default {
    name: 'VmpConciseCenterWap',
    components: {},
    data() {
      return {
        isShowPoster: true, //是否展示活动图片背景
        isPlayering: false, // 是否是播放状态
        isSmallPlayer: false,
        isVodEnd: false, // 回放结束
        childrenComp: [],
        isDocBeCovered: false, // 文档是否被封面覆盖，为 true 的时候将文档的层级置为 -1
        isDocStickTop: false, // 文档是否吸顶（问卷弹出的情况）
        imageCropperModeVod: 1, //回放结束
        webinarsBgImgVod: '', //回放结束背景图
        imageCropperModeLive: 1, //直播结束
        webinarsBgImgLive: '', //直播结束背景图
        audioStatus: false, // 选中清晰度是否是音频模式
        isAudio: false, //判断是否是音频直播模式
        isLivingEnd: false
      };
    },
    computed: {
      // 是否观众可见
      switchStatus() {
        return this.$domainStore.state.docServer.switchStatus;
      },
      // 是否是无延迟活动
      noDelayWebinar() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar === 1;
      },
      // 文档可拖拽: 1.文档可见  2.文档小窗
      switchDrag() {
        return this.switchStatus && this.isWapBodyDocSwitchFullScreen;
      },
      // 竖屏直播，文档播放器位置切换的状态
      isWapBodyDocSwitchFullScreen() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.$domainStore.state.roomBaseServer.watchInitData.webinar.type);
      }
    },
    watch: {
      switchDrag(newVal, oldVal) {
        if (newVal != oldVal) {
          this.$nextTick(() => {
            // 派发事件：docResize
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocResize'));
            if (newVal) {
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocCancleZoom'));
            }
          });
        }
      }
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    methods: {
      startPlay() {
        if (this.isWapBodyDocSwitchFullScreen && this.switchStatus) {
          this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen = false;
        }
        if (this.noDelayWebinar && this.webinarType == 1) {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitStreamPlay'));
        } else {
          this.isPlayering ? this.pause() : this.play();
        }
      },
      // 播放
      play() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerPlay'));
      },
      // 暂停
      pause() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerPause'));
      },
      // 改变播放状态
      updatePlayStatus(val) {
        this.isPlayering = val;
      },
      // 设置文档容器是否隐藏（z-index:-1）
      setDocContainerCovered(val) {
        this.isDocBeCovered = val;
      },
      // 设置文档容器是否置顶
      setDocContainerStickTop(val) {
        this.isDocStickTop = val;
        this.$nextTick(() => {
          // 派发事件：docResize
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocResize'));
        });
        this.$nextTick(() => {
          // 派发事件：设置文档容器是否置顶
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitDocContainerStickTop', [val])
          );
        });
      },
      getImageCropperModeVod(val) {
        this.imageCropperModeVod = val;
      },
      getWebinarsBgImgVod(val) {
        this.webinarsBgImgVod = val;
      },
      getImageCropperModeLive(val) {
        this.imageCropperModeLive = val;
      },
      getWebinarsBgImgLive(val) {
        this.webinarsBgImgLive = val;
      },
      getVodEnd(val) {
        this.isVodEnd = val;
      },
      getIsSmallPlayer(val) {
        this.IsSmallPlayer = val;
      },
      getAudioStatus(val) {
        this.audioStatus = val;
      },
      getIsAudio(val) {
        this.IsAudio = val;
      },
      getLivingEnd(val) {
        this.isLivingEnd = val;
      }
    }
  };
</script>

<style lang="less">
  .vmp-basic-bd {
    background-color: transparent !important;
  }
  .vmp-concise-center-wap {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
    > .vmp-wap-player-pause {
      height: 100%;
      width: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 12;
      background: transparent;
      p {
        width: 108px;
        height: 108px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 46px;
          color: #f5f5f5;
        }
      }
    }
    > .vmp-wap-player-audie {
      display: block !important;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      background: url('./img/video.gif') no-repeat;
      background-size: 100% 100%;
      p {
        font-size: 28px;
        color: #fff;
        margin-top: 40%;
        text-align: center;
      }
    }
    &__doc-container {
      background: #fff;
      position: relative;
      bottom: 0 !important;
      &.doc-container__mini {
        position: fixed;
        top: 16px;
        right: 16px;
        height: 160px;
        width: 284px;
        z-index: 302;
        overflow: hidden;
        // 文档小窗的样式
        .vmp-doc-wap {
          .pageGroup {
            display: none;
          }
          .tools {
            .btn-doc-rotate,
            .btn-doc-fullscreen,
            .btn-doc-restore {
              display: none;
            }
          }
        }
      }
      &.doc-container__sticktop {
        position: fixed;
        left: 0 !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        height: 422px;
        width: 100%;
        z-index: 302;
        overflow: hidden;
        // 文档小窗的样式
        .vmp-doc-wap {
          .pageGroup {
            display: none;
          }
          .tools {
            .btn-doc-rotate,
            .btn-doc-fullscreen,
            .btn-doc-restore,
            .btn-doc-transposition {
              display: none;
            }
          }
        }
      }
      &.doc-container__becovered {
        z-index: -1;
      }
    }
  }
  .isVod .vmp-concise-center-wap > .vmp-wap-player-pause {
    display: none;
  }
</style>
