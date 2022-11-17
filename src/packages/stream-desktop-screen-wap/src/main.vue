<template>
  <div
    id="vmp-wap-desktop-screen-wrap"
    class="vmp-wap-desktop-screen"
    :class="{
      'vmp-wap-desktop-main-screen': isMergeMode,
      'vmp-wap-desktop-main-screen-top': isMergeMode && !isSpeakOn
    }"
    v-show="isShareScreen"
    @click.stop="showMask"
  >
    <!-- 订阅桌面共享容器 -->
    <div id="vmp-wap-desktop-screen"></div>
    <!-- 全屏切换按钮 -->
    <div
      class="vmp-wap-desktop-screen__full"
      :class="{ 'vmp-wap-desktop-screen__full-show': isShowMask }"
      @click.stop="fullscreen"
    >
      <i
        class="vh-iconfont"
        :class="isFullscreen ? 'vh-a-line-exitfullscreen' : 'vh-a-line-fullscreen'"
      ></i>
    </div>
    <!-- ios 开始按钮 -->
    <div class="pauseButton" v-if="iosPause" @click.stop="startPlay">
      <i class="vh-iconfont vh-line-video-play"></i>
    </div>
  </div>
</template>

<script>
  import {
    useRoomBaseServer,
    useMediaSettingServer,
    useInteractiveServer,
    useGroupServer,
    useDesktopShareServer
  } from 'middle-domain';

  export default {
    name: 'VmpWapDesktopScreen',
    data() {
      return {
        isFullscreen: false, // 桌面共享是否全屏
        isShowMask: false, // 是否显示遮罩层按钮
        iosPause: false
      };
    },
    computed: {
      isShareScreen() {
        return this.desktopShareServer.state.localDesktopStreamId;
      },
      // 互动是否初始化完成
      isInstanceInit() {
        return this.$domainStore.state.interactiveServer.isInstanceInit;
      },
      // 是否是合并模式
      isMergeMode() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout == 1;
      },
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      }
    },
    watch: {
      isShareScreen(val, oldVal) {
        if (oldVal && !val && this.isFullscreen) {
          this.autpExitFullscreen();
        }
      },
      isInstanceInit(val, oldVal) {
        if (oldVal && !val && this.isFullscreen) {
          this.autpExitFullscreen();
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.mediaSettingServer = useMediaSettingServer();
      this.groupServer = useGroupServer();
      this.interactiveServer = useInteractiveServer();
      this.desktopShareServer = useDesktopShareServer();
    },
    created() {
      this.addEvents();
    },
    mounted() {
      if (this.isShareScreen) {
        this.subscribeDesktopScreen();
      }
    },
    methods: {
      autpExitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      },
      // 更改遮罩层是否显示
      showMask() {
        this.isShowMask = !this.isShowMask;
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.isShowMask = false;
        }, 5000);
      },
      // 订阅桌面共享流
      subscribeDesktopScreen() {
        let videoNode = 'vmp-wap-desktop-screen';
        document.getElementById(videoNode).innerHTML = '';
        const opt = {
          videoNode, // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };
        this.desktopShareServer.subscribeDesktopShareStream(opt);
      },
      // 全屏切换按钮
      fullscreen() {
        this.isShowMask = false;
        if (this.isFullscreen) {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.isShareScreen,
              vNode: 'vmp-wap-desktop-screen-wrap'
            })
            .then(() => {
              this.isFullscreen = false;
            });
        } else {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.isShareScreen,
              vNode: 'vmp-wap-desktop-screen-wrap'
            })
            .then(() => {
              if (!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
                this.isFullscreen = true;
              } else {
                this.iosPause = true;
                this.isShowMask = false;
              }
            });
        }
      },
      addEvents() {
        // 监听全屏变化
        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              this.isFullscreen = false;
              this.isShowMask = false;
            }
          },
          true
        );
        // 监听桌面共享或者插播流加入
        this.desktopShareServer.$on('screen_stream_add', () => {
          this.subscribeDesktopScreen();
        });
        // 监听桌面共享或者插播流离开
        this.desktopShareServer.$on('screen_stream_remove', () => {
          this.desktopShareServer.unSubscribeDesktopShareStream();
        });

        // this.interactiveServer.$on('EVENT_REMOTESTREAM_FAILED', e => {
        //   if (e.data.stream.getID() == this.desktopShareServer.state.localDesktopStreamId) {
        //     Toast(this.$t(`interact.interact_1013`));
        //     this.subscribeDesktopScreen();
        //   }
        // });
      },
      startPlay() {
        this.iosPause = false;
        document
          .getElementById('vmp-wap-desktop-screen-wrap')
          .getElementsByTagName('video')[0]
          .play();
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-desktop-screen {
    width: 100%;
    height: 100%;
    background: #2d2d2d;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    #vmp-wap-desktop-screen {
      width: 100%;
      height: 100%;
    }
    &__full {
      width: 64px;
      height: 64px;
      line-height: 64px;
      z-index: 4;
      background: rgba(0, 0, 0, 0.4);
      position: absolute;
      left: 50%;
      top: 50%;
      text-align: center;
      transform: translate(-32px, -32px);
      border-radius: 50%;
      color: #ffffff;
      display: none;
      &-show {
        display: block;
      }
    }
    &__tip {
      text-align: center;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      width: 400px;
      height: 220px;
      & > i {
        font-size: 137px;
        display: block;
        color: #999;
        width: 100%;
      }

      & > p {
        text-align: center;
        font-size: 16px;
        color: #999;
      }
    }
    .pauseButton {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4);
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  // 合并模式下，桌面共享只占主画面
  @desk-w: 597px;
  @desk-h: 337px;
  .vmp-wap-desktop-main-screen {
    width: @desk-w;
    height: @desk-h;
    left: calc((100% - @desk-w) / 2);
    top: 85px;
    &-top {
      top: 0;
    }
  }
</style>
