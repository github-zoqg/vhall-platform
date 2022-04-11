<template>
  <div
    class="vmp-stream-remote"
    :class="{ fullscreen: isFullScreen }"
    :id="`vmp-stream-remote__${stream.streamId}`"
  >
    <!-- 流容器 -->
    <div class="vmp-stream-remote__container" :id="`stream-${stream.streamId}`"></div>

    <!-- 网络异常时占位图，根据是否有streamId判断 -->
    <section
      v-if="isShowNetError && !stream.streamId && isInstanceInit"
      class="vmp-stream-remote__container__net-error"
    >
      <div class="net-error-img"></div>
      <p>{{ $t('interact.interact_1035') }}</p>
    </section>

    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bottom">
      <span class="vmp-stream-local__bottom-nickname">
        {{ stream.attributes.nickname }}
      </span>
      <span
        class="vmp-stream-local__bottom-signal"
        :class="`vmp-stream-local__bottom-signal__${networkStatus}`"
      ></span>
    </section>
  </div>
</template>

<script>
  import { useInteractiveServer, useMicServer, useMsgServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  export default {
    name: 'VmpStreamPollingRemote',
    data() {
      return {
        audioLevel: 1,
        networkStatus: 0,
        isFullScreen: false,
        isShowNetError: false
      };
    },
    props: {
      stream: {
        require: true,
        default: () => {}
      }
    },
    watch: {
      'stream.streamId': {
        handler(newval) {
          console.log('----speaker--- 有流Id了------', newval);
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
      // 主屏 + 自动播放失败 + 观众 + 文档开启 => 此时，主屏画面在右上角
      showInterIsPlay() {
        return (
          this.mainScreen == this.stream.accountId &&
          this.interactiveServer.state.showPlayIcon &&
          this.joinInfo.role_name == 2 &&
          this.liveMode === 6
        );
      },
      isShowSplitScreenPlaceholder() {
        return (
          this.$domainStore.state.splitScreenServer.isOpenSplitScreen &&
          this.$domainStore.state.splitScreenServer.role == 'hostPage'
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
        const videos = document.querySelectorAll('.vmp-stream-remote video');
        videos.length > 0 &&
          videos.forEach(video => {
            video.play();
          });
        this.interactiveServer.state.showPlayIcon = false;
      },
      subscribeRemoteStream() {
        let videoNode = `stream-${this.stream.streamId}`;
        document.getElementById(videoNode).innerHTML = '';
        // TODO:主屏订阅大流，小窗订阅小流
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode // 远端流显示容器， 必填
          // dual: this.mainScreen == this.accountId ? 1 : 0 // 双流订阅选项， 0 为小流 ， 1 为大流  选填。 默认为 1
        };

        console.log('订阅参数', opt);
        this.interactiveServer
          .subscribe(opt)
          .then(e => {
            console.log('订阅成功--1--', e);
            if (this.joinInfo.role_name === 1) {
              this.interactiveServer.resetLayout();
            }
            setTimeout(() => {
              this.replayPlay();

              // 开始测试100ms，刷新页面还是有订阅流不播放的情况。所以改为和原线上代码一致2s
            }, 2000);
            this.getLevel();
          })
          .catch(e => {
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
      speakOff() {
        this.micServer.speakOff({
          receive_account_id: this.stream.accountId
        });

        if (this.joinInfo.role_name == 1 && this.stream.roleName == 4) {
          window.vhallReportForProduct?.report(110133);
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
            receive_account_id: accountId || this.stream.accountId
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
            receive_account_id: this.stream.accountId
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
