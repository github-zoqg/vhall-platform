<template>
  <div id="vmp-wap-desktop-screen" v-show="isShareScreen" :class="'vmp-wap-destop-screen__hide'">
    <!-- 订阅桌面共享容器 -->
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

    computed: {
      isShareScreen() {
        return this.desktopShareServer.state.localDesktopStreamId;
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
      addEvents() {
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
      }
    }
  };
</script>

<style lang="less">
  #vmp-wap-desktop-screen {
    width: 100%;
    height: 100%;
    background: #2d2d2d;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
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
  }
</style>
