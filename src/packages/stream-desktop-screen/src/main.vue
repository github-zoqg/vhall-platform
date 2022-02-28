<template>
  <div
    class="vmp-desktop-screen"
    v-show="isShowWrapper"
    :class="[
      miniElement === 'screen' ? 'mini' : 'normal',
      { 'is-watch': isWatch },
      { 'has-stream-list': hasStreamList }
    ]"
  >
    <!-- 推桌面共享容器 -->
    <div id="vmp-desktop-screen-publish" style="width: 0; height: 0; position: relative"></div>

    <!-- 订阅桌面共享容器 -->
    <div id="vmp-desktop-screen-subscribe"></div>

    <!-- 推桌面共享时占位图 -->
    <div class="vmp-desktop-screen__tip" v-show="isShareScreen && streamId">
      <i class="vh-saas-iconfont vh-saas-a-line-Desktopsharing"></i>
      <br />
      <p>桌面共享中...</p>
    </div>

    <!--弹窗 -->
    <saas-alert
      :visible="popAlert.visible"
      :confirm="popAlert.confirm"
      :knowText="'知道了'"
      :confirmText="'确定'"
      :cancelText="'取消'"
      @onSubmit="startShare"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">{{ popAlert.text }}</main>
    </saas-alert>

    <!-- access-denied弹窗 -->
    <saas-alert
      :visible="isShowAccessDeniedAlert"
      @onClose="isShowAccessDeniedAlert = false"
      @onCancel="isShowAccessDeniedAlert = false"
    >
      <div slot="content">
        <span>请查看系统是否允许浏览器使用桌面共享功能</span>
      </div>
    </saas-alert>
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
  // import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  export default {
    name: 'VmpStreamDesktopScreen',
    data() {
      return {
        popAlert: {
          text: '请确认开启桌面共享，为了体验更好，建议选择“您的整个屏幕”',
          visible: false,
          confirm: true
        },
        isShowAccessDeniedAlert: false, // 是否显示没有权限桌面共享的弹窗
        hasStreamList: false
      };
    },
    computed: {
      // 是否观看端
      isWatch() {
        return this.roomBaseServer.state.clientType !== 'send';
      },
      //是否在分组里
      isInGroup() {
        return this.groupServer.state.groupInitData.isInGroup;
      },
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      isShareScreen() {
        return this.$domainStore.state.roomBaseServer.isShareScreen;
      },
      isShowWrapper() {
        return this.isShareScreen || this.popAlert.visible || this.isShowAccessDeniedAlert;
      }
    },
    components: {
      SaasAlert
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
      // 刷新或者上麦 重新订阅
      if (this.interactiveServer.interactiveInstance) {
        let stream = this.interactiveServer.getDesktopAndIntercutInfo();

        if (stream?.streamType === 3 || stream?.streamType === 4) {
          this.subscribeStream(stream.streamId);
        }
      }
    },
    watch: {
      // 监听流列表高度变
      ['interactiveServer.state.streamListHeightInWatch']: {
        handler(newval) {
          console.log('[doc] streamListHeight:', newval);
          this.hasStreamList = newval < 1 ? false : true;
        },
        immediate: true
      }
    },
    methods: {
      addEvents() {
        this.desktopShareServer.$on('screen_stream_add', streamId => {
          this.subscribeStream(streamId);
        });
        this.desktopShareServer.$on('screen_stream_remove', () => {
          useRoomBaseServer().setShareScreenStatus(false);
          useRoomBaseServer().setChangeElement('');
        });
      },
      // 订阅流
      subscribeStream(streamId) {
        const opt = {
          streamId: streamId,
          videoNode: 'vmp-desktop-screen-subscribe', // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };

        this.desktopShareServer.subscribeDesktopShareStream(opt).then(() => {
          useRoomBaseServer().setShareScreenStatus(true);
          useRoomBaseServer().setChangeElement('stream-list');
        });
      },
      showConfirm() {
        this.popAlert.visible = true;
      },

      // 开始共享
      startShare() {
        this.closeConfirm();
        const configuredProfile = this.mediaSettingServer.state.screenRate;
        let profile = VhallRTC.RTC_SCREEN_PROFILE_1080P_16x9_M;
        if (configuredProfile) {
          profile = VhallRTC[configuredProfile];
        }
        const options = {
          videoNode: 'vmp-desktop-screen-publish', // 传入本地视频显示容器，必填
          profile // 自定义分辨率，使用分辨率模板，选填，与videoQuality参数互斥，优先使用profile参数，推荐使用。
        };

        this.desktopShareServer
          .startShareScreen(options)
          .then(data => {
            this.streamId = data.streamId;
            this.desktopShareServer
              .publishDesktopShareStream(data.streamId)
              .then(() => {
                // 重新布局旁路
                this.interactiveServer.resetLayout();

                useRoomBaseServer().setShareScreenStatus(true);
                console.log('[screen] 桌面共享推流成功');
              })
              .catch(error => {
                console.log(error, '推流失败');
              });
          })
          .catch(error => {
            console.error('[screen] 桌面共享创建本地流失败', error);
            if (error?.data?.error?.type == 'access-denied') {
              if (/macintosh|mac os x/i.test(navigator.userAgent)) {
                this.isShowAccessDeniedAlert = true;
              }
            }
          });
      },
      // 关闭弹窗
      closeConfirm() {
        this.popAlert.visible = false;
      },

      // 全屏
      fullScreen(el) {
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
          this.enterFullscreen(el);
        } else {
          this.exitFullscreen(el);
        }
      },
      enterFullscreen() {
        const element = document.querySelector('.vmp-basic-container');
        if (!this.assistantType) {
          if (element.requestFullscreen) element.requestFullscreen();
          else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
          else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if (element.msRequestFullscreen) element.msRequestFullscreen();
        }
      },
      exitFullscreen() {
        if (!this.assistantType) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-desktop-screen {
    width: 100%;
    height: 100%;
    background: #2d2d2d;
    position: relative;

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

  // 发起端小屏
  .vmp-desktop-screen.mini {
    position: absolute;
    width: 309px;
    height: 240px;
    top: 0;
    right: 0;
    z-index: 10;
  }

  // 观看端
  .vmp-desktop-screen.is-watch {
    &.normal {
      position: absolute;
      top: 0;
      bottom: 56px;
      width: calc(100% - 380px);
      height: auto;
      min-height: auto;
      &.has-stream-list {
        top: 80px;
      }
    }
    &.mini {
      width: 360px;
      height: 204px;
      min-height: 204px;
      top: 0;
      right: 0;
      z-index: 10;
    }
  }
</style>
