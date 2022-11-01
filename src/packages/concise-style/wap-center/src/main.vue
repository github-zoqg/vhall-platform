<template>
  <div class="vmp-concise-center-wap">
    <!-- 播放 按钮 -->
    <div
      v-show="
        !noDelayWebinar &&
        isWapBodyDocSwitchFullScreen &&
        !isPlayering &&
        !isVodEnd &&
        !isSmallPlayer
      "
      class="vmp-wap-player-pause"
    >
      <p @click.stop="startPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </div>
    <div
      class="vmp-concise-center-wap__doc-container"
      :class="{
        'doc-container__mini': switchDrag,
        'doc-container__becovered': isDocBeCovered
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
        isDocBeCovered: false // 文档是否被封面覆盖，为 true 的时候将文档的层级置为 -1
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
      }
    },
    watch: {
      switchDrag(newVal, oldVal) {
        if (newVal != oldVal) {
          this.$nextTick(() => {
            // 派发事件：docResize
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocResize'));
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
          this.roomBaseServer.state.isWapBodyDocSwitchFullScreen = false;
        }
        this.isPlayering ? this.pause() : this.play();
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
      setDocContainerCovered(val) {
        this.isDocBeCovered = val;
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
    &__doc-container {
      background: #fff;
      &.doc-container__mini {
        position: fixed;
        height: 168px;
        left: 55%;
        top: 70%;
        width: 300px;
        z-index: 5000;
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
      &.doc-container__becovered {
        z-index: -1;
      }
    }
  }
</style>
