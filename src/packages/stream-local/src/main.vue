<template>
  <div
    :id="`vmp-stream-local__${joinInfo.third_party_user_id}`"
    class="vmp-stream-local"
    :class="{ 'vmp-stream-local__publish': localSpeaker.streamId }"
  >
    <!-- 流容器 -->
    <section
      class="vmp-stream-local__stream-box"
      :id="`stream-${joinInfo.third_party_user_id}`"
    ></section>
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
    <section class="vmp-stream-local__bootom" v-show="localSpeaker.streamId">
      <span
        v-show="[1, 3, 4].includes(joinInfo.role_name) && isInGroup"
        class="vmp-stream-local__bootom-role"
        :class="`vmp-stream-local__bootom-role__${joinInfo.role_name}`"
      >
        {{ joinInfo.role_name | roleFilter }}
      </span>
      <span class="vmp-stream-local__bootom-nickname">{{ joinInfo.nickname }}</span>
      <span
        class="vmp-stream-local__bootom-signal"
        :class="`vmp-stream-local__bootom-signal__${networkStatus}`"
      ></span>
      <span
        class="vmp-stream-local__bootom-mic vh-iconfont"
        :class="
          localSpeaker.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
        "
      ></span>
    </section>
    <!-- 遮罩层 主屏-->
    <section
      v-if="mainScreen == joinInfo.third_party_user_id"
      class="vmp-stream-local__shadow-box"
      v-show="isShowShadowBtn"
    >
      <p class="vmp-stream-local__shadow-first-line">
        <span v-if="[1, 3, 4].includes(joinInfo.role_name)" class="vmp-stream-local__shadow-label">
          {{ joinInfo.role_name | roleFilter }}
        </span>
        <el-tooltip
          :content="localSpeaker.videoMuted ? '打开摄像头' : '关闭摄像头'"
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
          :content="localSpeaker.audioMuted ? '打开麦克风' : '关闭麦克风'"
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

        <el-tooltip content="下麦" placement="top">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="joinInfo.role_name != 1 && groupRole != 20"
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
            v-if="!isFullScreen"
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
            @click="fullScreen"
          ></span>
        </el-tooltip>
      </p>
    </section>

    <!-- 遮罩层 非主屏-->
    <section v-show="isShowShadowBtn" v-else class="vmp-stream-local__shadow-box">
      <p class="vmp-stream-local__shadow-first-line">
        <el-tooltip
          :content="localSpeaker.videoMuted ? '打开摄像头' : '关闭摄像头'"
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
          :content="localSpeaker.audioMuted ? '打开麦克风' : '关闭麦克风'"
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
        <el-tooltip content="下麦" placement="top">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="joinInfo.role_name != 1 && groupRole != 20"
          ></span>
        </el-tooltip>
      </p>
      <p
        v-if="joinInfo.role_name == 1 || localSpeaker.roleName === 20"
        class="vmp-stream-local__shadow-second-line"
      >
        <!-- 设为主讲人 -->
        <el-tooltip content="设为主讲人" v-if="mode != 6" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
            @click="setOwner()"
          ></span>
        </el-tooltip>

        <!-- 设为主画面 -->
        <el-tooltip content="设为主画面" v-else placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
            @click="setMainScreen(false)"
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
    <section class="vmp-stream-local__pause" v-show="showInterIsPlay">
      <img :src="coverImgUrl" alt />
      <p @click.stop="replayPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </section>

    <ImgStream ref="imgPushStream"></ImgStream>
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useMicServer,
    useRoomBaseServer,
    usePlayerServer,
    useMediaSettingServer,
    useGroupServer,
    useSplitScreenServer,
    useMediaCheckServer,
    useChatServer,
    useMsgServer,
    useDocServer
  } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import ImgStream from './components/img-stream/index.vue';
  export default {
    name: 'VmpStreamLocal',
    data() {
      return {
        isFullScreen: false,
        networkStatus: 2,
        audioLevel: 1,
        showDownMic: false,
        isNotAutoSpeak: false // 分组模式下的是否为自动静音上麦自动
      };
    },
    components: {
      ImgStream
    },
    computed: {
      liveMode() {
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
      // 是否推流
      isStreamPublished() {
        return this.$domainStore.state.interactiveServer.localStream.streamId;
      },
      localSpeaker() {
        console.log('-------localSpeaker更新--------');
        return (
          this.$domainStore.state.micServer.speakerList.find(
            item => item.accountId == this.joinInfo.third_party_user_id
          ) || {}
        );
      },
      remoteSpeakers() {
        return (
          this.$domainStore.state.micServer.speakerList.filter(
            item => item.accountId != this.joinInfo.third_party_user_id
          ) || []
        );
      },
      speakerList() {
        return this.$domainStore.state.micServer.speakerList;
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
        const sameId = this.presentationScreen === accountId;
        const groupMode = this.liveMode == 6;
        const inMainRoomUser = !this.isInGroup && accountId != this.hostId;
        const inGroupRoomUser = this.isInGroup && accountId != this.groupLeaderId;
        const allowedUser = inMainRoomUser || inGroupRoomUser;

        console.log('isShowPresentationScreen', {
          localSpeaker: this.localSpeaker,
          sameId,
          groupMode,
          inMainRoomUser,
          inGroupRoomUser
        });

        return sameId && groupMode && allowedUser;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      liveStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      },
      isNoDelay() {
        // 1：无延迟直播
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      autoSpeak() {
        // 观众自动禁音上麦 =   自动上麦开启 + 分组活动 + 观众 + 不在麦上 + 非同意主持人的邀请上麦 + 非自己申请上麦
        if (this.groupRole == 20) {
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
        return this.isOpenSplitScreen && this.$domainStore.state.splitScreenServer.role == 'host';
      },
      // 是否开启分屏
      isOpenSplitScreen() {
        return this.$domainStore.state.splitScreenServer.isOpenSplitScreen;
      },

      localStream() {
        return this.$domainStore.state.interactiveServer.localStream;
      },
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      }
    },
    filters: {},
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
      this.playerServer = usePlayerServer();
      this.groupServer = useGroupServer();
      this.chatServer = useChatServer();
      this.roomBaseServer = useRoomBaseServer();
      this.splitScreenServer = useSplitScreenServer();
    },
    created() {
      this.listenEvents();
    },
    async mounted() {
      window.streamLocal = this;
      this.checkStartPush();
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
    methods: {
      // 检查推流
      checkStartPush() {
        console.log('本地流组件mounted钩子函数,是否在麦上', this.micServer.getSpeakerStatus());
        if (this.roomBaseServer.state.watchInitData.webinar.type != 1) {
          return;
        }

        // 实例化后是否是上麦状态
        const isSpeakOn = this.micServer.getSpeakerStatus();
        // 如果是没有开启分屏并且在麦上，推流
        // 如果是开启分屏  在麦上 是分屏页面  推流
        if (
          useMediaCheckServer().state.deviceInfo.device_status === 1 &&
          isSpeakOn &&
          (!this.isOpenSplitScreen ||
            (this.isOpenSplitScreen && this.splitScreenServer.state.role == 'split'))
        ) {
          this.startPush();
        } else {
          if (isSpeakOn) {
            this.speakOff();
          }
        }
      },
      // 恢复播放
      replayPlay() {
        const videos = document.querySelectorAll('video');
        videos.length > 0 &&
          videos.forEach(video => {
            video.play();
          });
        this.interactiveServer.state.showPlayIcon = false;
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
            if (this.localStream.streamId) return;
            // 若上麦成功后发现设备不允许上麦，则进行下麦操作
            if (useMediaCheckServer().state.deviceInfo.device_status == 2) {
              this.speakOff();
              return;
            }
            // // 更新本地speakerList
            // if (this.groupServer.state.groupInitData.isInGroup) {
            //   await this.groupServer.updateGroupInitData();
            // } else {
            //   await this.roomBaseServer.getInavToolStatus();
            // }

            console.log('[stream-local] vrtc_connect_success startPush');

            // 上麦成功后，如果开启文档可见，把主画面置为小屏
            if (useDocServer().state.switchStatus) {
              useRoomBaseServer().setChangeElement('stream-list');
            }

            if ([1, 4, '1', '4'].includes(this.joinInfo.role_name)) {
              // 轮询判断是否有互动实例
              await this.checkVRTCInstance();
              // 开始推流
              this.startPush();
            } else if (this.joinInfo.role_name == 2) {
              // 无延迟｜分组直播
              // 如果成功，销毁播放器
              this.playerServer.destroy();

              if (!this.interactiveServer.state.autoSpeak) {
                //  初始化互动实例
                await this.interactiveServer.init();
                // 开始推流
              }

              // 轮询判断是否有互动实例
              await this.checkVRTCInstance();
              this.startPush();
            }
          }
        });
        // 下麦成功
        this.micServer.$on('vrtc_disconnect_success', async () => {
          await this.stopPush();

          await this.interactiveServer.destroy();

          // 下麦成功后，如果开启了文档可见并且不是无延迟，把播放器置为小屏
          if (useDocServer().state.switchStatus && this.isNoDelay === 0) {
            useRoomBaseServer().setChangeElement('player');
          }

          if (
            this.isNoDelay === 1 ||
            this.mode === 6 ||
            [4, '4'].includes(this.joinInfo.role_name)
          ) {
            //  初始化互动实例
            this.interactiveServer.init();
          } else {
            // 初始化播放器
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'initPlayer', { autoPlay: true })
            );
          }
        });
        // 结束直播
        useMsgServer().$on('live_over', async () => {
          // 如果开启分屏并且是主页面，不需要停止推流
          if (
            this.splitScreenServer.state.isOpenSplitScreen &&
            this.splitScreenServer.state.role == 'host'
          ) {
            return;
          }
          await this.stopPush();
          this.roomBaseServer.setChangeElement('stream-list');

          if (![1, 3, 4].includes(parseInt(this.joinInfo.role_name))) {
            this.interactiveServer.destroy();
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
        // 图片信息
        console.warn('useMediaSettingServer', param, useMediaSettingServer().state);
        // 音视频/图片推流 方式变更
        if (param.videoType || param.canvasImgUrl) {
          if (this.$domainStore.state.mediaSettingServer.videoType == 'picture') {
            await this.$refs.imgPushStream.updateCanvasImg();
          }

          if (this.localSpeaker.streamId) {
            await this.interactiveServer.unpublishStream(this.localSpeaker.streamId);
            await this.startPush();
          }
        } else {
          if (param.audioInput) {
            this.interactiveServer
              .switchStream({
                streamId: this.localSpeaker.streamId,
                type: 'audio'
              })
              .then(res => {
                console.log('切换成功---', res);
              })
              .catch(err => {
                console.error('切换失败', err);
              });
            return;
          } else if (
            param.video &&
            this.$domainStore.state.mediaSettingServer.videoType == 'camera'
          ) {
            this.interactiveServer
              .switchStream({
                streamId: this.localSpeaker.streamId,
                type: 'video'
              })
              .then(res => {
                console.log('切换成功---', res);
              })
              .catch(err => {
                console.error('切换失败', err);
              });
          }
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
          // TODO: 麦位已满的处理
        } else {
          console.error('上麦接口失败----', res);
        }
        return false;
      },
      // 用户下麦接口
      speakOff() {
        return this.micServer.speakOff();
      },
      // 处理上麦失败
      async handleSpeakOnError(err) {
        if (err == 'createLocalStreamError') {
          // 本地流创建失败
          this.$message.error('初始化本地流失败，请检查设备是否被禁用或者被占用');
          // 下麦接口
          this.speakOff();
          // TODO: 派发上麦失败事件，可能需要执行销毁互动实例重新创建播放器实例的逻辑
        } else if (err == 'publishStreamError') {
          // 推流失败
          this.$message.error('推流失败');
          // 下麦接口
          this.speakOff();
          // TODO: 派发上麦失败事件，可能需要执行销毁互动实例重新创建播放器实例的逻辑
        } else if (err == 'noPermission') {
          // 无推流权限
          await this.interactiveServer.destroy();
          await this.interactiveServer.init({ role: VhallRTC.ROLE_HOST });
          await this.publishLocalStream();
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
      async startPush() {
        // 第三方推流直接开始直播
        if (useRoomBaseServer().state.isThirdStream && this.joinInfo.role_name == 1) {
          // 派发事件
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickPublishComplate')
          );
          return;
        }
        try {
          // 创建本地流
          await this.createLocalStream();
          // 推流
          await this.publishLocalStream();
          // 实时获取网络状况
          this.getLevel();

          // 主持人配置旁路主屏
          if (this.joinInfo.role_name == 1) {
            /*
             *  1、初始化互动实例时会默认传旁路自适应布局模式
             *  2、     若刷新的话，会初始化实例，则旁路展示正确
             *            不刷新，结束直播后，进行媒体设置更改，再进行开播，则需要手动调用自适应布局方法
             */
            if (sessionStorage.getItem('layout') && this.liveStatus != 1) {
              await this.setBroadCastAdaptiveLayoutMode();
            }
            if (this.mainScreen == this.joinInfo.third_party_user_id) {
              await this.setBroadCastScreen();
            }
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
      // 创建本地流
      async createLocalStream() {
        console.log('创建本地流', this.$domainStore.state.mediaSettingServer.videoType);
        if (this.$domainStore.state.mediaSettingServer.videoType == 'camera') {
          await this.interactiveServer
            .createLocalVideoStream({
              videoNode: `stream-${this.joinInfo.third_party_user_id}`
            })
            .catch(() => 'createLocalStreamError');
        } else {
          await this.sleep();
          const videoTracks = await this.$refs.imgPushStream.getCanvasStream();
          if (!videoTracks) {
            throw 'getCanvasStreamError';
          }
          await this.interactiveServer
            .createLocalPhotoStream({
              videoNode: `stream-${this.joinInfo.third_party_user_id}`,
              videoTrack: videoTracks
            })
            .catch(() => 'createLocalPhotoStreamError');
        }
      },
      // 推流
      async publishLocalStream() {
        await this.interactiveServer.publishStream().catch(e => {
          console.warn('----推流失败', e);
          if (e.code === '611007') {
            this.handleSpeakOnError('noPermission');
          } else {
            this.handleSpeakOnError('publishStreamError');
          }
        });
      },

      // 设置主屏
      async setBroadCastScreen() {
        await this.interactiveServer.setBroadCastScreen().catch(() => 'setBroadCastScreenError');
      },

      // 设置旁路布局
      async setBroadCastAdaptiveLayoutMode() {
        const param = {
          adaptiveLayoutMode: VhallRTC[sessionStorage.getItem('layout')]
        };
        await this.interactiveServer
          .setBroadCastAdaptiveLayoutMode(param)
          .catch(() => 'setBroadCastAdaptiveLayoutModeError');
      },

      // 结束推流
      stopPush() {
        return new Promise(resolve => {
          // 增加判断当前是否在推流中    助理默认是不推流，但是能监听到结束直播成功的消息
          if (!this.localSpeaker.streamId) {
            resolve();
            return;
          }
          this.interactiveServer.unpublishStream(this.localSpeaker.streamId).then(() => {
            console.warn('结束推流成功----');
            clearInterval(this._audioLeveInterval);

            // 主持人不在小组中，停止推流触发 直播结束 生成回放
            if (this.joinInfo.role_name == 1 && !this.groupServer.state.groupInitData.isInGroup) {
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
              );
            }
            resolve();
          });
        });
      },
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        const status = this.localSpeaker[`${deviceType}Muted`] ? 1 : 0;
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
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
          miniElement = roomBaseServer.state.miniElement == 'screen' ? 'stream-list' : 'screen';
        } else {
          miniElement = roomBaseServer.state.miniElement == 'doc' ? 'stream-list' : 'doc';
        }
        roomBaseServer.setChangeElement(miniElement);
      },
      // 实时获取网路状况和麦克风能量
      getLevel() {
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (!this.localSpeaker.streamId) return clearInterval(this._audioLeveInterval);
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
          if (!this.localSpeaker.streamId) return clearInterval(this._netWorkStatusInterval);
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
       * @param {Number | String} accountId 用户ID
       * @Function void()
       */
      setOwner(accountId, setMainScreen = true) {
        // if (accountId) {
        //   const streamInfo = this.getDesktopAndIntercutInfo();
        //   const users = streamInfo.remoteUsers.concat(streamInfo.localUser);
        //   const mainScreenUser = users.find(u => u.accountId == accountId) || { streams: [] };
        //   const mainScreenStream = mainScreenUser.streams.find(s => s.streamType == 2) || {};
        //   if (!mainScreenStream.streamId) return EventBus.$emit('BIGSCREENSET_FAILED');
        // }
        if (setMainScreen) {
          this.setMainScreen();
        }
        this.interactiveServer
          .setSpeaker({
            receive_account_id: accountId || this.joinInfo.third_party_user_id
          })
          .then(res => {
            console.log('setSpeaker success ::', res);
          })
          .catch(err => {
            console.error('setSpeaker failed ::', err);
          });
      },

      //  设为主画面
      setMainScreen() {
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
          }, 100);
        });
      }
    }
  };
</script>

<style lang="less">
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

    .vmp-stream-local__bootom {
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
        border-radius: 8px;
        padding: 0 6px;
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
      }
      &-mic {
        float: right;
        font-size: 12px;
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
      }
      .vmp-stream-local__shadow-label {
        display: inline-block;
        width: 54px;
        margin-right: 10px;
        text-align: right;
        color: #ffffff;
        font-size: 12px;
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
        &:hover {
          background-color: #fc5659;
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
