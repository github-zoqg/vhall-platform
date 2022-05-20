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

    <!-- 顶部流消息 -->
    <section class="vmp-stream-local__top">
      <div v-show="isShowPresentationScreen" class="vmp-stream-local__top-presentation">演示中</div>
    </section>

    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bottom" v-show="isStreamPublished && localSpeaker.streamId">
      <span class="vmp-stream-local__bottom-nickname">{{ joinInfo.nickname }}</span>
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
  import { Dialog, Toast } from 'vant';

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
      localStreamId() {
        return this.$domainStore.state.interactiveServer.localStream.streamId;
      },
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
      // 直播模式
      mode() {
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
      // 是否是无延迟直播
      isNoDelay() {
        // 1：无延迟直播
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      interactToolStatus() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus;
      },
      // 是否为自动上麦  只有不在麦上才会去设置默认禁音上麦   补充：开启自动上麦 + 分组 + 非自己主动申请/主持人邀请 + 当前不在上麦列表内
      autoSpeak() {
        return (
          this.interactToolStatus.auto_speak == 1 &&
          this.mode == 6 &&
          !this.isNotAutoSpeak &&
          !this.localSpeaker.accountId
        );
      },
      // 退出全屏   原因同wap-stream-remote
      exitScreenStatus() {
        return this.$domainStore.state.interactiveServer.fullScreenType;
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
      this.chatServer = useChatServer();
      this.groupServer = useGroupServer();
      this.roomBaseServer = useRoomBaseServer();
      this.mediaCheckServer = useMediaCheckServer();
    },
    created() {
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
        // 非直播中，直接返回
        if (this.roomBaseServer.state.watchInitData.webinar.type != 1) {
          return;
        }
        console.warn('[platform] 查看设备状态', this.mediaCheckServer.state);
        // 检测设备状态
        if (this.mediaCheckServer.state.deviceInfo.device_status != 2) {
          const isSpeakOn = this.micServer.getSpeakerStatus();
          /*
            未检测时，则检测互动SDK的支持情况
              不支持上麦时，确认是否在麦上
          */
          if (this.mediaCheckServer.state.isBrowserNotSupport) {
            this.$toast(this.$t('other.other_1010'));
            if (isSpeakOn) {
              await this.speakOff();
            }
            return;
          }
          if (isSpeakOn) {
            this.startPush();
          } else if (
            this.mode === 6 &&
            !this.chatServer.state.banned &&
            !this.chatServer.state.allBanned
          ) {
            // 是分组活动 + 非禁言状态 + 非全体禁言状 + 开启自动上麦 =>  调用上麦接口 => 收到上麦成功消息
            await this.userSpeakOn();
          }
        }
      },
      async listenEvents() {
        // 监听设备禁用
        useInteractiveServer().$on('EVENT_STREAM_END', () => {
          Dialog.alert({
            title: this.$t('account.account_1061'),
            message: this.$t('interact.interact_1011')
          });
        });
        // 房间信令异常断开事件
        this.interactiveServer.$on('EVENT_ROOM_EXCDISCONNECTED', msg => {
          console.log('网络异常断开', msg);
          Dialog.alert({
            title: this.$t('account.account_1061'),
            message: '网络异常导致互动房间连接失败'
          }).then(() => {
            window.location.reload();
          });
        });

        // 推流失败
        this.interactiveServer.$on('EVENT_REMOTESTREAM_FAILED', async e => {
          if (e.data.accountId == this.joinInfo.third_party_user_id) {
            Dialog.alert({
              title: this.$t('account.account_1061'),
              message: this.$t('interact.interact_1036')
            }).then(() => {
              window.location.reload();
            });
            // Toast(this.$t('因网络问题推流失败，正在重新推流'));
            // await this.stopPush();
            // this.startPush();
          }
        });
        useMsgServer().$onMsg('ROOM_MSG', async msg => {
          // live_over 结束直播  停止推流,
          if (msg.data.type == 'live_over' && this.micServer.getSpeakerStatus()) {
            await this.speakOff();
            await this.stopPush();
            this.interactiveServer.destroy();
          }
        });
        // 分组继续讨论，初始化互动实例完成后，开始推流
        this.interactiveServer.$on('PROCEED_DISCUSSION', msg => {
          console.log('分组继续讨论');
          this.startPush();
        });

        // 主持人同意上麦申请
        this.micServer.$on('vrtc_connect_agree', async () => {
          this.isNotAutoSpeak = true;
          this.userSpeakOn();
        });

        // 上麦成功
        this.micServer.$on('vrtc_connect_success', async () => {
          if (this.localSpeaker.streamId) return;
          // 若上麦成功后发现设备不允许上麦，则进行下麦操作
          if (this.mediaCheckServer.state.deviceInfo.device_status == 2) {
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
          }

          // 轮询判断是否有互动实例
          await this.checkVRTCInstance();
          this.startPush();
        });

        // 下麦成功
        this.micServer.$on('vrtc_disconnect_success', async () => {
          await this.stopPush();

          await this.interactiveServer.destroy();

          if (this.isNoDelay === 1) {
            //后端踢出后会检测有没有在麦上，在麦上会派发下麦消息，下麦消息内的逻辑会比组内踢出消息内的逻辑先执行，所以先调用小组信息接口，避免初始化互动参数房间ID不对。
            if (this.mode === 6) {
              await this.groupServer.updateGroupInitData();
            }
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
        return this.micServer.speakOff();
      },
      // 处理上麦失败
      async handleSpeakOnError(err) {
        if (err == 'createLocalStreamError') {
          // 本地流创建失败
          this.$message.error(this.$t('interact.interact_1016'));
          // 下麦接口
          this.speakOff();
        } else if (err == 'NotAllowed') {
          // 本地流创建失败
          this.$message.error(this.$t('interact.interact_1016'));
        } else if (err == 'publishStreamError') {
          // 推流失败
          this.$message.error(this.$t('interact.interact_1021'));
          // 下麦接口
          this.speakOff();
        } else if (err == 'noPermission') {
          await this.interactiveServer.destroy();
          await this.interactiveServer.init({ role: VhallRTC.ROLE_HOST });
          this.publishLocalStream();
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
          .catch(e => {
            if (e && e?.name == 'NotAllowed') {
              return Promise.reject('NotAllowed');
            } else {
              return Promise.reject('createLocalStreamError');
            }
          });
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
      },
      // 结束推流
      stopPush() {
        return new Promise((resolve, reject) => {
          // 增加判断当前是否在推流中
          if (!this.localStreamId) {
            resolve();
            return;
          }
          this.interactiveServer
            .unpublishStream()
            .then(() => {
              this.isStreamPublished = false;
              clearInterval(this._audioLeveInterval);
              clearInterval(this._netWorkStatusInterval);
              resolve();
            })
            .catch(e => {
              reject(e);
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
            vNode: `vmp-stream-local__${this.localSpeaker.accountId}`
          })
          .then(() => {
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

    .vmp-stream-local__bottom {
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
