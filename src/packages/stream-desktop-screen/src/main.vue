<template>
  <div
    id="vmp-desktop-screen"
    class="vmp-desktop-screen"
    v-show="isShowWrapper"
    :class="[
      miniElement === 'screen' ? 'mini' : 'normal',
      { 'is-watch': isWatch },
      { 'is-embed': isEmbed && isWatch },
      { 'has-stream-list': hasStreamList },
      { 'share-screen': isShareScreen },
      { 'vmp-desktop-screen__full': isFullscreen }
    ]"
  >
    <!-- 结束演示按钮 -->
    <el-button
      round
      size="mini"
      v-if="renderEndDemonstrateBtn && isShareScreen"
      @click="handleEndDemonstrate"
      class="end-demonstrate"
    >
      结束演示
    </el-button>

    <!-- 推桌面共享容器 -->
    <div id="vmp-desktop-screen-publish" style="width: 0; height: 0; position: relative"></div>

    <!-- 订阅桌面共享容器 -->
    <div id="vmp-desktop-screen-subscribe"></div>

    <!-- 推桌面共享时占位图 -->
    <div
      class="vmp-desktop-screen__tip"
      v-show="isShareScreen && desktopShareInfo.accountId == accountId && roleName != 2"
    >
      <i class="vmp-desktop-screen__img"></i>
      <br />
      <p>桌面共享中....</p>
    </div>

    <div
      class="vmp-desktop-screen-mask"
      v-if="
        (miniElement && ((!isSpeakOn && roleName == 2) || roleName == 3)) ||
        accountId != desktopShareInfo.accountId
      "
    >
      <p>
        <el-tooltip
          :content="$t('player.player_1008')"
          placement="top"
          v-if="miniElement && ((!isSpeakOn && roleName == 2) || roleName == 3) && !isFullscreen"
        >
          <a
            href="javascript:void(0);"
            class="vh-iconfont vh-line-copy-document"
            @click="exchangeVideoDocs"
          ></a>
        </el-tooltip>
        <el-tooltip
          :content="isFullscreen ? $t('doc.doc_1009') : $t('doc.doc_1010')"
          placement="top"
          v-if="accountId != desktopShareInfo.accountId"
        >
          <a
            v-if="!isFullscreen"
            href="javascript:void(0);"
            class="vh-iconfont vh-line-amplification"
            @click="fullscreen"
          ></a>
          <a
            v-if="isFullscreen"
            href="javascript:void(0);"
            class="vh-iconfont vh-line-narrow"
            @click="fullscreen"
          ></a>
        </el-tooltip>
      </p>
    </div>

    <!--没有权限弹窗 -->
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
      :knowText="'知道了'"
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
    useDesktopShareServer,
    useMsgServer,
    useMicServer,
    useDocServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
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
        hasStreamList: false,
        isFullscreen: false // 桌面共享是否全屏
      };
    },
    computed: {
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      // 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾？）
      roleName() {
        return Number(this.roomBaseServer.state.watchInitData.join_info.role_name);
      },
      // 互动是否初始化完成
      isInstanceInit() {
        return this.$domainStore.state.interactiveServer.isInstanceInit;
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(this.roomBaseServer.state.clientType);
      },
      // 是否是嵌入
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
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
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
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
            (this.presentation_screen != this.accountId ||
              this.roleName == 1 ||
              this.roleName == 4)) ||
          this.popAlert.visible ||
          this.isShowAccessDeniedAlert
        );
      },
      desktopShareInfo() {
        return this.desktopShareServer.state.desktopShareInfo;
      },
      accountId() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id;
      },
      // 是否开启了插播
      isInsertFilePushing() {
        return this.$domainStore.state.insertFileServer.isInsertFilePushing;
      },
      watchInitData() {
        return this.roomBaseServer.state.watchInitData;
      },
      groupInitData() {
        return this.groupServer.state.groupInitData;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      // 当前的演示者Id
      presenterId() {
        return this.isInGroup
          ? this.groupServer.state.groupInitData.presentation_screen
          : this.roomBaseServer.state.interactToolStatus.presentation_screen;
      },
      isNoDelay() {
        // 1：无延迟直播
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      /**
       * @description 是否显示结束演示按钮
       * 1.分组活动下没有嘉宾
       * 2.助理在主房间和小组都只是禁言踢人相关操作
       * 3.主直播间可以邀请演示
       * 4.小组可以邀请自己和别人演示
       * 5.主直播间主持人不结束自己演示,都是结束别人演示
       * 6.小组内主持人结束自己
       * 7.助理不能邀请演示和结束演示(分组没嘉宾)
       */
      renderEndDemonstrateBtn() {
        // 非开播状态不渲染
        if (this.webinarType !== 1) return false;
        // 非分组活动不渲染
        if (this.watchInitData.webinar.mode != 6) return false;
        // 助理不显示
        if (this.watchInitData.join_info.role_name == 3) return false;
        if (this.isInGroup) {
          // 在小组内
          if (
            this.groupInitData.join_role == 1 &&
            this.presenterId != this.groupInitData.doc_permission
          ) {
            return true; // 对于主持人，演示者不是组长的时候显示
          } else if (
            this.groupInitData.join_role == 20 &&
            this.presenterId != this.accountId &&
            this.presenterId != this.watchInitData.webinar.userinfo.user_id
          ) {
            return true; // 对于组长，演示者不是自己,也不是主持人的时候显示
          } else if (this.groupInitData.join_role == 2 && this.presenterId == this.accountId) {
            return true; // 对于观众，演示者是自己的时候显示
          }
          return false;
        } else {
          // 在主直播间内
          // 如果是主持人，演示人不是自己，说明有人在演示
          if (this.roleName == 1 && this.presenterId != this.accountId) {
            return true;
          }
          // 如果不是主持人, 演示者是自己,显示
          if (this.roleName != 1 && this.presenterId == this.accountId) {
            return true;
          }
          return false;
        }
      },
      // 当前文档或白板容器的Id
      currentCid() {
        return this.docServer.state.currentCid;
      },
      // 插播信息
      insertStreamInfo() {
        return this.$domainStore.state.insertFileServer.insertStreamInfo;
      }
    },
    components: {
      SaasAlert
    },
    beforeCreate() {
      this.docServer = useDocServer();
      this.micServer = useMicServer();
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
          // if (this.mode == 3 && this.isNoDelay == 1 && !this.micServer.getSpeakerStatus()) {
          //   return;
          // }
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
      },
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
    methods: {
      autpExitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      },
      addEvents() {
        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              this.isFullscreen = false;
            }
          },
          true
        );
        this.desktopShareServer.$on('screen_stream_add', () => {
          this.subscribeStream().then(() => {
            // 重置布局
            useDocServer().resetLayoutByMiniElement();
            // 设置旁路
            this.interactiveServer.resetLayout();
          });
        });
        this.desktopShareServer.$on('EVENT_STREAM_END', () => {
          this.setDesktop('0');
          this.interactiveServer.resetLayout();
        });

        // this.interactiveServer.$on('EVENT_REMOTESTREAM_FAILED', e => {
        //   if (e.data.stream.getID() == this.desktopShareServer.state.localDesktopStreamId) {
        //     this.$message({
        //       message: this.$t(`interact.interact_1013`),
        //       showClose: true,
        //       type: 'warning',
        //       customClass: 'zdy-info-box'
        //     });
        //     this.subscribeStream();
        //   }
        // });
        // 主持人进入小组（开始讨论/继续讨论）如果正在演示桌面共享，需要停止共享
        this.groupServer.$on(this.groupServer.EVENT_TYPE.ENTER_GROUP_FROM_MAIN, () => {
          if (
            this.roleName == 1 &&
            this.isShareScreen &&
            this.accountId == this.desktopShareInfo.accountId
          ) {
            this.stopShare('ENTER_GROUP_FROM_MAIN');
          }
        });
        useMsgServer().$onMsg('ROOM_MSG', msg => {
          // 主讲人变更 | 主画面变更
          if (msg.data.type == 'vrtc_big_screen_set') {
            // 小组中，组长变更不会停止桌面共享
            if (this.isInGroup) return;
            // 自己正在发起桌面共享
            if (
              this.isShareScreen &&
              this.accountId == this.desktopShareInfo.accountId &&
              msg.data.target_id != this.accountId
            ) {
              this.stopShare('vrtc_big_screen_set');
            }
          }
          // 演示着变更
          if (msg.data.type === 'vrtc_presentation_screen_set') {
            // 自己正在发起桌面共享
            if (
              this.isShareScreen &&
              this.accountId == this.desktopShareInfo.accountId &&
              msg.data.target_id != this.accountId
            ) {
              this.stopShare('vrtc_presentation_screen_set');
            }
          }
          if (
            [
              'group_manager_enter',
              'group_switch_proceed',
              'group_switch_end',
              'group_switch_stop'
            ].includes(msg.data.type)
          ) {
            console.table({
              name: '桌面共享-分组讨论',
              type: msg.data.type,
              data: JSON.stringify(msg.data),
              role: this.roleName,
              isInGroup: this.isInGroup,
              isShareScreen: this.isShareScreen,
              accountId: this.accountId == this.desktopShareInfo.accountId
            });
          }
          // 暂停 + 结束 讨论,需要停止共享
          if (msg.data.type === 'group_switch_end' || msg.data.type === 'group_switch_stop') {
            if (
              this.isInGroup &&
              this.isShareScreen &&
              this.accountId == this.desktopShareInfo.accountId
            ) {
              this.stopShare(msg.data.type);
            }
          }

          // 桌面共享关闭消息
          if (msg.data.type === 'desktop_sharing_disable') {
            if (this.isNoDelay == 0 && !useMicServer().getSpeakerStatus()) {
              const { miniElement } = useRoomBaseServer().state;
              const { switchStatus } = useDocServer().state;
              if (miniElement === 'player' || !switchStatus) return;

              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitClickExchangeView')
              );
            }
            useRoomBaseServer().setInavToolStatus('is_desktop', 0);
          }

          // 桌面共享开启消息
          if (msg.data.type === 'desktop_sharing_open') {
            if (this.isNoDelay == 0 && !useMicServer().getSpeakerStatus()) {
              const { miniElement } = useRoomBaseServer().state;
              const { switchStatus } = useDocServer().state;
              if (miniElement === 'doc' || !switchStatus) return;

              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitClickExchangeView')
              );
            }
            useRoomBaseServer().setInavToolStatus('is_desktop', 1);
          }
        });
      },
      // 桌面共享切换全屏
      fullscreen() {
        if (!this.isFullscreen) {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.isShareScreen,
              vNode: 'vmp-desktop-screen'
            })
            .then(() => {
              this.isFullscreen = true;
            });
        } else {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.isShareScreen,
              vNode: 'vmp-desktop-screen'
            })
            .then(() => {
              this.isFullscreen = false;
            });
        }
      },
      // 订阅流
      subscribeStream() {
        let videoNode = 'vmp-desktop-screen-subscribe';
        document.getElementById(videoNode).innerHTML = '';
        const opt = {
          videoNode, // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };

        return this.desktopShareServer.subscribeDesktopShareStream(opt);
      },
      showConfirm() {
        if (!this.isShareScreen) {
          this.popAlert.visible = true;
          window.vhallReportForProduct?.toReport(110241);
          window.vhallReportForProduct?.toReport(110247);
        } else {
          window.vhallReportForProduct?.toReport(110256);
          this.stopShare('live_over');
        }
      },
      // 提示xxx正在插播文件，请稍后重试
      alertInsertWarning() {
        this.$alert(
          `${this.$getRoleName(this.insertStreamInfo.userInfo.role)}${
            this.insertStreamInfo.userInfo.role != 1 ? this.insertStreamInfo.userInfo.nickname : ''
          }正在插播文件，请稍后重试`,
          '',
          {
            title: '提示',
            confirmButtonText: '确定',
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
          }
        );
      },
      // 开始共享
      startShare() {
        this.closeConfirm();
        // 点击弹出框 - 确定的时候判断
        if (this.isInsertFilePushing) {
          this.alertInsertWarning();
          return;
        }
        const configuredProfile = this.mediaSettingServer.state.screenRate;
        let profile = VhallRTC.RTC_SCREEN_PROFILE_1080P_16x9_M;
        if (configuredProfile) {
          profile = VhallRTC[configuredProfile];
        }
        const options = {
          videoNode: 'vmp-desktop-screen-publish', // 传入本地视频显示容器，必填
          profile, // 自定义分辨率，使用分辨率模板，选填，与videoQuality参数互斥，优先使用profile参数，推荐使用。
          videoContentHint:
            sessionStorage.getItem('selectedScreenRate') == 'RTC_SCREEN_PROFILE_1080P_16x9_H'
              ? 'motion'
              : 'detail'
        };
        this.desktopShareServer
          .startShareScreen(options)
          .then(() => {
            // console.log('当前是否正在插播', this.isInsertFilePushing, this.isShareScreen);
            if (this.isInsertFilePushing && this.isShareScreen) {
              this.alertInsertWarning();
              this.desktopShareServer.endStartShareScreen({
                streamId: this.isShareScreen
              });
            } else {
              window.vhallReportForProduct?.toReport(110251);
              window.vhallReportForProduct?.toStartReporting(110254, 110255);
              this.desktopShareServer
                .publishDesktopShareStream()
                .then(res => {
                  // 重新布局旁路
                  console.log('[screen] 桌面共享推流成功');
                  this.interactiveServer.resetLayout();
                  this.docServer.resetLayoutByMiniElement();

                  this.setDesktop('1');
                  window.vhallReportForProduct?.toResultsReporting(110255, {
                    request_id: res?.request_id,
                    event_type: 'interface',
                    res
                  });
                })
                .catch(error => {
                  console.log(error, this.$t('interact.interact_1021'));
                });
            }
          })
          .catch(error => {
            console.error('[screen] 桌面共享创建本地流失败', error);
            if (error?.name == 'NotAllowed') {
              if (/macintosh|mac os x/i.test(navigator.userAgent)) {
                this.isShowAccessDeniedAlert = true;
              }
            }
          });
      },
      // 停止共享
      async stopShare(source) {
        window.vhallReportForProduct?.toStartReporting(110259, 110260, {
          source
        });
        await this.desktopShareServer.stopShareScreen();
        this.setDesktop('0');
        this.interactiveServer.resetLayout();
        this.docServer.resetLayoutByMiniElement();
        if (source == 'vrtc_big_screen_set') {
          this.roomBaseServer.setChangeElement('stream-list');
        }
      },
      // 桌面共享开启并且白板或者文档观众可见状态时观看端视频最大化
      setDesktop(status) {
        if (this.isWatch || !useDocServer().state.switchStatus) return;
        this.interactiveServer.setDesktop({ status });
      },
      // 关闭弹窗
      closeConfirm() {
        window.vhallReportForProduct?.toReport(110252);
        this.popAlert.visible = false;
      },
      //结束演示
      handleEndDemonstrate() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickEndDemonstrate'));
      },
      exchangeVideoDocs() {
        if (this.miniElement == 'screen') {
          if (this.currentCid) {
            this.roomBaseServer.setChangeElement('doc');
          } else {
            this.roomBaseServer.setChangeElement('stream-list');
          }
        } else {
          this.roomBaseServer.setChangeElement('screen');
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-desktop-screen {
    background: #2d2d2d;
    position: relative;
    display: flex;
    #vmp-desktop-screen-subscribe {
      width: 100%;
      height: 100%;
    }
    &.share-screen {
      width: 100%;
      height: 100%;
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
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      & > i {
        width: 124px;
        height: 86px;
        background: url('./img/desktop-share.png');
        background-repeat: no-repeat;
        background-size: 100%;
      }

      & > p {
        text-align: center;
        font-size: 16px;
        color: #999;
      }
    }

    &-exchange {
      position: absolute;
      top: 10px;
      z-index: 9;
      right: 8px;
      width: 32px;
      height: 32px;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.8s;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      cursor: pointer;
      p {
        text-align: center;
      }
      span {
        display: inline-block;
        text-align: right;
        font-size: 14px;
      }
      i {
        font-size: 16px;
        color: #e6e6e6;
        opacity: 1;
        cursor: pointer;
        &:hover {
          color: #fb3a32;
        }
      }
    }

    &__full {
      .vmp-desktop-screen-mask {
        height: 25px;
        bottom: 16px;
        top: auto;
        opacity: 1;
        background: none;
      }
    }

    &-mask {
      opacity: 0;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        opacity: 1;
      }
      p {
        width: 100%;
        color: #fff;
        text-align: center;
      }
      a {
        display: inline-block;
        color: #fff;
        font-size: 16px;
        width: 32px;
        height: 32px;
        line-height: 32px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 100%;
        margin-right: 10px;
        &:hover {
          background: #fb3a32;
        }
        &.iconsheweizhujiangren {
          font-size: 14px;
        }
      }
    }

    // 发起端结束演示按钮
    .end-demonstrate {
      position: absolute;
      z-index: 3;
      top: 10px;
      right: 20px;
      background: transparent;
      border-radius: 97px;
      border: 1px solid #666;
      color: #fff;
      cursor: pointer;
      &:hover {
        background: #fb3a32;
        border-color: #fb3a32;
        color: #fff;
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
    &.is-embed {
      width: calc(100% - 360px);
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
