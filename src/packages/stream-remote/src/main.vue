<template>
  <div
    class="vmp-stream-remote"
    :class="{ fullscreen: isFullScreen }"
    :id="`vmp-stream-remote__${stream.streamId}`"
  >
    <!-- 流容器 -->
    <div class="vmp-stream-remote__container" :id="`stream-${stream.streamId}`"></div>
    <!-- videoMuted 的时候显示流占位图; 开启分屏的时候显示分屏占位图 -->
    <section
      v-if="stream.videoMuted || isShowSplitScreenPlaceholder"
      class="vmp-stream-remote__container__placeholder"
      :class="{
        'vmp-stream-remote__container__placeholder-spliting': isShowSplitScreenPlaceholder,
        'vmp-stream-remote__container__placeholder-mute':
          stream.videoMuted && !isShowSplitScreenPlaceholder
      }"
    ></section>

    <!-- 音频直播的的时候显示流占位图 -->
    <section v-if="liveMode == 1" class="vmp-stream-remote__container__audio"></section>

    <!-- 顶部流消息 -->
    <section class="vmp-stream-local__top">
      <div v-show="isShowPresentationScreen" class="vmp-stream-local__top-presentation">演示中</div>
    </section>

    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bottom" v-show="stream.streamId">
      <span
        v-show="showRole"
        class="vmp-stream-local__bottom-role"
        :class="`vmp-stream-local__bottom-role__${stream.attributes.roleName}`"
      >
        {{ stream.attributes.roleName | roleFilter }}
      </span>
      <span
        class="vmp-stream-local__bottom-nickname"
        :class="{
          'vmp-stream-local__bottom-nickname-width': showRole
        }"
      >
        {{ stream.attributes.nickname }}
      </span>
      <span
        class="vmp-stream-local__bottom-signal"
        :class="`vmp-stream-local__bottom-signal__${networkStatus}`"
      ></span>
      <span
        class="vmp-stream-local__bottom-mic vh-iconfont"
        :class="stream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`"
      ></span>
    </section>

    <!-- 网络异常时占位图，根据是否有streamId判断 -->
    <section
      v-if="isShowNetError && !stream.streamId && isInstanceInit"
      class="vmp-stream-remote__container__net-error"
    >
      <div class="net-error-img"></div>
      <p>{{ $t('interact.interact_1035') }}</p>
    </section>
    <!-- {{ joinInfo.role_name }} -- {{ groupRole }} -->
    <!-- 鼠标 hover 遮罩层 -->
    <section v-if="mainScreen == stream.accountId" class="vmp-stream-remote__shadow-box">
      <p
        v-if="joinInfo.role_name == 1 || (isInGroup && groupRole == 20)"
        class="vmp-stream-remote__shadow-first-line"
      >
        <span
          v-if="[1, 3, 4].includes(stream.attributes.roleName)"
          class="vmp-stream-local__shadow-label"
        >
          {{ stream.attributes.roleName | roleFilter }}
        </span>

        <el-tooltip
          :content="stream.videoMuted ? $t('interact.interact_1022') : $t('interact.interact_1006')"
          placement="top"
        >
          <span
            class="vmp-stream-remote__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              stream.videoMuted
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>

        <el-tooltip
          :content="stream.audioMuted ? $t('interact.interact_1015') : $t('interact.interact_1005')"
          placement="top"
        >
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              stream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
            "
          ></span>
        </el-tooltip>
      </p>

      <p class="vmp-stream-remote__shadow-second-line" v-if="liveMode != 1">
        <span v-if="[1, 3, 4].includes(joinInfo.role_name)" class="vmp-stream-local__shadow-label">
          视图
        </span>

        <el-tooltip content="切换" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-line-copy-document"
            v-if="miniElement && !isFullScreen"
            @click="exchange"
          ></span>
        </el-tooltip>

        <el-tooltip
          :content="isFullScreen ? $t('doc.doc_1009') : $t('doc.doc_1010')"
          placement="bottom"
        >
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            :class="{
              'vh-line-amplification': !isFullScreen,
              'vh-line-narrow': isFullScreen
            }"
            v-show="stream.streamId"
            @click="fullScreen"
          ></span>
        </el-tooltip>

        <!-- 主持人和组长不能互相下麦 或者 嘉宾为主讲人且不是主画面时 -->
        <el-tooltip :content="$t('interact.interact_1007')" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            v-if="
              guestHasInvitePer
                ? stream.attributes.hasOwnProperty('role') && stream.attributes.role !== ''
                  ? +stream.attributes.role != 1
                  : +stream.attributes.roleName != 1
                : isShowDownMicBtn
            "
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>
    </section>

    <section v-else class="vmp-stream-remote__shadow-box">
      <p
        v-if="joinInfo.role_name == 1 || (isInGroup && groupRole == 20)"
        class="vmp-stream-remote__shadow-first-line"
      >
        <el-tooltip
          :content="stream.videoMuted ? $t('interact.interact_1022') : $t('interact.interact_1006')"
          placement="top"
        >
          <span
            class="vmp-stream-remote__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              stream.videoMuted
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>

        <el-tooltip
          :content="stream.audioMuted ? $t('interact.interact_1015') : $t('interact.interact_1005')"
          placement="top"
        >
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              stream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
            "
          ></span>
        </el-tooltip>
        <!--
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="joinInfo.role_name != 1 && stream.attributes.roleName != 20"
          ></span>
        </el-tooltip> -->
      </p>
      <p
        v-else-if="
          guestHasInvitePer &&
          (stream.attributes.hasOwnProperty('role') && stream.attributes.role !== ''
            ? +stream.attributes.role != 1
            : +stream.attributes.roleName != 1)
        "
      >
        <el-tooltip :content="$t('interact.interact_1007')" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>

      <p
        v-if="joinInfo.role_name == 1 || (isInGroup && groupRole == 20)"
        class="vmp-stream-remote__shadow-second-line"
      >
        <el-tooltip content="设为主讲人" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
            v-show="
              !isInGroup &&
              (stream.attributes.roleName == 4 ||
                stream.attributes.roleName == 1 ||
                stream.attributes.role == 4)
            "
            @click="setOwner(true)"
          ></span>
        </el-tooltip>

        <!-- 设为主画面 -->
        <el-tooltip content="设为主画面" placement="bottom">
          <span
            v-show="isShowSetMainScreenBtn"
            @click="setMainScreen(true)"
            class="vmp-stream-remote__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
          ></span>
        </el-tooltip>

        <el-tooltip :content="$t('interact.interact_1007')" placement="bottom">
          <span
            v-show="isShowDownMicBtn"
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>
    </section>
    <!-- 设置主画面弹窗 -->
    <saas-alert
      :visible="popAlert.visible"
      :confirm="popAlert.confirm"
      :knowText="'知道了'"
      :confirmText="'继续'"
      :cancelText="'取消'"
      @onSubmit="stopShareOrInsert"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">{{ popAlert.text }}</main>
    </saas-alert>

    <!-- VmpBasicCenterContainer 组件内还有一个占位图 -->
    <!-- <section class="vmp-stream-remote__pause" v-show="isSafari && showInterIsPlay">
      <img :src="coverImgUrl" :class="`vmp-stream-remote__pause-${coverImageMode}`" alt />
      <p @click.stop="replayPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </section> -->
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useMicServer,
    useRoomBaseServer,
    useMsgServer
  } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '@/app-shared/utils/stream-utils';
  import { cropperImage } from '@/app-shared/utils/common';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpStreamRemote',
    data() {
      return {
        audioLevel: 1,
        networkStatus: 0,
        isFullScreen: false,
        isShowNetError: false,
        timmer: null,
        isSafari: navigator.userAgent.match(/Version\/([\d.]+).*Safari/),
        popAlert: {
          text: '切换主讲人或主画面将中断插播视频或桌面共享操作，是否继续？',
          visible: false,
          confirm: true,
          type: 'main', // main:主画面；presenter:主讲人
          accountId: null
        }
      };
    },
    props: {
      stream: {
        require: true,
        default: () => {}
      }
    },
    components: {
      SaasAlert
    },
    watch: {
      'stream.streamId': {
        handler(newval) {
          console.log('----speaker--- 有流Id了------', newval);
          console.log('[mic server] speakerlist', JSON.stringify(useMicServer().state.speakerList));
          if (newval) {
            this.$nextTick(() => {
              this.subscribeRemoteStream();
            });
          }
        },
        immediate: true
      }
    },
    computed: {
      isInstanceInit() {
        return this.$domainStore.state.interactiveServer.isInstanceInit;
      },
      liveMode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      //默认的主持人id
      hostId() {
        const { watchInitData = {} } = this.$domainStore.state.roomBaseServer;
        const { webinar = {} } = watchInitData;
        return webinar?.userinfo?.user_id;
      },
      //当前的组长id
      groupLeaderId() {
        return this.$domainStore.state.groupServer.groupInitData.doc_permission;
      },
      // 小组内角色，20为组长
      groupRole() {
        return this.$domainStore.state.groupServer.groupInitData?.join_role;
      },
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      },
      mainScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.main_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
        }
      },
      // 文档演示者的ID
      presentationScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.presentation_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.presentation_screen;
        }
      },
      //显示是否在演示中
      isShowPresentationScreen() {
        const { accountId } = this.stream;
        const sameId = this.presentationScreen === accountId; // 演示者ID为当前流的用户ID
        const isGroupMode = this.liveMode == 6; // 分组类型
        const inMainRoomUser = !this.isInGroup && accountId != this.hostId; // 在主房间且不是主持人
        const inGroupRoomUser = this.isInGroup && accountId != this.groupLeaderId; // 在分组房间且不是组长
        const allowedUser = inMainRoomUser || inGroupRoomUser; // 普通用户
        return sameId && isGroupMode && allowedUser;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      // 封面图
      coverImgUrl() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.img_url;
      },
      // 主屏 + 播放按钮状态 + 观众 + （无延迟直播 || 未开启自动上麦的分组直播）
      showInterIsPlay() {
        return (
          this.mainScreen == this.stream.accountId &&
          this.interactiveServer.state.showPlayIcon &&
          this.joinInfo.role_name == 2 &&
          ((this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar == 1 &&
            this.liveMode != 6) ||
            (this.liveMode == 6 &&
              this.$domainStore.state.roomBaseServer.interactToolStatus.auto_speak == 0))
        );
      },
      isShowSplitScreenPlaceholder() {
        return (
          this.$domainStore.state.splitScreenServer.isOpenSplitScreen &&
          this.$domainStore.state.splitScreenServer.role == 'hostPage'
        );
      },
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      // 主持人、组长是否显示下麦按钮
      isShowDownMicBtn() {
        return (
          (this.joinInfo.role_name == 1 && this.stream.accountId != this.groupLeaderId) ||
          (this.isInGroup && this.groupRole == 20 && this.stream.roleName != 1)
        );
      },
      isShowSetMainScreenBtn() {
        if (this.isInGroup) {
          return true;
        } else {
          return (
            this.stream.roleName == 2 || (this.joinInfo.role_name == 1 && this.stream.roleName != 4)
          );
        }
      },
      showRole() {
        return [1, 3, 4].includes(this.stream.attributes.roleName) && this.isInGroup;
      },
      // 嘉宾为当前主讲人时是否有邀请上麦的权限
      guestHasInvitePer() {
        let room = this.$domainStore.state.roomBaseServer;
        return (
          room.configList?.speak_manage == 1 &&
          room.interactToolStatus.doc_permission == this.joinInfo.third_party_user_id &&
          this.joinInfo.role_name == 4
        );
      },
      accountId() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id;
      },
      desktopShareInfo() {
        return this.$domainStore.state.desktopShareServer.desktopShareInfo;
      },
      // 是否是当前用户插播
      isCurrentRoleInsert() {
        return (
          // 当前正在插播，插播人id等于当前用户id
          this.$domainStore.state.insertFileServer.isInsertFilePushing &&
          this.$domainStore.state.insertFileServer.insertStreamInfo.userInfo.accountId ==
            this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id
        );
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
    },
    created() {
      this.listenEvents();
      setTimeout(() => {
        if (!this.stream.streamId) {
          this.isShowNetError = true;
        }
      }, 5000);
    },
    mounted() {},
    beforeDestroy() {
      // 清空计时器
      if (this._audioLeveInterval) {
        clearInterval(this._audioLeveInterval);
      }
      if (this._netWorkStatusInterval) {
        clearInterval(this._netWorkStatusInterval);
      }

      useMsgServer().$offMsg('JOIN', this.handleUserJoin);
      useMsgServer().$offMsg('LEFT', this.handleUserLeave);
    },
    methods: {
      // 停止桌面共享或插播
      stopShareOrInsert() {
        if (this.isShareScreen && this.accountId == this.desktopShareInfo.accountId) {
          // 自己正在发起桌面共享
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickStopShare', 'setMainScreen')
          );
        } else if (this.isCurrentRoleInsert) {
          // 正在插播
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickStopInsert'));
        }
        if (this.popAlert.type == 'main') {
          this.setMainScreen();
        } else {
          this.setOwner();
        }
        this.popAlert.visible = false;
      },
      // 关闭弹窗
      closeConfirm() {
        this.popAlert.visible = false;
      },
      listenEvents() {
        this.micServer.$on('live_over', () => {
          clearInterval(this._audioLeveInterval);
          clearInterval(this._netWorkStatusInterval);
        });

        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              // 离开全屏
              this.isFullScreen = false;
            }
          },
          true
        );

        this.interactiveServer.$on('EVENT_REMOTESTREAM_FAILED', e => {
          if (e.data.accountId == this.stream.accountId) {
            this.isShowNetError = true;
            // this.$message({
            //   message: this.$t(`interact.interact_1014`, { n: this.stream.nickname }),
            //   showClose: true,
            //   type: 'warning',
            //   customClass: 'zdy-info-box'
            // });
            // this.subscribeRemoteStream();
          }
        });

        // 加入房间
        useMsgServer().$onMsg('JOIN', this.handleUserJoin);
        useMsgServer().$onMsg('LEFT', this.handleUserLeave);
        // 下麦成功 退出全屏
        this.micServer.$on('vrtc_disconnect_success', msg => {
          if (
            this.isFullScreen &&
            this.liveMode == 3 &&
            this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar != 1
          ) {
            this.interactiveServer
              .exitStreamFullscreen({
                streamId: this.stream.streamId,
                vNode: `vmp-stream-remote__${this.stream.streamId}`
              })
              .then(() => {
                this.isFullScreen = false;
              });
          }
        });
      },

      // 监听离开加入房间事件，显示网络异常占位图
      handleUserJoin(msg) {
        if (msg.sender_id == this.stream.accountId) {
          this.isShowNetError = false;
        }
      },
      handleUserLeave(msg) {
        if (msg.sender_id == this.stream.accountId) {
          this.isShowNetError = true;
        }
      },
      // 恢复播放
      replayPlay() {
        clearTimeout(this.timmer);
        const _this = this;
        function videoPlay(video) {
          video
            .play()
            .then(res => {
              console.log('play-res-', res, _this.interactiveServer.state.showPlayIcon);
              if (_this.interactiveServer.state.showPlayIcon) {
                _this.interactiveServer.state.showPlayIcon = false;
              }
            })
            .catch(err => {
              console.log('play-err-', err);
              if (err.name == 'NotAllowedError' || err.name == 'NotSupportedError') {
                _this.interactiveServer.state.showPlayIcon = true;
              }
            });
        }
        let videos = document.querySelectorAll('.vmp-stream-remote video');
        let localVideo = document.querySelectorAll('.vmp-stream-local video')[0];

        if (localVideo && this.joinInfo.role_name == 2) {
          videoPlay(localVideo);
        }
        videos.length > 0 &&
          videos.forEach(video => {
            videoPlay(video);
          });
      },
      async subscribeRemoteStream() {
        await this.checkVRTCInstance();
        let videoNode = `stream-${this.stream.streamId}`;
        document.getElementById(videoNode).innerHTML = '';
        // TODO:主屏订阅大流，小窗订阅小流
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode // 远端流显示容器， 必填
          // dual: this.mainScreen == this.accountId ? 1 : 0 // 双流订阅选项， 0 为小流 ， 1 为大流  选填。 默认为 1
        };

        console.log('订阅参数', opt, this.stream);
        window.vhallReportForProduct?.toStartReporting(110198, 110166, {
          opt
        });
        this.interactiveServer
          .subscribe(opt)
          .then(e => {
            console.log('订阅成功--1--', e);
            window.vhallReportForProduct?.toResultsReporting(110166, { res: e });
            if (this.joinInfo.role_name === 1) {
              this.interactiveServer.resetLayout();
            }
            this.timmer = setTimeout(() => {
              this.replayPlay();
              // 开始测试100ms，刷新页面还是有订阅流不播放的情况。所以改为和原线上代码一致2s
            }, 2000);
            this.getLevel();
          })
          .catch(e => {
            window.vhallReportForProduct?.toResultsReporting(110166, { res: e });
            console.log('订阅失败----', e); // object 类型， { code:错误码, message:"", data:{} }
          });
      },
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        const status = this.stream[`${deviceType}Muted`] ? 1 : 0;
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.stream.accountId
        });
        // 110136关闭    110137 开启
        if (deviceType == 'video') {
          window.vhallReportForProduct?.report(status == 1 ? 110137 : 110136);
        } else {
          // 110138 关闭    110139 开启
          window.vhallReportForProduct?.report(status == 1 ? 110139 : 110138);
        }
      },
      async speakOff() {
        if (
          this.joinInfo.role_name == 1 &&
          (this.stream.roleName == 4 || this.stream.roleName == 2)
        ) {
          window.vhallReportForProduct?.toStartReporting(110133, 110157, {
            expelled_role: this.stream.roleName,
            info_of_expelleds: { ...this.stream }
          });
        }
        const res = await this.micServer.speakOff({
          receive_account_id: this.stream.accountId
        });
        if (
          this.joinInfo.role_name == 1 &&
          (this.stream.roleName == 4 || this.stream.roleName == 2)
        ) {
          window.vhallReportForProduct?.toResultsReporting(110157, {
            request_id: res?.request_id,
            event_type: 'interface',
            res
          });
        }
      },
      fullScreen() {
        if (!this.isFullScreen) {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.stream.streamId,
              vNode: `vmp-stream-remote__${this.stream.streamId}`
            })
            .then(() => {
              this.isFullScreen = true;
            });
        } else {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.stream.streamId,
              vNode: `vmp-stream-remote__${this.stream.streamId}`
            })
            .then(() => {
              this.isFullScreen = false;
            });
        }
      },
      // 切换大小窗
      exchange() {
        const roomBaseServer = useRoomBaseServer();
        let miniElement = '';
        if (this.isShareScreen) {
          if (
            this.presentationScreen != this.joinInfo.third_party_user_id ||
            this.joinInfo.role_name != 2
          ) {
            miniElement = roomBaseServer.state.miniElement == 'screen' ? 'stream-list' : 'screen';
          } else {
            miniElement = roomBaseServer.state.miniElement == 'doc' ? 'stream-list' : 'doc';
          }
        } else {
          miniElement = roomBaseServer.state.miniElement == 'doc' ? 'stream-list' : 'doc';
        }
        roomBaseServer.setChangeElement(miniElement);
        window.vhallReportForProduct?.report(110135);
      },
      getLevel() {
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (!this.stream.streamId || !this.$domainStore.state.interactiveServer.isInstanceInit)
            return clearInterval(this._audioLeveInterval);
          // 获取音量
          this.interactiveServer
            .getAudioLevel({ streamId: this.stream.streamId })
            .then(level => {
              this.audioLevel = calculateAudioLevel(level);
            })
            .catch(() => {
              clearInterval(this._audioLeveInterval);
              this.audioLevel = 0;
            });
        }, 1000);

        // 网络信号查询计时器
        this._netWorkStatusInterval = setInterval(() => {
          if (!this.stream.streamId || !this.$domainStore.state.interactiveServer.isInstanceInit)
            return clearInterval(this._netWorkStatusInterval);
          // 获取网络状态
          this.interactiveServer
            .getStreamPacketLoss({ streamId: this.stream.streamId })
            .then(status => {
              this.networkStatus = calculateNetworkStatus(status);
            })
            .catch(() => {
              clearInterval(this._netWorkStatusInterval);
              this.networkStatus = 0;
            });
        }, 2000);
      },

      /**
       * 设置主讲人
       * @param {Number | String} accountId 用户ID
       * @Function void()
       */
      setOwner(alert, setMainScreen = true) {
        if (alert) {
          const stream = this.interactiveServer.getDesktopAndIntercutInfo();
          if (stream) {
            this.popAlert.visible = true;
            this.popAlert.type = 'presenter';
            return;
          }
        }

        window.vhallReportForProduct?.toStartReporting(110169, [110170, 110171], {
          rejection_method: encodeURIComponent('流画面处设置嘉宾为主讲人'),
          guest_info: this.stream
        });
        if (setMainScreen) {
          this.setMainScreen();
        }
        this.interactiveServer
          .setSpeaker({
            receive_account_id: this.stream.accountId
          })
          .then(res => {
            window.vhallReportForProduct?.toResultsReporting(110170, {
              request_id: res?.request_id,
              event_type: 'interface',
              res
            });
            console.log('setSpeaker success ::', res);
          })
          .catch(err => {
            console.error('setSpeaker failed ::', err);
          });
      },

      //  设为主画面
      setMainScreen(opt) {
        if (opt) {
          // 若当前在桌面共享或插播，不允许设置主画面
          const stream = this.interactiveServer.getDesktopAndIntercutInfo();
          if (stream) {
            this.popAlert.visible = true;
            this.popAlert.type = 'main';
            return;
          }
        }
        this.interactiveServer
          .setMainScreen({
            receive_account_id: this.stream.accountId
          })
          .then(res => {
            console.log('setmainscreen success ::', res);
          })
          .catch(err => {
            console.error('setmainscreen failed ::', err);
          });
      },
      /**
       * 开始讨论/结束讨论时，会重新初始化互动，此时可能会有其他流加入订阅，而互动实例不存在的情况
       */
      checkVRTCInstance() {
        return new Promise((resolve, reject) => {
          let count = 0;
          const timer = setInterval(() => {
            if (this.interactiveServer.interactiveInstance) {
              resolve();
              clearInterval(timer);
            } else {
              count++;
              console.log('checkVRTCInstance count', count);
              if (count > 20) {
                clearInterval(timer);
                console.error('互动实例不存在');
                reject();
              }
            }
          }, 130);
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-remote {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    position: relative;
    &:hover {
      .vmp-stream-remote__shadow-box {
        display: flex;
      }
    }
    &.fullscreen {
      .vmp-stream-remote__shadow-box {
        display: flex;
        height: 24px;
        bottom: 0;
        flex-direction: row;
        top: auto;
        background: rgba(0, 0, 0, 0);
        .vmp-stream-remote__shadow-icon {
          background: none;
          &:hover {
            background-color: #fb3a32;
          }
        }
      }
    }
    .vmp-stream-remote__container {
      width: 100%;
      height: 100%;
    }
    .vmp-stream-remote__container__placeholder {
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      &-mute {
        background-image: url(./img/no_video_bg.png);
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      }
      &-spliting {
        background-color: #2d2d2d;
        background-image: url(./img/split.png);
        background-size: 80px 52px;
        background-position: center;
      }
    }

    .vmp-stream-remote__container__audio {
      background-image: url(./img/audio.gif);
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    // 网络异常占位图
    .vmp-stream-remote__container__net-error {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      background-color: #000;
      .net-error-img {
        width: 25px;
        height: 19px;
        margin-bottom: 1px;
        background-image: url('./img/net-error.png');
        background-size: contain;
        background-repeat: no-repeat;
      }
      & > p {
        font-size: 12px;
        color: #ccc;
      }
    }

    .vmp-stream-local__bottom {
      width: 100%;
      height: 24px;
      font-size: 12px;
      line-height: 24px;
      color: #ffffff;
      box-sizing: border-box;
      padding: 0 6px;
      position: absolute;
      bottom: 0;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
      overflow: hidden;
      &-role {
        display: inline-flex;
        height: 14px;
        margin-top: 5px;
        align-items: center;

        border-radius: 8px;
        padding: 0 4px;
        vertical-align: top;
        // 主持人
        &__1 {
          background: rgba(251, 58, 50, 0.2);
          color: #fb3a32;
        }
        // 观众
        &__2 {
          background: rgba(251, 58, 50, 0.2);
          color: #fb3a32;
        }
        // 助理
        &__3 {
          background-color: rgba(53, 98, 250, 0.2);
          color: #3562fa;
        }
        // 嘉宾
        &__4 {
          background-color: rgba(53, 98, 250, 0.2);
          color: #3562fa;
        }
      }
      &-nickname {
        display: inline-block;
        width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &-width {
          width: 40px;
        }
      }
      &-mic {
        float: right;
        font-size: 13px;
      }
      &-signal {
        float: right;
        font-size: 12px;
        margin-left: 5px;
        margin-top: 4px;
        background-size: contain;
        height: 16px;
        width: 16px;
        background-image: url(./img/network0.png);
        &__0 {
          background-image: url(./img/network0.png);
        }
        &__1 {
          background-image: url(./img/network1.png);
        }
        &__2 {
          background-image: url(./img/network2.png);
        }
      }
    }
    .vmp-stream-local__top {
      pointer-events: none;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      &-presentation {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 12px;
        color: @font-dark-normal;
        padding: 0 8px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        margin: 4px 0 0 4px;
        overflow: hidden;
        text-align: left;
      }
    }

    // 遮罩层样式
    .vmp-stream-remote__shadow-box {
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .vmp-stream-remote__shadow-first-line {
        line-height: 36px;
      }
      .vmp-stream-remote__shadow-second-line {
        line-height: 36px;
      }
      .vmp-stream-local__shadow-label {
        display: inline-block;
        width: 54px;
        margin-right: 10px;
        text-align: right;
        color: #ffffff;
        font-size: 12px;
      }
      .vmp-stream-remote__shadow-icon {
        cursor: pointer;
        text-align: center;
        display: inline-block;
        color: #fff;
        font-size: 16px;
        width: 28px;
        height: 28px;
        line-height: 28px;
        background: hsla(0, 0%, 100%, 0.3);
        border-radius: 100%;
        margin-right: 10px;

        &.vh-line-copy-document {
          font-size: 14px;
        }
        &:hover {
          background-color: #fb3a32;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }

    // 暂停按钮
    &__pause {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 6;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      img {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
      p {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 32px;
          color: #f5f5f5;
        }
      }
    }
  }
</style>
