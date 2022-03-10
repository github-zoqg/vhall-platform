<template>
  <div class="vmp-split-screen" ref="splitScreen">
    <!-- 头部悬浮区 -->
    <div class="vmp-split-screen__tip">
      <span class="tip-txt">分屏模式</span>
      <span
        class="exit-shadow vh-iconfont vh-line-close"
        @click="exitSplitScreen"
        title="退出分屏"
      ></span>
      <span
        class="v-fullScreen vh-iconfont"
        :class="isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'"
        @click="enterFullScreen"
        title="全屏"
      ></span>
    </div>
    <!-- 流列表 -->
    <div class="vmp-split-screen__stream-list__container">
      <div
        class="vmp-split-screen__stream-list"
        :class="`vmp-split-screen__stream-list__${layoutLevel}`"
      >
        <!-- 本地流 -->
        <div class="vmp-split-screen__stream-container">
          <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container>
        </div>
        <!-- 远端流 -->
        <div
          class="vmp-split-screen__stream-container"
          v-for="stream in remoteStreams"
          :key="stream.id"
        >
          <vmp-stream-remote :stream="stream"></vmp-stream-remote>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { useSplitScreenServer } from 'middle-domain';
  import screenfull from 'screenfull';
  export default {
    name: 'VmpSplitScreen',
    data() {
      return {
        childrenCom: [],
        isFullscreen: false, // 是否进入全屏
        layoutLevel: 1
      };
    },
    computed: {
      // 远端流列表showPlayIcon
      remoteStreams() {
        return this.$domainStore.state.interactiveServer.remoteStreams;
      },
      // 流列表长度（远端流加本地流）
      streamListLength() {
        return (
          this.remoteStreams.length +
          (this.$domainStore.state.interactiveServer.localStream.streamId ? 1 : 0)
        );
      }
    },
    watch: {
      // 流数量变更，更新视图的布局
      streamListLength: {
        immediate: true,
        handler(newVal) {
          if (newVal == 1) {
            this.layoutLevel = 1;
          } else if (newVal <= 4) {
            this.layoutLevel = 2;
          } else if (newVal <= 9) {
            this.layoutLevel = 3;
          } else if (newVal <= 16) {
            this.layoutLevel = 4;
          }
        }
      }
    },
    beforeCreate() {
      this.splitScreenServer = useSplitScreenServer();
    },
    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      screenfull.on('change', () => {
        this.isFullscreen = screenfull.isFullscreen;
      });
    },
    methods: {
      exitSplitScreen() {
        this.splitScreenServer.closeSplit();
      },
      enterFullScreen() {
        screenfull.toggle(this.$refs.splitScreen);
      },
      // 停止推流之后，通知主页面结束直播停止计时
      handleUnpublishComplate() {
        console.log('----停止推流之后，通知主页面结束直播停止计时----');
        // 分屏推流结束，poostMessage消息通知主页面
        this.splitScreenServer.splitSendPostMessage({
          type: 'split_unpublish_complete'
        });
        // 关闭分屏
        this.splitScreenServer.splitCloseSplitProcess(false);
      }
    }
  };
</script>

<style lang="less">
  .vmp-split-screen {
    &:hover {
      .vmp-split-screen__tip {
        display: flex;
      }
    }
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #2d2d2d;
    flex: 1;
    height: 100%;
    background-color: #2d2d2d;
    display: flex;
    flex-direction: column;
    .vmp-split-screen__tip {
      display: none;
      position: fixed;
      z-index: 1;
      width: 100%;
      height: 50px;
      background-color: #434343;
      color: white;
      align-items: center;
      padding: 0 20px;
      justify-content: space-between;
      .exit-shadow {
        cursor: pointer;
        width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 8px;
        right: 44px;
      }
      .v-fullScreen {
        cursor: pointer;
        width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 8px;
        right: 100px;
      }
    }
    .vmp-split-screen__stream-list__container {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vmp-split-screen__stream-list {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      &__1 {
        .vmp-split-screen__stream-container {
          // width: 100%;
          height: 100vh;
        }
      }
      &__2 {
        .vmp-split-screen__stream-container {
          width: 50%;
        }
      }
      &__3 {
        .vmp-split-screen__stream-container {
          width: 33.3%;
        }
      }
      &__4 {
        .vmp-split-screen__stream-container {
          width: 25%;
        }
      }
      .vmp-split-screen__stream-container {
        box-sizing: border-box;
        &-box {
          padding-top: 56.25%;
        }
        .vmp-stream-local__shadow-box,
        .vmp-stream-remote__shadow-box {
          display: none;
        }
      }
    }
  }
</style>
