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
    <div
      class="vmp-desktop-screen__tip"
      v-show="isShareScreen && desktopShareInfo.accountId == accountId && role == 1"
    >
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
      // 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾？）
      role() {
        return this.roomBaseServer.state.watchInitData.join_info.role_name;
      },
      third_party_user_id() {
        return this.roomBaseServer.state.watchInitData.join_info.third_party_user_id;
      },
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
        return this.desktopShareServer.state.localDesktopStreamId;
      },
      presentation_screen() {
        if (this.isInGroup) {
          return this.groupServer.state.groupInitData.presentation_screen;
        } else {
          return this.roomBaseServer.state.interactToolStatus.presentation_screen;
        }
      },
      isShowWrapper() {
        return (
          (this.isShareScreen &&
            (this.presentation_screen != this.third_party_user_id || this.role == 1)) ||
          this.popAlert.visible ||
          this.isShowAccessDeniedAlert
        );
      },
      desktopShareInfo() {
        return this.desktopShareServer.state.desktopShareInfo;
      },
      accountId() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id;
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
      this.addEvents();
    },
    mounted() {
      // 刷新或者上麦 重新订阅
      if (this.isShareScreen && this.accountId != this.desktopShareInfo.accountId) {
        this.subscribeStream();
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
      },
      ['roomBaseServer.state.watchInitData.webinar.type'](newval) {
        if (newval == 3) {
          // 直播结束,如果桌面共享还开着,结束
          if (this.isShareScreen) {
            this.showConfirm();
          }
        }
      }
    },
    methods: {
      addEvents() {
        this.desktopShareServer.$on('screen_stream_add', () => {
          this.subscribeStream();
        });
        this.desktopShareServer.$on('screen_stream_remove', () => {
          this.desktopShareServer.unSubscribeDesktopShareStream();
        });
      },
      // 订阅流
      subscribeStream() {
        const opt = {
          videoNode: 'vmp-desktop-screen-subscribe', // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };

        this.desktopShareServer.subscribeDesktopShareStream(opt).then(() => {
          useRoomBaseServer().setChangeElement('stream-list');
        });
      },
      showConfirm() {
        if (!this.isShareScreen) {
          this.popAlert.visible = true;
        } else {
          this.desktopShareServer.stopShareScreen().then(() => {
            useRoomBaseServer().setChangeElement('stream-list');
          });
        }
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
          .then(() => {
            this.desktopShareServer
              .publishDesktopShareStream()
              .then(() => {
                // 重新布局旁路
                this.interactiveServer.resetLayout();

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
    display: flex;
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
