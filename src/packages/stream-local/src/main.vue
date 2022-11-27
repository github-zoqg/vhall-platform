<template>
  <div
    :id="`vmp-stream-local__${joinInfo.third_party_user_id}`"
    class="vmp-stream-local"
    :class="{
      'vmp-stream-local__publish': localSpeaker.streamId || isRecording,
      fullscreen: isFullScreen
    }"
  >
    <!-- 流容器 -->
    <section
      class="vmp-stream-local__stream-box"
      :id="`stream-${joinInfo.third_party_user_id}`"
    ></section>
    <div v-if="initLocalSpeaker.streamId && liveStatus != 1" class="init-pop-scroll">
      <p class="content">
        <span>直播未开始，摄像头和麦克风仅自己可见</span>
      </p>
    </div>
    <!-- videoMuted 的时候显示流占位图; 开启分屏的时候显示分屏占位图 -->
    <section
      v-if="(localSpeaker.videoMuted || isShowSplitScreenPlaceholder) && mode != 1"
      class="vmp-stream-local__stream-box__placeholder"
      :class="{
        'vmp-stream-local__stream-box__placeholder-spliting': isShowSplitScreenPlaceholder,
        'vmp-stream-local__stream-box__placeholder-mute':
          localSpeaker.videoMuted && !isShowSplitScreenPlaceholder
      }"
    ></section>

    <!-- 主持人 - 直播未开始 ， 音频直播 ， 音频直播 结束 遮罩图 -->
    <section
      v-if="joinInfo.role_name == 1 && mode == 1"
      :class="
        liveStatus == 1
          ? 'vmp-stream-local__stream-box__audio'
          : 'vmp-stream-local__stream-box__audio--beforestart'
      "
    >
      <div class="vmp-stream-local__stream-box__audio--bg">
        <span></span>
      </div>
    </section>

    <!-- 顶部流消息 -->
    <section class="vmp-stream-local__top">
      <div v-show="isShowPresentationScreen" class="vmp-stream-local__top-presentation">演示中</div>
    </section>

    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bottom" v-show="localSpeaker.streamId && !isThirdStream">
      <span
        v-show="showRole"
        class="vmp-stream-local__bottom-role"
        :class="`vmp-stream-local__bottom-role__${joinInfo.role_name}`"
      >
        {{ joinInfo.role_name | roleFilter }}
      </span>
      <span
        class="vmp-stream-local__bottom-nickname"
        :class="{
          'vmp-stream-local__bottom-nickname-width': showRole
        }"
      >
        {{ joinInfo.nickname }}
      </span>
      <span
        class="vmp-stream-local__bottom-signal"
        :class="`vmp-stream-local__bottom-signal__${networkStatus}`"
      ></span>
      <span
        class="vmp-stream-local__bottom-mic vh-iconfont"
        :class="
          localSpeaker.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
        "
      ></span>
    </section>
    <!-- 遮罩层 主屏-->
    <section
      v-if="
        mainScreen == joinInfo.third_party_user_id ||
        (initLocalSpeaker.streamId && [1, 4].includes(joinInfo.role_name) && liveStatus != 1)
      "
      class="vmp-stream-local__shadow-box"
      v-show="(isShowShadowBtn && !isThirdStream) || initLocalSpeaker.streamId"
    >
      <p class="vmp-stream-local__shadow-first-line">
        <el-tooltip
          v-if="[1, 3, 4].includes(joinInfo.role_name)"
          :content="joinInfo.role_name | roleFilter"
          placement="top"
        >
          <span class="vmp-stream-local__shadow-label">
            {{ joinInfo.role_name | roleFilter }}
          </span>
        </el-tooltip>
        <!-- <span class="vmp-stream-local__shadow-label">
          {{ joinInfo.role_name | roleFilter }}
        </span> -->
        <el-tooltip
          :content="
            localSpeaker.videoMuted ? $t('interact.interact_1022') : $t('interact.interact_1006')
          "
          placement="top"
        >
          <span
            class="vmp-stream-local__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              localSpeaker.videoMuted
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>

        <el-tooltip
          :content="
            localSpeaker.audioMuted ? $t('interact.interact_1015') : $t('interact.interact_1005')
          "
          placement="top"
        >
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              localSpeaker.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
            "
          ></span>
        </el-tooltip>

        <el-tooltip :content="$t('interact.interact_1007')" placement="top">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="
              isInGroup
                ? groupRole != 20
                : joinInfo.role_name == 2 || (joinInfo.role_name == 4 && liveStatus == 1)
            "
          ></span>
        </el-tooltip>
      </p>
      <p class="vmp-stream-local__shadow-second-line">
        <span v-if="[1, 3, 4].includes(joinInfo.role_name)" class="vmp-stream-local__shadow-label">
          视图
        </span>
        <el-tooltip content="切换" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont vh-line-copy-document"
            v-if="!isFullScreen && isShowExchangeBtn && liveStatus == 1"
            @click="exchange"
          ></span>
        </el-tooltip>
        <el-tooltip :content="isFullScreen ? '关闭全屏' : '全屏'" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont"
            :class="{
              'vh-line-amplification': !isFullScreen,
              'vh-line-narrow': isFullScreen
            }"
            v-show="localStreamId"
            @click="fullScreen"
          ></span>
        </el-tooltip>
      </p>
    </section>

    <!-- 遮罩层 非主屏-->
    <section v-show="isShowShadowBtn" v-else class="vmp-stream-local__shadow-box">
      <p class="vmp-stream-local__shadow-first-line">
        <el-tooltip
          :content="
            localSpeaker.videoMuted ? $t('interact.interact_1022') : $t('interact.interact_1006')
          "
          placement="top"
        >
          <span
            class="vmp-stream-local__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              localSpeaker.videoMuted
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>
        <el-tooltip
          :content="
            localSpeaker.audioMuted ? $t('interact.interact_1015') : $t('interact.interact_1005')
          "
          placement="top"
        >
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              localSpeaker.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
            "
          ></span>
        </el-tooltip>
        <el-tooltip :content="$t('interact.interact_1007')" placement="top">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="isInGroup ? groupRole != 20 : joinInfo.role_name != 1"
          ></span>
        </el-tooltip>
      </p>
      <p
        v-if="joinInfo.role_name == 1 || (groupRole == 20 && isInGroup)"
        class="vmp-stream-local__shadow-second-line"
      >
        <!-- 设为主讲人 -->
        <el-tooltip content="设为主讲人" v-if="mode != 6" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
            @click="setOwner(true)"
          ></span>
        </el-tooltip>

        <!-- 设为主画面 -->
        <el-tooltip content="设为主画面" v-else placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
            @click="setMainScreen(true)"
          ></span>
        </el-tooltip>
        <!-- <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
          ></span>
        </el-tooltip> -->
      </p>
    </section>

    <!-- 播放按钮 -->
    <!-- <section class="vmp-stream-local__pause" v-show="showInterIsPlay">
      <img :src="coverImgUrl" alt />
      <p @click.stop="replayPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </section> -->

    <ImgStream ref="imgPushStream"></ImgStream>

    <!-- 异常弹窗 -->
    <saas-alert
      :visible="PopAlertOffline.visible"
      :retry="'点击重试'"
      :isShowClose="false"
      @onClose="PopAlertOfflineClose"
      @onSubmit="PopAlertOfflineConfirm"
    >
      <div slot="content">
        <span>{{ PopAlertOffline.text }}</span>
      </div>
    </saas-alert>

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
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useMicServer,
    useRoomBaseServer,
    usePlayerServer,
    useGroupServer,
    useSplitScreenServer,
    useMediaCheckServer,
    useMediaSettingServer,
    useChatServer,
    useDocServer,
    useMsgServer,
    useVideoPollingServer,
    useCanvasStreamServer
  } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '@/app-shared/utils/stream-utils';
  import { boxEventOpitons, sleep } from '@/app-shared/utils/tool';
  import ImgStream from './components/img-stream/index.vue';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  export default {
    name: 'VmpStreamLocal',
    data() {
      return {
        isFullScreen: false,
        networkStatus: 2,
        audioLevel: 1,
        isNotAutoSpeak: false, // 分组模式下的是否为自动静音上麦自动

        // 网络异常弹窗状态
        PopAlertOffline: {
          visible: false,
          text: ''
        },
        pendingStream: false,
        popAlert: {
          text: '切换主讲人或主画面将中断插播视频或桌面共享操作，是否继续？',
          visible: false,
          confirm: true,
          type: 'main', // main:主画面；presenter:主讲人
          accountId: null
        }
      };
    },
    components: {
      ImgStream,
      SaasAlert
    },
    computed: {
      // 是否是正在录制录制
      isRecording() {
        // 录制中，也会将liveStatus置为1
        return this.$domainStore.state.roomBaseServer.watchInitData?.record?.is_recording;
      },
      // 主讲人权限
      doc_permission() {
        if (this.isInGroup) {
          return this.groupServer.state.groupInitData.doc_permission;
        } else {
          return this.roomBaseServer.state.interactToolStatus.doc_permission;
        }
      },
      // 文档是否对观众可见
      switchStatus() {
        return this.$domainStore.state.docServer.switchStatus;
      },
      // 是否展示切换按钮
      isShowExchangeBtn() {
        if (this.isInGroup) {
          return true;
        } else {
          return this.joinInfo.role_name != 2 ? true : this.switchStatus;
        }
      },
      // 直播类型 6分组
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      // 当前人插播的时候，不显示本地流的操作按钮
      isShowShadowBtn() {
        return (
          !this.$domainStore.state.insertFileServer.isInsertFilePushing ||
          this.$domainStore.state.insertFileServer.insertStreamInfo.userInfo.accountId !=
            this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id
        );
      },
      initLocalSpeaker() {
        return this.$domainStore.state.interactiveServer.localSpeaker;
      },
      localSpeaker() {
        const local = this.$domainStore.state.micServer.speakerList.find(
          item => item.accountId == this.joinInfo.third_party_user_id
        );
        console.log('-------localSpeaker更新--------', local, this.initLocalSpeaker);
        return (
          local ||
          (this.initLocalSpeaker.streamId ? this.initLocalSpeaker : {}) ||
          this.$domainStore.state.videoPollingServer.localPollinger ||
          {}
        );
      },
      remoteSpeakers() {
        return (
          this.$domainStore.state.micServer.speakerList.filter(
            item => item.accountId != this.joinInfo.third_party_user_id
          ) || []
        );
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

      // 在小组中
      isInGroup() {
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
        const { accountId } = this.localSpeaker;
        const sameId = this.presentationScreen === accountId; // 演示者ID为当前流的用户ID
        const groupMode = this.mode == 6; // 分组类型
        const inMainRoomUser = !this.isInGroup && accountId != this.hostId; // 在主房间且不是主持人
        const inGroupRoomUser = this.isInGroup && accountId != this.groupLeaderId; // 在分组房间且不是组长
        const allowedUser = inMainRoomUser || inGroupRoomUser; // 普通用户

        return sameId && groupMode && allowedUser;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 直播状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      liveStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      },
      // 无延迟直播
      isNoDelay() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      autoSpeak() {
        // 观众自动禁音上麦 =   自动上麦开启 + 分组活动 + 观众 + 不在麦上 + 非同意主持人的邀请上麦 + 非自己申请上麦
        if (this.groupRole == 20 && this.isInGroup) {
          return false;
        } else {
          return (
            this.$domainStore.state.roomBaseServer.interactToolStatus.auto_speak == 1 &&
            this.mode == 6 &&
            this.joinInfo.role_name == 2 &&
            !this.isNotAutoSpeak &&
            !this.micServer.getSpeakerStatus()
          );
        }
      },
      // 主屏 + 自动播放失败 + 观众 + 文档开启 => 此时，主屏画面在右上角
      showInterIsPlay() {
        return (
          this.mainScreen == this.joinInfo.third_party_user_id &&
          this.interactiveServer.state.showPlayIcon &&
          this.joinInfo.role_name == 2 &&
          this.mode === 6
        );
      },
      coverImgUrl() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.img_url;
      },
      // 是否显示分屏占位图
      isShowSplitScreenPlaceholder() {
        return (
          this.isOpenSplitScreen && this.$domainStore.state.splitScreenServer.role == 'hostPage'
        );
      },
      // 是否开启分屏
      isOpenSplitScreen() {
        return this.$domainStore.state.splitScreenServer.isOpenSplitScreen;
      },

      localStreamId() {
        return this.$domainStore.state.interactiveServer.localStream.streamId;
      },
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(this.roomBaseServer.state.clientType);
      },
      showRole() {
        return [1, 3, 4].includes(this.joinInfo.role_name) && this.isInGroup;
      },
      // 是否开启第三方推流
      isThirdStream() {
        return this.$domainStore.state.roomBaseServer.isThirdStream;
      },
      // 是否是上麦状态
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
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
      this.playerServer = usePlayerServer();
      this.groupServer = useGroupServer();
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
      this.splitScreenServer = useSplitScreenServer();
      this.videoPollingServer = useVideoPollingServer();
      this.mediaSettingServer = useMediaSettingServer();
    },
    created() {
      this.listenEvents();
    },
    async mounted() {
      // 轮训列表更新消息
      this.videoPollingServer.$on('VIDEO_POLLING_UPDATE', msg => {
        console.log('轮训列表更新消息', msg);
        this.videoStartPush({ type: 1 });
      });
      // 停止视频轮巡
      this.videoPollingServer.$on('VIDEO_POLLING_END', async msg => {
        const roomId = this.roomBaseServer.state.watchInitData.webinar.id;
        sessionStorage.setItem(`hasVideoPollingStart_${roomId}`, 0);
        sessionStorage.setItem(`pollingAgreeStatus_${roomId}`, 0);
        if (!this.isSpeakOn && this.joinInfo.role_name == 2) {
          await this.stopPush({ type: 'VIDEO_POLLING_END' });
          await this.interactiveServer.destroy();
          if (this.isNoDelay == 1) {
            await this.interactiveServer.init();
          }
        }
      });
      if (!this.isSpeakOn) {
        await this.videoStartPush({ type: 2 });
      }
      this.checkStartPush();
      let el = document
        .getElementById(`vmp-stream-local__${this.joinInfo.third_party_user_id}`)
        .querySelector('.vmp-alert-wrap');
      document.body.appendChild(el);
    },
    beforeDestroy() {
      // 清空计时器
      if (this._audioLeveInterval) {
        clearInterval(this._audioLeveInterval);
      }
      if (this._netWorkStatusInterval) {
        clearInterval(this._netWorkStatusInterval);
      }
    },
    watch: {
      liveStatus: {
        handler(val, oldVal) {
          console.log('watch-----liveStatus', val, oldVal);
          if (val == 1) {
            this.clearGuestStream();
          }
        }
      }
    },
    methods: {
      closePollingDialog() {},
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
      /**
       * 描述
       * 问题1：fix https://www.tapd.cn/58046813/bugtrace/bugs/view?bug_id=1158046813001005974
       * 此问题产生原因：由于在频繁上下麦过程中，异步问题。为了解决问题2出现的
       *      上麦成功消息 ---> 创建本地流,此时存下streamId ----> 推流
       *      下麦成功消息 ---> 销毁互动实例 --------> 进而导致上麦未走完的推流报错，互动实例不存在错误
       *   出现错误后，再执行上麦   --->  上麦成功消息  --->  由于有streamID，直接return     ===> 此逻辑是出现此问题的原因
       *
       * 期间更改过上麦方案：  所有创建流、推流、销毁流等都是通过上下麦成功消息处理的
       *
       * 问题2： 增加存在StreamId直接return原因是因为: 开始直播 emitClickStartLive[ header-right 组件] -> startPush执行一次 --> 收到上麦成功,再执行一次startpush --> 出现推双流问题。
       * 此tapd地址：https://www.tapd.cn/tapd_fe/58046813/bug/list?page=1&queryToken=b5ef2acbcbdd27b69fe8fcbeeeb61e56&dialog_preview_id=bug_1158046813001005944
       *
       * 具体想看产生问题1排查修改记录：可查看文件的git提交历史
       *
       * 完全避免上述两者问题方案：
       *  1、在saas-live 库内进行编排时，执行startPushOnce方法，并在此方法内设置本地属性 startPushStreamOnce 值
       *  2、在上麦成功消息 监听处，进行判断，存在此值，直接return
       *  3、return时，进行修改此值为false，防止后续主持人正常上下麦
       * @date 2022-04-07
       * @returns {any}
       */
      startPushOnce() {
        this.startPushStreamOnce = true;
        this.startPush({ source: 'startPushOnce' });
      },
      // 开播后,清除嘉宾的初始化流
      async clearGuestStream() {
        if (this.joinInfo.role_name != 4) return;
        console.log('clearGuestStream---');
        if (this.pendingStream) {
          // 开播前的check 本地流正在初始化中，检测异步创建的本地流，若本地流在初始化过程中，待初始化完销毁此流
          await this.checkPendingStream();
        }
        if (this.initLocalSpeaker?.streamId) {
          this.interactiveServer.destroyStream({ streamId: this.initLocalSpeaker.streamId });
          this.interactiveServer.setLocalSpeaker({ streamId: null });
        }
      },
      // 开始直播成功的回调
      startLiveSuccess() {
        console.log('startLiveSuccess---');
        let role = parseInt(this.joinInfo.role_name);
        let local = this.interactiveServer.state.localSpeaker;
        console.log('startLive-success', role, local);
        if (role == 1) {
          if (local.streamId && local.audioMuted) {
            this.interactiveServer.setDeviceStatus({
              device: 1,
              status: 0,
              receive_account_id: this.joinInfo.third_party_user_id
            });
          }
          if (local.streamId && local.videoMuted) {
            this.interactiveServer.setDeviceStatus({
              device: 2,
              status: 0,
              receive_account_id: this.joinInfo.third_party_user_id
            });
          }
          this.interactiveServer._clearLocalSpeaker();
        }
      },
      // 清除"开播前"的流初始化状态
      async clearInitLocalSpeaker() {
        if (this.liveStatus != 1) {
          await this.interactiveServer.setDeviceStatus({
            device: 1,
            status: 1,
            receive_account_id: this.joinInfo.third_party_user_id
          });
          await this.interactiveServer.setDeviceStatus({
            device: 2,
            status: 1,
            receive_account_id: this.joinInfo.third_party_user_id
          });
        }
        this.interactiveServer._clearLocalSpeaker();
      },
      // 取消订阅当前所有互动流
      unSubscribeAll() {
        const speakStreamId = this.micServer.state.speakerList.map(el => {
          return el.streamId;
        });
        console.log('上麦列表-as', speakStreamId);
        return new Promise((resolve, reject) => {
          const promiseResults = [];
          let iteratorIndex = 0;
          // 已完成的数量，用于最终的返回，不能直接用完成数量作为iteratorIndex
          // 输出顺序和完成顺序是两码事
          let fullCount = 0;
          // 用于迭代iterator数据
          for (const item of speakStreamId) {
            let resultIndex = iteratorIndex;
            iteratorIndex += 1;
            this.interactiveServer
              .unSubscribeStream(item)
              .then(res => {
                console.log('resultIndex', resultIndex, res);
                promiseResults[resultIndex] = res;
                fullCount += 1;
                if (fullCount === iteratorIndex) {
                  resolve(promiseResults);
                }
              })
              .catch(err => {
                reject(err);
              });
          }
          // 处理空 iterator 的情况
          if (iteratorIndex === 0) {
            resolve(promiseResults);
          }
        });
      },
      /**
       *
       * @description: 视频轮巡推流
       * @param arr {Array} 当前参与轮巡的观众流列表
       */
      async videoStartPush(data) {
        console.log('videoStartPush-params', data);
        if (this.videoPollingServer.state.isPolling) {
          if (this.joinInfo.role_name !== 2) return; //视频轮巡只有观众推流
          if (this.micServer.getSpeakerStatus()) return; // 上麦状态的观众不推流
          if (this.localStreamId) return; // 判断当前是否在推流中
          try {
            if (this.$domainStore.state.interactiveServer.isInstanceInit) {
              // 如果存在互动实例需要销毁，重新初始化
              await sleep(1000);
              const unsub = await this.unSubscribeAll();
              console.log('unSubscribeAll', unsub);
              await this.interactiveServer.destroy();
            }
            await this.interactiveServer.init({ videoPolling: true });
            // 轮询判断是否有互动实例
            await this.checkVRTCInstance();
          } catch (error) {
            console.log('视频轮巡初始化互动实例error', error);
          }
          this.startPollingPush();
        } else {
          if (!this.isSpeakOn && this.joinInfo.role_name == 2) {
            await this.stopPush({ type: 'VIDEO_POLLING_NO_SPEAK' });
            const obj = this.$domainStore.state.interactiveServer;
            console.log('销毁1-1-1-1-1', obj);
            // 优化代码逻辑，如果是ROLE_HOST角色，需要销毁实例
            if (obj.isInstanceInit && obj.initRole === 'administrator') {
              await this.interactiveServer.destroy();
              if (this.isNoDelay == 1) {
                // 优化代码逻辑，如果是ROLE_HOST角色并且是无延迟直播，需要重新初始化为ROLE_AUDIENCE角色
                await sleep(200);
                if (!this.$domainStore.state.interactiveServer.isInstanceInit) {
                  console.log('无延迟---初始化互动-1');
                  await this.interactiveServer.init();
                }
              }
            }
          }
        }
      },
      // 视频轮巡开始推流
      async startPollingPush() {
        const res = await this.interactiveServer.createVideoPollingStream({
          videoNode: `stream-${this.joinInfo.third_party_user_id}`
        });
        this.interactiveServer.publishStream(res);
      },
      // 检查推流
      async checkStartPush() {
        console.log('本地流组件mounted钩子函数,是否在麦上', this.micServer.getSpeakerStatus());
        if (this.roomBaseServer.state.watchInitData.webinar.type != 1 && !this.isRecording) {
          return;
        }

        // 实例化后是否是上麦状态,如果是录制中，默认在麦上
        const isSpeakOn = this.micServer.getSpeakerStatus() || this.isRecording;
        // 如果是没有开启分屏并且在麦上，推流
        // 如果是开启分屏  在麦上 是分屏页面  推流
        // 如果在转播，不推流
        const hasRebroadcast = this.roomBaseServer.state.watchInitData.rebroadcast?.id;

        if (
          useMediaCheckServer().state.deviceInfo.device_status != 2 &&
          isSpeakOn &&
          !hasRebroadcast &&
          (!this.isOpenSplitScreen ||
            (this.isOpenSplitScreen && this.splitScreenServer.state.role == 'splitPage'))
        ) {
          this.startPush({ source: 'checkStartPush' });
        } else if (this.joinInfo.role_name == 1) {
          // 主持人不在麦上，但是刷新页面也需要设置一下旁路
          await this.setBroadCastAdaptiveLayoutMode(
            VhallRTC[useMediaSettingServer().state.layout] ||
              VhallRTC[sessionStorage.getItem('layout')] ||
              VhallRTC.CANVAS_ADAPTIVE_LAYOUT_TILED_MODE
          );

          await this.setBroadCastScreen();
        }
        // console.log('VhallRTC', VhallRTC['CANVAS_ADAPTIVE_LAYOUT_TILED_MODE']);
      },
      // 自动上麦禁音条件更新
      updateAutoSpeak() {
        this.isNotAutoSpeak = true;
      },
      listenEvents() {
        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              this.isFullScreen = false;
            }
          },
          true
        );

        // 主持人同意上麦申请
        this.micServer.$on('vrtc_connect_agree', async () => {
          this.isNotAutoSpeak = true;
          this.userSpeakOn();
        });

        // 上麦成功
        this.micServer.$on('vrtc_connect_success', async msg => {
          if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
            if (this.startPushStreamOnce) {
              this.startPushStreamOnce = false;
              return;
            }

            if ([1, 4, '1', '4'].includes(this.joinInfo.role_name)) {
              // 轮询判断是否有互动实例
              await this.checkVRTCInstance();
              // 开始推流
              this.startPush({ source: 'vrtc_connect_success_role_1_4' });
            } else if (this.joinInfo.role_name == 2) {
              // 无延迟｜分组直播
              // 如果成功，销毁播放器
              this.playerServer.destroy();

              // 收到消息执行可能比 收到响应赋值 autoSpeak为true快，造成初始化2次互动，需要在收到消息执行时，延迟执行
              await sleep(500);
              if (!this.interactiveServer.state.autoSpeak) {
                //  初始化互动实例
                await this.interactiveServer.init();
                // 开始推流
              }

              // 轮询判断是否有互动实例
              await this.checkVRTCInstance();
              this.startPush({ source: 'vrtc_connect_success_role_2' });
            }
          }
        });
        // 下麦成功
        this.micServer.$on('vrtc_disconnect_success', async msg => {
          if (this.joinInfo.role_name == 4) {
            window.vhallReportForProduct?.toResultsReporting(110182, {
              event_type: 'message',
              ...msg
            });
          }
          await this.stopPush({ type: 'vrtc_disconnect_success' });
          if ([1, 4].includes(this.joinInfo.role_name)) {
            this.clearInitLocalSpeaker();
          }
          if (this.joinInfo.role_name == 2) {
            await this.interactiveServer.destroy();
          }

          // 下麦成功后，如果开启了文档可见并且不是无延迟，把播放器置为小屏
          if (
            this.joinInfo.role_name == 2 &&
            useDocServer().state.switchStatus &&
            this.isNoDelay === 0
          ) {
            // 开启合并模式
            if (
              this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout == 1
            ) {
              useRoomBaseServer().setChangeElement('');
            } else {
              useRoomBaseServer().setChangeElement('player');
            }
          }

          // 如果是嘉宾开启了分屏，不需要初始化互动实例
          if (
            (this.isNoDelay === 1 && +this.joinInfo.role_name !== 1) ||
            (+this.joinInfo.role_name === 4 && !this.splitScreenServer.state.isOpenSplitScreen)
          ) {
            if (this.mode === 6) {
              await this.groupServer.updateGroupInitData();
            }
            //  初始化互动实例
            this.interactiveServer.init();
          }

          if (this.isNoDelay !== 1 && +this.joinInfo.role_name === 2) {
            // 初始化播放器
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'initPlayer', { autoPlay: true })
            );
          }
        });

        // micServe异常处理
        this.micServer.$on('vrtc_exception_msg', msg => {
          if (msg.type === 1039) {
            this.$message.warning(this.$t('interact.interact_1039'));
          }
        });
        // 结束直播
        this.micServer.$on('live_over', async () => {
          this.clearInitLocalSpeaker();
          // 如果开启分屏并且是主页面，不需要停止推流
          if (
            this.splitScreenServer.state.isOpenSplitScreen &&
            this.splitScreenServer.state.role == 'hostPage'
          ) {
            // 如果开启了分屏，并且是主页面
            //  初始化互动实例
            this.splitScreenServer.state.isOpenSplitScreen = false;
            this.splitScreenServer.shadowWin = null;
            this.interactiveServer.init();
          } else {
            await this.stopPush({ source: 'live_over' });
          }

          clearInterval(this._audioLeveInterval);
          clearInterval(this._netWorkStatusInterval);

          if (this.isWatch) {
            this.roomBaseServer.setChangeElement('');
          } else {
            if (!this.$route.query.assistantType) {
              this.roomBaseServer.setChangeElement('stream-list');
            }
          }

          if (![1, 3, 4].includes(parseInt(this.joinInfo.role_name))) {
            this.interactiveServer.destroy();
          }

          this.micServer.setSpeakerList([]);
        });
        // 分组继续讨论，初始化互动实例完成后，开始推流
        this.interactiveServer.$on('PROCEED_DISCUSSION', msg => {
          this.startPush({ source: 'PROCEED_DISCUSSION' });
        });
        useMsgServer().$onMsg('ROOM_MSG', async msg => {
          if (msg.data.type === 'vrtc_definition_set') {
            // 设备断开重连，重新检查device_status状态（主持人）
            if (+this.joinInfo.role_name === 1) {
              await useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: true });
            }
          }
          // 分组结束讨论 || 分组暂停讨论
          if (
            msg.data.event_type === 'group_switch_end' ||
            msg.data.event_type === 'group_switch_stop'
          ) {
            // 如果开启分屏并且是主页面，不需要停止推流
            if (
              this.splitScreenServer.state.isOpenSplitScreen &&
              this.splitScreenServer.state.role == 'hostPage'
            ) {
              return;
            }

            // 由于结束直播导致的结束讨论
            if (msg.data.over_type) {
              // 此处仅处理非主持人的角色
              if (this.joinInfo.role_name != 1) {
                await this.stopPush({ type: 'group_switch_end_stop' });
              }
              if (this.isWatch) {
                this.roomBaseServer.setChangeElement('');
              } else {
                this.roomBaseServer.setChangeElement('stream-list');
              }

              if (![1, 3, 4].includes(parseInt(this.joinInfo.role_name))) {
                this.interactiveServer.destroy();
              }

              this.micServer.setSpeakerList([]);
            }
          }
        });

        // 接收设为主画面消息
        this.micServer.$on('vrtc_big_screen_set', msg => {
          // 开始直播的时候不监听这个  ----  进行服务端增加字段控制是否进行提示
          if (msg.data.is_start_live == 1) return;
          this.joinInfo.role_name != 2 &&
            this.$message.success(
              this.$t('interact.interact_1012', {
                n: msg.data.nick_name,
                m: this.$t('interact.interact_1033')
              })
            );
        });

        // 接收设为主讲人消息
        this.micServer.$on('vrtc_speaker_switch', msg => {
          if (this.joinInfo.role_name == 4) {
            // 嘉宾被设为主讲人埋点
            window.vhallReportForProduct?.toResultsReporting(110171, {
              event_type: 'meassage',
              ...msg
            });
          }
          // 开始直播的时候不监听这个  ----  进行服务端增加字段控制是否进行提示
          if (msg.data.is_start_live == 1) return;
          const m =
            this.roomBaseServer.state.watchInitData.webinar.mode == 6
              ? this.$t('interact.interact_1033')
              : this.$t('interact.interact_1034');
          this.joinInfo.role_name != 2 &&
            this.$message.success(
              this.$t('interact.interact_1012', {
                n: msg.data.nick_name,
                m: m
              })
            );
        });

        // 房间信令异常断开事件
        this.interactiveServer.$on('EVENT_ROOM_EXCDISCONNECTED', msg => {
          console.log('网络异常断开', msg);

          this.PopAlertOffline.text = '网络异常导致互动房间连接失败';
          this.PopAlertOffline.visible = true;
        });

        this.interactiveServer.$on('EVENT_REMOTESTREAM_FAILED', async e => {
          if (e.data.accountId == this.joinInfo.third_party_user_id) {
            this.PopAlertOffline.text = this.$t('interact.interact_1036');
            this.PopAlertOffline.visible = true;
            // this.$message({
            //   message: this.$t('因网络问题推流失败，正在重新推流'),
            //   showClose: true,
            //   type: 'warning',
            //   customClass: 'zdy-info-box'
            // });
            // await this.stopPush();
            // this.startPush();
          }
        });

        // 观众的监听
        if (this.joinInfo.role_name == 2) {
          // 开启摄像头
          this.interactiveServer.$on('vrtc_frames_display', () => {
            this.$message.success(this.$t('interact.interact_1024'));
          });
          // 关闭摄像头
          this.interactiveServer.$on('vrtc_frames_forbid', () => {
            this.$message.warning(this.$t('interact.interact_1023'));
          });
          // 开启音频
          this.interactiveServer.$on('vrtc_mute_cancel', () => {
            this.$message.success(this.$t('interact.interact_1015'));
          });
          // 关闭音频
          this.interactiveServer.$on('vrtc_mute', () => {
            this.$message.warning(this.$t('interact.interact_1026'));
          });
        }
      },
      // 媒体切换后进行无缝切换
      async switchStreamType(param) {
        console.log('--switchStreamType--', param, this.liveStatus);
        // 音视频/图片推流 方式变更
        const { videoType, canvasImgUrl, isRepublishMode } = param;
        const { isPolling } = this.videoPollingServer.state;
        if (this.liveStatus != 1) {
          if (this.$domainStore.state.mediaSettingServer.videoType == 'picture') {
            await this.$refs.imgPushStream.updateCanvasImg();
          }
          // 未开播前的切换设备操作
          try {
            await this.createLocalStream({ source: 'switchStreamType_init' });
            this.interactiveServer.setLocalSpeaker({ streamId: this.localStreamId });
          } catch (error) {
            console.log('init-check-createLocalStream', error);
          }
          return;
        }

        try {
          if (videoType || canvasImgUrl || isRepublishMode) {
            if (this.$domainStore.state.mediaSettingServer.videoType == 'picture') {
              await this.$refs.imgPushStream.updateCanvasImg();
            }

            // 重新推流
            if (param.isRepublishMode) {
              if (isPolling) {
                await this.videoStartPush({ type: 3 });
              } else {
                this.isSpeakOn &&
                  (await this.startPush({ source: 'switchStreamType_isRepublishMode' }));
              }
            } else if (this.localSpeaker.streamId || this.isRecording) {
              await this.interactiveServer.unpublishStream(this.localSpeaker);

              if (isPolling) {
                await this.videoStartPush({ type: 4 });
              } else {
                await this.startPush({ source: 'switchStreamType_2' });
              }
            }
          } else {
            // (不在麦上 || 非视频轮巡状态中)  直接return
            if (!this.micServer.getSpeakerStatus() && !this.videoPollingServer.state.isPolling) {
              return;
            }
            this.silenceSwitchStream(param);
          }
        } finally {
          // 检查设备状态
          if (useMediaCheckServer().state.deviceInfo.device_status === 2) {
            useMediaCheckServer().setDevice({ status: 1 });
          }
        }
      },
      /**
       * 静默无缝切换流
       * @param {*} param
       */
      silenceSwitchStream(param) {
        // 无缝切换音频
        if (param.audioInput) {
          this.interactiveServer
            .switchStream({
              streamId: this.localSpeaker.streamId,
              type: 'audio'
            })
            .catch(err => {
              window.vhallReportForProduct?.toResultsReporting(110164, {
                failed_reason: err
              });
              console.error('切换失败', err);
            });
        }

        // 无缝切换视频
        if (param.video && this.$domainStore.state.mediaSettingServer.videoType == 'camera') {
          this.interactiveServer
            .switchStream({
              streamId: this.localSpeaker.streamId,
              type: 'video'
            })
            .catch(err => {
              window.vhallReportForProduct?.toResultsReporting(110164, {
                failed_reason: err
              });
              console.error('切换失败', err);
            });
        }
      },
      sleep(time = 1000) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(true);
          }, time);
        });
      },
      // 上麦接口
      async userSpeakOn() {
        const res = await this.micServer.userSpeakOn();
        if (res.code == 200) {
          // 成功上麦，返回true
          return true;
        } else if (res.code == 513025) {
          // 麦位已满，上麦失败
          this.$message.error(`上麦席位已满员，您的账号支持${res.data.replace_data}人上麦`);
        } else {
          console.error('上麦接口失败----', res);
        }
        return false;
      },
      // 用户下麦接口
      speakOff() {
        // 用户下麦
        window.vhallReportForProduct?.toStartReporting(170002, [170003, 170033, 110193, 110185]);
        return this.micServer.speakOff();
      },
      // 处理上麦失败
      async handleSpeakOnError(err) {
        if (err == 'createLocalStreamError') {
          // 打开本地流创建失败弹框
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'openCheckMediaDialog', ['createLocalStreamError'])
          );
          // 本地流创建失败
          this.$message.error(this.$t('interact.interact_1016'));
          // 下麦接口
          this.speakOff();
          // TODO: 派发上麦失败事件，可能需要执行销毁互动实例重新创建播放器实例的逻辑
        } else if (err == 'NotAllowed') {
          // 打开本地流创建失败弹框
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'openCheckMediaDialog', ['NotAllowed'])
          );
          // 本地流创建失败
          this.$message.error(this.$t('interact.interact_1016'));
        } else if (err == 'publishStreamError') {
          // 推流失败
          this.$message.error(this.$t('interact.interact_1021'));
          // 下麦接口
          if (this.micServer.getSpeakerStatus()) {
            this.speakOff();
          }
        } else if (err == 'noPermission') {
          // 无推流权限
          await this.interactiveServer.destroy();
          await this.interactiveServer.init({ role: VhallRTC.ROLE_HOST });
          await this.publishLocalStream('noPermission');
        } else if (err == 'startBroadCastError') {
          // 开启主屏失败
          console.log('开启主屏失败');
          // TODO: 主屏失败错误处理
        } else if (err == 'setBroadCastScreenError') {
          // 设置旁路主屏布局失败
          console.log('设置主屏失败');
          // TODO: 设置旁路主屏布局失败错误处理
        } else if (err == 'setBroadCastAdaptiveLayoutModeError') {
          console.log('设置自适应旁路布局失败');
        } else if (err == 'getCanvasStreamError') {
          console.error('获取图片流track错误');
        } else if (err == 'createLocalPhotoStreamError') {
          this.$message.error('初始化图片流失败');
        } else {
          console.error(err);
          throw new Error('代码错误');
        }
      },
      // 开始推流
      async startPush(opt) {
        const initStream = this.initLocalSpeaker?.streamId; // 开播前初始化的流
        // 第三方推流直接开始直播
        if (useRoomBaseServer().state.isThirdStream && this.joinInfo.role_name == 1) {
          // 派发事件 此处会导致重复回调emitClickPublishComplate
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickPublishComplate')
          );
          if (initStream) {
            this.interactiveServer.destroyStream({ streamId: initStream });
          }
          return;
        }

        try {
          // 创建本地流
          await this.createLocalStream(opt);

          // 推流
          await this.publishLocalStream('startPush');

          // 实时获取网络状况
          this.getLevel();

          // 主持人配置旁路主屏
          if (this.joinInfo.role_name == 1) {
            /*
             *  1、初始化互动实例时会默认传旁路自适应布局模式
             *  2、     若刷新的话，会初始化实例，则旁路展示正确
             *            不刷新，结束直播后，进行媒体设置更改，再进行开播，则需要手动调用自适应布局方法
             */
            if (sessionStorage.getItem('layout')) {
              await this.setBroadCastAdaptiveLayoutMode();
            }

            await this.setBroadCastScreen();
          }
          console.log('paltForm 自动静音上麦 ', this.autoSpeak);
          // 分组活动 自动上麦默认禁音
          if (this.autoSpeak) {
            this.interactiveServer.setDeviceStatus({
              device: 1, // 1:audio    2:video
              status: 0, // 0:禁音    1:打开麦克风
              receive_account_id: this.joinInfo.third_party_user_id
            });
          }
          // 派发事件
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickPublishComplate')
          );
        } catch (err) {
          this.handleSpeakOnError(err);
        }
      },
      // 发起端，开播前设备检测 => 初始化本地流
      /**
       * @param {String} opt 类型：closed:未检测直接关闭；checked：检测完关闭弹框
       */
      async initLocalStream(opt) {
        if (![1, 4].includes(this.joinInfo.role_name) && this.liveStatus != 1) return; // 直播未开始 && 非嘉宾/主持人
        console.log('init------equ', opt);
        let videoId = localStorage.getItem('media-check.selected.video');
        let audioId = localStorage.getItem('media-check.selected.audioInput');
        const vList = await this.mediaSettingServer.getCameras();
        let aList = await this.mediaSettingServer.getMicrophones();
        if (videoId) {
          if (
            !vList.some(el => {
              return el.deviceId == videoId;
            })
          ) {
            videoId = vList[0].deviceId;
            localStorage.setItem('media-check.selected.video', videoId);
          }
        } else if (vList.length) {
          videoId = vList[0].deviceId;
          localStorage.setItem('media-check.selected.video', videoId);
        } else {
          // TODO 提示异常
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'openCheckMediaDialog', ['createLocalStreamError'])
          );
          return;
        }

        if (audioId) {
          if (
            !aList.some(el => {
              return el.deviceId == audioId;
            })
          ) {
            audioId = aList[0].deviceId;
            localStorage.setItem('media-check.selected.audioInput', audioId);
          }
        } else if (aList.length) {
          audioId = aList[0].deviceId;
          localStorage.setItem('media-check.selected.audioInput', audioId);
        } else {
          // TODO 提示异常
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'openCheckMediaDialog', ['createLocalStreamError'])
          );
          return;
        }

        console.log('videoId-audioId', videoId, audioId, vList, aList);
        if (this.liveStatus == 1 && this.joinInfo.role_name == 4) return; // 嘉宾直播中进入直播间，检测完，不初始化
        try {
          await this.createLocalStream({ source: `live_check_${opt}` });
          console.log('setLocalSpeaker--', this.localStreamId);
          this.interactiveServer.setLocalSpeaker({ streamId: this.localStreamId });
        } catch (error) {
          console.log('init-check-createLocalStream', error);
        }
      },
      // 创建本地流
      async createLocalStream(opt) {
        if (this.pendingStream) {
          // check 本地流正在初始化中
          await this.checkPendingStream();
        }
        console.log(
          'createLocalStream=====',
          this.localStreamId,
          this.initLocalSpeaker,
          this.liveStatus,
          opt
        );
        if (this.localStreamId || this.initLocalSpeaker.streamId) {
          if (
            this.joinInfo.role_name == 1 &&
            this.initLocalSpeaker.streamId &&
            opt.source == 'startPushOnce'
          ) {
            // 主持人，开始直播，存在本地初始化流直接推流，不再重复创建
            return Promise.resolve();
          }
          console.log(
            '防止重复推流-销毁本地流',
            `localStreamId: ${this.localStreamId}; initLocalSpeaker: ${this.initLocalSpeaker.streamId}`
          );
          await this.interactiveServer.destroyStream({
            streamId: this.localStreamId || this.initLocalSpeaker.streamId
          });
          this.interactiveServer.setDefMuted();
        }
        console.log('创建本地流createLocalStream', opt);
        this.pendingStream = true;
        if (this.$domainStore.state.mediaSettingServer.videoType == 'camera') {
          window.vhallReportForProduct?.toResultsReporting(110187, {
            videoType: 'camera',
            ...opt
          });
          await this.interactiveServer
            .createLocalVideoStream({
              videoNode: `stream-${this.joinInfo.third_party_user_id}`
            })
            .catch(e => {
              this.pendingStream = false;
              window.vhallReportForProduct?.toResultsReporting(110188, {
                failed_reason: e
              });
              if (e && e?.name == 'NotAllowed') {
                return Promise.reject('NotAllowed');
              } else {
                return Promise.reject('createLocalStreamError');
              }
            });
        } else {
          // 若是图片推流，刷新则需等待canvas进行绘制
          // await this.sleep();
          await this.$refs.imgPushStream.updateCanvasImg();
          const videoTracks = await useCanvasStreamServer().getCanvasStream();
          if (!videoTracks) {
            throw 'getCanvasStreamError';
          }
          window.vhallReportForProduct?.toResultsReporting(110187, {
            videoType: 'img',
            ...opt
          });
          await this.interactiveServer
            .createLocalPhotoStream({
              videoNode: `stream-${this.joinInfo.third_party_user_id}`,
              videoTrack: videoTracks
            })
            .catch(err => {
              this.pendingStream = false;
              window.vhallReportForProduct?.toResultsReporting(110188, {
                failed_reason: err
              });
              return Promise.reject('createLocalPhotoStreamError');
            });
        }
        this.pendingStream = false;
      },
      // 推流
      async publishLocalStream(type) {
        window.vhallReportForProduct?.toResultsReporting(110183, {
          pubTyle: type
        });
        await this.interactiveServer.publishStream().catch(e => {
          console.log('paltForm publishLocalStream failed....', e);
          window.vhallReportForProduct?.toResultsReporting(110184, {
            failed_reason: e
          });
          if (e.code === '611007') {
            this.handleSpeakOnError('noPermission');
          } else {
            this.handleSpeakOnError('publishStreamError');
          }
        });
      },

      // 设置主屏
      async setBroadCastScreen() {
        await this.interactiveServer.resetLayout().catch(() => {
          return Promise.reject('setBroadCastScreenError');
        });
      },

      // 设置旁路布局
      async setBroadCastAdaptiveLayoutMode(layout) {
        const param = {
          adaptiveLayoutMode:
            VhallRTC[useMediaSettingServer().state.layout] ||
            VhallRTC[sessionStorage.getItem('layout')] ||
            layout
        };
        await this.interactiveServer.setBroadCastAdaptiveLayoutMode(param).catch(() => {
          return Promise.reject('setBroadCastAdaptiveLayoutModeError');
        });
      },

      // 结束推流
      stopPush(options) {
        return new Promise((resolve, reject) => {
          // 增加判断当前是否在推流中    助理默认是不推流，但是能监听到结束直播成功的消息
          // 此处不能用localSpeaker.streamId，因为下麦时已经从speakerList里删掉了，没有localSpeaker了
          if (!this.localStreamId) {
            // 设备禁用/主动停止直播作区分，此处为结束直播试触发
            if (+this.joinInfo.role_name === 1 && options?.source === 'live_over') {
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
              );
            }
            resolve();
            return;
          }
          // 第三方推流(无streamId) && 直播时结束直播
          if (this.isThirdStream && options?.source === 'live_over') {
            clearInterval(this._audioLeveInterval);
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
            );
            resolve();
            return;
          }

          // 当前角色为主持人&&设备被禁用
          if (
            +this.joinInfo.role_name === 1 &&
            useMediaCheckServer().state.deviceInfo.device_status === 2
          ) {
            clearInterval(this._audioLeveInterval);
            // window.$middleEventSdk?.event?.send(
            //   boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
            // );
            resolve();
          }
          window.vhallReportForProduct?.toResultsReporting(110193, {
            ev_type: { ...options }
          });

          this.interactiveServer
            .unpublishStream()
            .then(data => {
              window.vhallReportForProduct?.toResultsReporting(110185, {
                res: data
              });
              clearInterval(this._audioLeveInterval);
              // 如果是主持人，并且是结束直播导致的停止推流，需要派发事件改变开始直播按钮状态
              if (this.joinInfo.role_name == 1 && options?.source === 'live_over') {
                window.$middleEventSdk?.event?.send(
                  boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
                );
              }
              resolve();
            })
            .catch(err => {
              window.vhallReportForProduct?.toResultsReporting(110186, {
                res: err
              });
              reject(err);
            });
        });
      },
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        // 未开播前暂存状态，开播后使用此状态
        if (this.initLocalSpeaker?.streamId && this.liveStatus != 1) {
          let curStatus = this.interactiveServer.state.localSpeaker[`${deviceType}Muted`] ? 1 : 0;
          console.log('handleClickMuteDevice-curStatus', !curStatus);
          if (deviceType == 'video') {
            this.interactiveServer.muteVideo({
              streamId: this.initLocalSpeaker.streamId,
              isMute: !curStatus // 是否禁用设备
            });
            this.interactiveServer.setLocalSpeaker({ videoMuted: !curStatus });
          } else {
            this.interactiveServer.muteAudio({
              streamId: this.initLocalSpeaker.streamId,
              isMute: !curStatus // 是否禁用设备
            });
            this.interactiveServer.setLocalSpeaker({ audioMuted: !curStatus });
          }
          return;
        }

        const status = this.localSpeaker[`${deviceType}Muted`] ? 1 : 0;
        console.log('handleClickMuteDevice-status----', status);
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
        // 110136关闭    110137 开启
        if (deviceType == 'video') {
          window.vhallReportForProduct.toReport(status == 1 ? 110137 : 110136, {
            report_extra: {
              event_type: 'click'
            }
          });
        } else {
          // 110138 关闭    110139 开启
          window.vhallReportForProduct.toReport(status == 1 ? 110139 : 110138, {
            report_extra: {
              event_type: 'click'
            }
          });
        }
      },
      // 进入、退出全屏
      fullScreen() {
        if (!this.isFullScreen) {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.localSpeaker.streamId,
              vNode: `vmp-stream-local__${this.joinInfo.third_party_user_id}`
            })
            .then(() => {
              this.isFullScreen = true;
            });
        } else {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.localSpeaker.streamId,
              vNode: `vmp-stream-local__${this.joinInfo.third_party_user_id}`
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
      // 实时获取网路状况和麦克风能量
      getLevel() {
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (
            !this.localSpeaker.streamId ||
            !this.$domainStore.state.interactiveServer.isInstanceInit
          )
            return clearInterval(this._audioLeveInterval);
          // 获取音量
          this.interactiveServer
            .getAudioLevel({ streamId: this.localSpeaker.streamId })
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
          if (
            !this.localSpeaker.streamId ||
            !this.$domainStore.state.interactiveServer.isInstanceInit
          )
            return clearInterval(this._netWorkStatusInterval);
          // 获取网络状态
          this.interactiveServer
            .getStreamPacketLoss({ streamId: this.localSpeaker.streamId })
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
       * @param {Number | String}
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
        if (setMainScreen) {
          this.setMainScreen();
        }
        window.vhallReportForProduct?.toStartReporting(110176, 110177);
        this.interactiveServer
          .setSpeaker({
            receive_account_id: this.joinInfo.third_party_user_id
          })
          .then(res => {
            window.vhallReportForProduct?.toResultsReporting(110177, {
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
            receive_account_id: this.joinInfo.third_party_user_id
          })
          .then(res => {
            console.log('setmainscreen success ::', res);
          })
          .catch(err => {
            console.error('setmainscreen failed ::', err);
          });
      },
      /**
       * 初始化互动实例时，进行自动上麦判断时，会调用speakOn接口，此时vrtc_connect_success已经收到，但互动实例还没有，所以在推流之前需要等待互动实例化完成
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
      },
      // 检测开播前，本地流是否初始化完成
      async checkPendingStream() {
        return new Promise((resolve, reject) => {
          let count = 0;
          const timer = setInterval(() => {
            if (!this.pendingStream) {
              resolve();
              clearInterval(timer);
            } else {
              count++;
              console.log('checkPendingStream count', count);
              if (count > 20) {
                clearInterval(timer);
                console.error('checkPendingStream - err');
                reject();
              }
            }
          }, 200);
        });
      },
      PopAlertOfflineClose() {
        this.PopAlertOffline.visible = false;
      },
      PopAlertOfflineConfirm() {
        window.location.reload();
      }
    }
  };
</script>

<style lang="less">
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  .vmp-stream-local {
    width: 100%;
    height: 100%;
    position: relative;
    &.vmp-stream-local__publish {
      &:hover {
        .vmp-stream-local__shadow-box {
          display: flex;
        }
      }
    }
    .init-pop-scroll {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 40px;
      box-sizing: border-box;
      display: flex;
      font-size: 12px;
      color: #fff;
      align-items: center;
      justify-content: center;

      .content {
        flex: 1;
        overflow: hidden;
        span {
          width: auto;
          display: block;
          padding-left: 105%;
          padding-right: 120%;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
      }
    }
    &.fullscreen {
      .vmp-stream-local__shadow-box {
        display: flex;
        height: 41px;
        bottom: 10px;
        flex-direction: row;
        top: auto;
        background: rgba(0, 0, 0, 0);
        .vmp-stream-local__shadow-icon {
          background: none;
          &:hover {
            background-color: #fb3a32;
          }
        }
      }
    }
    .vmp-stream-local__stream-box {
      width: 100%;
      height: 100%;
    }
    .vmp-stream-local__stream-box__placeholder {
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      &-mute {
        background-image: url(./img/no_video_bg.png);
      }
      &-spliting {
        background-color: #2d2d2d;
        background-image: url(./img/split.png);
        background-size: 80px 52px;
        background-position: center;
      }
    }

    .vmp-stream-local__stream-box__audio {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-size: 400px;
      width: 100%;
      height: 100%;
      z-index: 4;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #333438 url('./img/voicefrequency.png') no-repeat;
      background-size: 100% 100%;
      /*opacity: 0.8;*/
      &--beforestart {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-size: 400px;
        width: 100%;
        height: 100%;
        z-index: 3;
        display: flex;
        justify-content: center;
        align-items: center;
        background: url('./img/livebg.png') no-repeat;
        background-size: 100% 100%;
        // background-color: black;
        & > .vmp-stream-local__stream-box__audio--bg {
          display: none;
        }
      }
      & > .vmp-stream-local__stream-box__audio--bg {
        color: white;
        font-size: 20px;
        width: 170px;
        height: 46px;
        background: url('./img/voice.png') left no-repeat;
        background-size: 69px;
        z-index: 4;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        & > span {
          width: 96px;
          height: 22px;
          display: inline-block;
          background: url('./img/voiceinprogress.png') no-repeat;
          background-size: 100%;
        }
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
        margin-left: 5px;
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
      top: 0px;
      left: px;
      &-presentation {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 12px;
        color: @font-dark-normal;
        padding: 0 6px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        margin: 4px 0 0 4px;
        overflow: hidden;
        text-align: left;
      }
    }

    // 遮罩层样式
    .vmp-stream-local__shadow-box {
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
      .vmp-stream-local__shadow-first-line {
        line-height: 36px;
      }
      .vmp-stream-local__shadow-second-line {
        line-height: 36px;
        min-width: 130px;
      }
      .vmp-stream-local__shadow-label {
        display: inline-block;
        width: 54px;
        margin-right: 10px;
        text-align: right;
        color: #ffffff;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 14px;
        vertical-align: middle;
      }
      .vmp-stream-local__shadow-icon {
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
    // 播放按钮
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
  }
</style>
