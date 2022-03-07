<template>
  <div
    :id="`vmp-stream-local__${joinInfo.third_party_user_id}`"
    class="vmp-stream-local"
    :class="{ 'vmp-stream-local__publish': isStreamPublished }"
  >
    <!-- 流容器 -->
    <section
      class="vmp-stream-local__stream-box"
      :id="`stream-${joinInfo.third_party_user_id}`"
    ></section>
    <!-- videoMuted 的时候显示流占位图 -->
    <section
      v-if="localStream.videoMuted && mode != 1"
      class="vmp-stream-local__stream-box__mute"
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

    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bootom" v-show="isStreamPublished">
      <!-- <span
        v-show="[1, 3, 4].includes(joinInfo.role_name)"
        class="vmp-stream-local__bootom-role"
        :class="`vmp-stream-local__bootom-role__${joinInfo.role_name}`"
      >
        {{ joinInfo.role_name | roleNameFilter }}
      </span> -->
      <span class="vmp-stream-local__bootom-nickname">{{ joinInfo.nickname }}</span>
      <span
        class="vmp-stream-local__bootom-signal"
        :class="`vmp-stream-local__bootom-signal__${networkStatus}`"
      ></span>
      <span
        class="vmp-stream-local__bootom-mic vh-iconfont"
        :class="
          localStream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
        "
      ></span>
    </section>
    <!-- 遮罩层 主屏-->
    <section v-if="mainScreen == joinInfo.third_party_user_id" class="vmp-stream-local__shadow-box">
      <p class="vmp-stream-local__shadow-first-line">
        <span v-if="[1, 3, 4].includes(joinInfo.role_name)" class="vmp-stream-local__shadow-label">
          {{ joinInfo.role_name | roleNameFilter }}
        </span>
        <el-tooltip :content="localStream.videoMuted ? '打开摄像头' : '关闭摄像头'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              localStream.videoMuted
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>

        <el-tooltip :content="localStream.audioMuted ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              localStream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
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
    <section v-else class="vmp-stream-local__shadow-box">
      <p class="vmp-stream-local__shadow-first-line">
        <el-tooltip :content="localStream.videoMuted ? '打开摄像头' : '关闭摄像头'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              localStream.videoMuted
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>
        <el-tooltip :content="localStream.audioMuted ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              localStream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
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
      <p v-if="joinInfo.role_name == 1" class="vmp-stream-local__shadow-second-line">
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
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="showDownMic"
          ></span>
        </el-tooltip>
      </p>
    </section>

    <!-- 播放按钮 -->
    <section class="vmp-stream-local__pause" v-show="showInterIsPlay">
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
    useChatServer
  } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import ImgStream from './components/img-stream/index.vue';
  export default {
    name: 'VmpStreamLocal',
    data() {
      return {
        isFullScreen: false,
        isStreamPublished: false,
        networkStatus: 2,
        audioLevel: 1,
        showDownMic: false
      };
    },
    components: {
      ImgStream
    },
    computed: {
      // 小组内角色，20为组长
      groupRole() {
        return this.$domainStore.state.groupServer.groupInitData?.join_role;
      },
      localStream() {
        console.log(
          '----localStream更新了----',
          this.$domainStore.state.interactiveServer.localStream
        );
        return this.$domainStore.state.interactiveServer.localStream;
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
      // 实例化后是否需要调用上麦接口
      isNeedSpeakOn() {
        // 分组直播 + 未开启禁言 + 未开启全体禁言 + 非助理[ 角色 1主持人2观众3助理4嘉宾 ]
        // isSpeakOffToInit 自动上麦后，如果下麦，会重新初始化互动实例，不加这个变量会又一次走自动上麦
        return (
          this.mode === 6 &&
          !this.chatServer.state.banned &&
          !this.chatServer.state.allBanned &&
          this.joinInfo.role_name != 3 &&
          !this.micServer.state.isSpeakOffToInit
        );
      },
      showInterIsPlay() {
        return (
          this.mainScreen == this.joinInfo.third_party_user_id &&
          this.interactiveServer.state.showPlayIcon &&
          this.joinInfo.role_name == 2
        );
      }
    },
    filters: {
      roleNameFilter(roleName) {
        const roleNameMap = {
          1: '主持人',
          2: '观众',
          3: '助理',
          4: '嘉宾',
          20: '组长'
        };
        return roleNameMap[roleName];
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
      this.playerServer = usePlayerServer();
      this.groupServer = useGroupServer();
      this.chatServer = useChatServer();
    },
    created() {
      this.listenEvents();
    },
    async mounted() {
      window.streamLocal = this;
      console.log('本地流组件mounted钩子函数,是否在麦上', this.micServer.state.isSpeakOn);
      this.isNeedSpeak();
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
      isNeedSpeak() {
        // 实例化后是否是上麦状态
        const isSpeakOn =
          (this.isInGroup && this.groupServer.getGroupSpeakStatus()) ||
          this.micServer.state.isSpeakOn;
        if (isSpeakOn) {
          this.startPush();
        } else if (this.isNeedSpeakOn) {
          this.userSpeakOn();
        } else {
          this.micServer.setSpeakOffToInit(false);
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
          this.userSpeakOn();
        });

        // 上麦成功
        this.micServer.$on('vrtc_connect_success', async msg => {
          if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
            if (this.localStream.streamId) return;
            if ([1, 3, 4, '1', '3', '4'].includes(this.joinInfo.role_name)) {
              // 开始推流
              this.startPush();
            } else if (this.joinInfo.role_name == 2 || this.isNoDelay === 1 || this.mode === 6) {
              // 无延迟｜分组直播
              // 如果成功，销毁播放器
              this.playerServer.destroy();
              //  初始化互动实例
              await this.interactiveServer.init();
              // 开始推流
              this.startPush();
            }
          }
        });
        // 下麦成功
        this.micServer.$on('vrtc_disconnect_success', async () => {
          await this.stopPush();

          await this.interactiveServer.destroy();

          if (
            this.isNoDelay === 1 ||
            this.mode === 6 ||
            [4, '4'].includes(this.joinInfo.role_name)
          ) {
            //  初始化互动实例
            this.interactiveServer.init();
          } else {
            // 初始化播放器
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'initPlayer'));
          }
        });
        // 结束直播
        this.interactiveServer.$on('live_over', async () => {
          await this.stopPush();
          if (![1, 3, 4].includes(parseInt(this.joinInfo.role_name))) {
            this.interactiveServer.destroy();
          }
        });

        // 本人被踢出来
        this.groupServer.$on('ROOM_GROUP_KICKOUT', msg => {
          if (this.joinInfo.third_party_user_id === msg.data.target_id) {
            //  重新初始化互动实例
            this.interactiveServer.init();
          }
        });

        // 观众的监听
        if (this.joinInfo.role_name == 2) {
          // 分组 - 结束讨论
          this.groupServer.$on('GROUP_SWITCH_END', async () => {
            try {
              //  初始化互动实例
              await this.interactiveServer.init();
              this.isNeedSpeak();
            } catch (error) {
              console.log('分组结束讨论', error);
            }
          });

          // 分组 - 开始讨论
          this.groupServer.$on('GROUP_SWITCH_START', async () => {
            if (this.localStream.streamId) {
              await this.stopPush();
              await this.interactiveServer.destroy();
              //  初始化互动实例
              await this.interactiveServer.init();
            }
            if (this.isNeedSpeakOn) {
              this.userSpeakOn();
            }
          });

          // 开启摄像头
          this.interactiveServer.$on('vrtc_frames_display', () => {
            this.$toast(this.$t('interact.interact_1024'));
          });
          // 关闭摄像头
          this.interactiveServer.$on('vrtc_frames_forbid', () => {
            this.$toast(this.$t('interact.interact_1023'));
          });
          // 开启音频
          this.interactiveServer.$on('vrtc_mute_cancel', () => {
            this.$toast(this.$t('interact.interact_1015'));
          });
          // 关闭音频
          this.interactiveServer.$on('vrtc_mute', () => {
            this.$toast(this.$t('interact.interact_1026'));
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

          if (this.isStreamPublished) {
            await this.interactiveServer.unpublishStream(this.localStream.streamId);
            await this.startPush();
          }
        } else {
          if (param.audioInput) {
            this.interactiveServer
              .switchStream({
                streamId: this.localStream.streamId,
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
                streamId: this.localStream.streamId,
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
      handleSpeakOnError(err) {
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
        await this.interactiveServer
          .publishStream()
          .then(() => {
            this.isStreamPublished = true;
          })
          .catch(() => 'publishStreamError');
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
          if (!this.isStreamPublished) {
            resolve();
            return;
          }
          this.interactiveServer.unpublishStream(this.localStream.streamId).then(() => {
            console.warn('结束推流成功----');
            this.isStreamPublished = false;
            clearInterval(this._audioLeveInterval);

            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
            );
            resolve();
          });
        });
      },
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        const status = this.interactiveServer.state.localStream[`${deviceType}Muted`] ? 1 : 0;
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
        if (deviceType === 'video') {
          status
            ? this.$message.success(this.$t('interact.interact_1024'))
            : this.$message.success(this.$t('interact.interact_1023'));
        }
        if (deviceType === 'audio') {
          status
            ? this.$message.success(this.$t('interact.interact_1015'))
            : this.$message.success(this.$t('interact.interact_1026'));
        }
      },
      // 进入、退出全屏
      fullScreen() {
        if (!this.isFullScreen) {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.localStream.streamId,
              vNode: `vmp-stream-local__${this.joinInfo.third_party_user_id}`
            })
            .then(() => {
              this.isFullScreen = true;
            });
        } else {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.localStream.streamId,
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
        roomBaseServer.requestChangeMiniElement('stream-list');
      },
      // 实时获取网路状况和麦克风能量
      getLevel() {
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (!this.localStream.streamId) return clearInterval(this._audioLeveInterval);
          // 获取音量
          this.interactiveServer
            .getAudioLevel({ streamId: this.localStream.streamId })
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
          if (!this.localStream.streamId) return clearInterval(this._netWorkStatusInterval);
          // 获取网络状态
          this.interactiveServer
            .getStreamPacketLoss({ streamId: this.localStream.streamId })
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
    .vmp-stream-local__stream-box__mute {
      background-image: url(./img/no_video_bg.png);
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
      z-index: 1;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
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
