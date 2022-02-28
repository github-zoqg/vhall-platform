<template>
  <div id="vmp-wap-desktop-screen" v-show="isShowWapDesktopScreen">
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
    data() {
      return {
        streamId: null, // 桌面共享流Id
        isShowWapDesktopScreen: false, // wap端是否显示桌面共享容器
        popAlert: {
          text: '请确认开启桌面共享，为了体验更好，建议选择“您的整个屏幕”',
          visible: false,
          confirm: true
        },
        isShowAccessDeniedAlert: false, // 是否显示没有权限桌面共享的弹窗
        isShareScreen: false
      };
    },
    computed: {
      //是否在分组里
      isInGroup() {
        return this.groupServer.state.groupInitData.isInGroup;
      },
      isShowWrapper() {
        return this.isShareScreen || this.popAlert.visible || this.isShowAccessDeniedAlert;
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
      this.streamId = '';
      this.addEvents();
    },
    mounted() {
      // 刷新或者上麦 重新订阅桌面共享流或者插播流
      let stream = this.interactiveServer.getDesktopAndIntercutInfo();
      if (stream?.streamType === 3 || stream?.streamType === 4) {
        this.subscribeDesktopScreen(stream.streamId);
      }
    },
    methods: {
      // 订阅桌面共享流
      subscribeDesktopScreen(streamId) {
        //订阅时展示桌面共享容器
        this.isShowWapDesktopScreen = true;
        //存一下当前的流Id，刷新后使用
        sessionStorage.setItem('currentDesktopStreamID', streamId);
        const opt = {
          streamId,
          videoNode: 'vmp-wap-desktop-screen', // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };
        this.desktopShareServer.subscribeDesktopShareStream(opt).then(() => {
          useRoomBaseServer().setShareScreenStatus(true);
        });
      },
      addEvents() {
        // 监听桌面共享或者插播流加入
        this.desktopShareServer.$on('screen_stream_add', e => {
          this.streamId = e;
          this.subscribeDesktopScreen(e);
        });
        // 监听桌面共享或者插播流离开
        this.desktopShareServer.$on('screen_stream_remove', e => {
          // ()中的逻辑，如果刷新之后，没有streamId的值，需要从sessionStorage中取当前的流Id
          if (
            e.data.streamId == (this.streamId || sessionStorage.getItem('currentDesktopStreamID'))
          ) {
            this.streamId = '';
            this.isShowWapDesktopScreen = false;
          }
        });
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
