<template>
  <div
    :id="`vmp-stream-local__${joinInfo.third_party_user_id}`"
    class="vmp-stream-local"
    @click.stop="showExitScreen"
  >
    <!-- 流容器 -->
    <section
      class="vmp-stream-local__stream-box"
      :id="`stream-${joinInfo.third_party_user_id}`"
    ></section>
    <!-- videoMuted 的时候显示流占位图 -->
    <section v-if="localSpeaker.videoMuted" class="vmp-stream-local__stream-box__mute"></section>
    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bootom" v-show="isStreamPublished && localSpeaker.streamId">
      <span
        v-show="[1, 3, 4].includes(joinInfo.role_name)"
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
    <!-- 退出全屏 -->
    <div
      class="vmp-stream-remote-exitscreen"
      :class="[exitScreenStatus ? 'opcity-true' : 'opcity-flase']"
      @click.stop="exitFullScreen"
    >
      <i class="vh-iconfont vh-a-line-exitfullscreen"></i>
    </div>
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useMicServer,
    useChatServer,
    useGroupServer,
    useMsgServer,
    useRoomBaseServer,
    useMediaCheckServer,
    usePlayerServer
  } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpWapStreamLocal',
    data() {
      return {
        isStreamPublished: false,
        networkStatus: 2, // 网络状况
        audioLevel: 1, // 音量状况
        isNotAutoSpeak: false // 是否自动上麦   此值只用于 申请上麦及同意上麦消息处使用
      };
    },
    computed: {
      localSpeaker() {
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
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      },
      // 主屏
      mainScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.main_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
        }
      },
      // 当前用户信息
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 直播模式
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      isNoDelay() {
        // 1：无延迟直播
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      interactToolStatus() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus;
      },
      // 是否为自动上麦  只有不在麦上才会去设置默认禁音上麦
      autoSpeak() {
        return (
          this.interactToolStatus.auto_speak == 1 &&
          this.mode == 6 &&
          !this.isNotAutoSpeak &&
          !this.localSpeaker.accountId
        );
      },
      // 退出全屏
      exitScreenStatus() {
        return this.$domainStore.state.interactiveServer.fullScreenType;
      }
    },
    filters: {},
    created() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
      this.chatServer = useChatServer();
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
      this.listenEvents();
    },
    mounted() {
      this.checkStartPush();
    },
    async beforeDestroy() {
      // 清空计时器
      if (this._audioLeveInterval) {
        clearInterval(this._audioLeveInterval);
      }
      if (this._netWorkStatusInterval) {
        clearInterval(this._netWorkStatusInterval);
      }
      if (this.micServer.getSpeakerStatus()) {
        await this.speakOff();
        await this.stopPush();
        this.interactiveServer.destroy();
      }
    },
    methods: {
      // 检查推流
      async checkStartPush() {
        /*
         * 刷新进入页面 是否自动上麦 ( 若在分组+在小组内的麦上  || 在麦上)
         *     1、默认在麦上  ------>   不论什么活动直接上麦
         *     2、默认不在麦上 ----->
         *             a: 是分组活动 + 非禁言状态 + 非全体禁言状 + 开启自动上麦 =>  调用上麦接口 => 收到上麦成功消息
         */
        if (useMediaCheckServer().state.deviceInfo.device_status === 1) {
          // 检测设备状态
          const isSpeakOn = this.micServer.getSpeakerStatus();
          if (isSpeakOn) {
            this.startPush();
          } else if (
            this.mode === 6 &&
            !this.chatServer.state.banned &&
            !this.chatServer.state.allBanned
          ) {
            await this.userSpeakOn();
          }
        } else {
          if (this.micServer.getSpeakerStatus()) {
            this.speakOff();
          }
        }
      },
      async listenEvents() {
        useMsgServer().$onMsg('ROOM_MSG', async msg => {
          // live_over 结束直播  停止推流,
          if (msg.data.type == 'live_over') {
            if (this.micServer.getSpeakerStatus()) {
              await this.speakOff();
              await this.stopPush();
              this.interactiveServer.destroy();
            }
          }
        });

        // 主持人同意上麦申请
        this.micServer.$on('vrtc_connect_agree', async () => {
          this.isNotAutoSpeak = true;
          this.userSpeakOn();
        });

        // 上麦成功
        this.micServer.$on('vrtc_connect_success', async msg => {
          if (this.localSpeaker.streamId) return;
          // 若上麦成功后发现设备不允许上麦，则进行下麦操作
          if (useMediaCheckServer().state.deviceInfo.device_status == 2) {
            this.speakOff();
            return;
          }
          console.log('[stream-local] vrtc_connect_success startPush');

          // 无延迟｜分组直播
          // 如果成功，销毁播放器
          if (useRoomBaseServer().state.watchInitData.webinar.no_delay_webinar == 0) {
            usePlayerServer().destroy();
          }

          if (!this.interactiveServer.state.autoSpeak) {
            //  初始化互动实例
            await this.interactiveServer.init();
            // 开始推流
          }

          // 轮询判断是否有互动实例
          await this.checkVRTCInstance();
          this.startPush();
        });

        // 下麦成功
        this.micServer.$on('vrtc_disconnect_success', async () => {
          await this.stopPush();

          await this.interactiveServer.destroy();

          if (this.isNoDelay === 1 || this.mode === 6) {
            //  初始化互动实例
            await this.interactiveServer.init();
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
      },
      // 自动上麦禁音条件更新
      updateAutoSpeak() {
        this.isNotAutoSpeak = true;
      },
      // 上麦接口
      async userSpeakOn() {
        const res = await this.micServer.userSpeakOn();
        console.warn('res----', res);
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
          await this.interactiveServer.destroy();
          await this.interactiveServer.init({ role: VhallRTC.ROLE_HOST });
          this.publishLocalStream();
        } else if (err == 'startBroadCastError') {
          // 开启主屏失败
          console.log('开启主屏失败');
          // TODO: 主屏失败错误处理
        } else if (err == 'setBroadCastScreenError') {
          // 设置旁路主屏布局失败
          console.log('设置主屏失败');
          // TODO: 设置旁路主屏布局失败错误处理
        } else if (err == 'getCanvasStreamError') {
          console.error('获取图片流track错误');
        } else if (err == 'createLocalPhotoStreamError') {
          this.$message.error('初始化图片流失败');
        } else {
          console.error(err);
          throw new Error('代码错误');
        }
      },
      // 检测互动实例 由于上麦接口调用成功比互动实例化快，故进行等待
      checkVRTCInstance() {
        return new Promise((resolve, reject) => {
          let count = 0;
          const timer = setInterval(() => {
            if (this.interactiveServer.interactiveInstance) {
              resolve(true);
              clearInterval(timer);
            } else {
              count++;
              console.log('checkVRTCInstance count', count);
              if (count > 20) {
                clearInterval(timer);
                console.error('互动实例不存在');
                reject(false);
              }
            }
          }, 100);
        });
      },
      // 开始推流
      async startPush() {
        try {
          this.interactiveServer.state.defaultStreamBg = true;
          // 创建本地流
          await this.createLocalStream();
          // 推流
          await this.publishLocalStream();
          // 分组活动 自动上麦默认禁音
          console.warn('自动上麦条件：', this.autoSpeak);
          if (this.autoSpeak) {
            this.interactiveServer.setDeviceStatus({
              device: 1, // 1:audio    2:video
              status: 0, // 0:禁音    1:打开麦克风
              receive_account_id: this.joinInfo.third_party_user_id
            });
          }
          // 实时获取网络状况
          this.getLevel();
          this.interactiveServer.state.defaultStreamBg = false;
        } catch (err) {
          this.interactiveServer.state.defaultStreamBg = false;
          this.handleSpeakOnError(err);
        }
      },
      // 创建本地流
      async createLocalStream() {
        await this.interactiveServer
          .createWapLocalStream({
            videoNode: `stream-${this.joinInfo.third_party_user_id}`
          })
          .catch(() => 'createLocalStreamError');
      },
      // 推流
      async publishLocalStream() {
        await this.interactiveServer
          .publishStream()
          .then(() => {
            this.isStreamPublished = true;
          })
          .catch(e => {
            if (e.code === '611007') {
              this.handleSpeakOnError('noPermission');
            } else {
              this.handleSpeakOnError('publishStreamError');
            }
          });
        // .catch(() => 'publishStreamError');
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
            this.isStreamPublished = false;
            clearInterval(this._audioLeveInterval);

            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
            );
            resolve();
          });
        });
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

      // 显示退出全屏按钮    5秒后隐藏
      showExitScreen() {
        if (!this.exitScreenStatus) {
          this.interactiveServer.state.fullScreenType = true;
        }
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.interactiveServer.state.fullScreenType = false;
        }, 5000);
      },
      // 退出全屏
      exitFullScreen() {
        this.interactiveServer
          .exitStreamFullscreen({
            streamId: this.localSpeaker.streamId,
            vNode: `vmp-stream-local__${this.stream.streamId}`
          })
          .then(res => {
            console.warn('res----', res);
            this.interactiveServer.state.fullScreenType = false;
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
    overflow: hidden;
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
    .vmp-stream-local__bootom {
      width: 100%;
      height: 24px;
      font-size: 12px;
      line-height: 24px;
      color: #fff;
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
    .opcity-flase {
      display: none;
      transition: all 1s;
      -webkit-transition: all 1s;
    }
    .opcity-true {
      opacity: 1;
      transition: all 1s;
      z-index: 6;
      -webkit-transition: all 1s;
      i {
        color: #fff;
      }
    }
  }
</style>
