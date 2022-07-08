<template>
  <div
    class="vmp-stream-remote"
    :id="`vmp-stream-remote__${stream.streamId}`"
    @click.stop="showExitScreen"
  >
    <!-- 流容器 -->
    <div class="vmp-stream-remote__container" :id="`stream-${stream.streamId}`"></div>
    <!-- videoMuted 的时候显示流占位图 -->
    <section v-if="stream.videoMuted" class="vmp-stream-remote__container__mute"></section>

    <!-- 音频直播的的时候显示流占位图 -->
    <section v-if="liveMode == 1" class="vmp-stream-remote__container__audio"></section>

    <!-- 网络异常时占位图，根据是否有streamId判断 -->
    <section
      v-if="isShowNetError && !stream.streamId && isInstanceInit"
      class="vmp-stream-remote__container__net-error"
    >
      <div class="net-error-img"></div>
    </section>

    <!-- 顶部流消息 -->
    <section class="vmp-stream-local__top">
      <div v-show="isShowPresentationScreen" class="vmp-stream-local__top-presentation">演示中</div>
    </section>

    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bottom" v-show="stream.streamId">
      <span class="vmp-stream-local__bottom-nickname">{{ stream.attributes.nickname }}</span>
      <span
        class="vmp-stream-local__bottom-signal"
        :class="`vmp-stream-local__bottom-signal__${networkStatus}`"
      ></span>
      <span
        class="vmp-stream-local__bottom-mic vh-iconfont"
        :class="stream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`"
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
  import { useInteractiveServer, useMicServer, useMsgServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '@/app-shared/utils/stream-utils';
  export default {
    name: 'VmpWapStreamRemote',
    data() {
      return {
        audioLevel: 1, // 音量范围 默认值
        networkStatus: 0, // 网络范围 默认值
        isShowNetError: false
      };
    },
    props: {
      stream: {
        require: true,
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    watch: {
      'stream.streamId': {
        handler(newval) {
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
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
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
      // 文档演示者的ID
      presentationScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.presentation_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.presentation_screen;
        }
      },
      // 主屏ID
      mainScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.main_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
        }
      },
      //显示是否在演示中
      isShowPresentationScreen() {
        const { accountId } = this.stream;
        const sameId = this.presentationScreen === accountId; // 演示者ID为当前流的用户ID
        const groupMode = this.liveMode == 6; // 分组类型
        const inMainRoomUser = !this.isInGroup && accountId != this.hostId; // 在主房间且不是主持人
        const inGroupRoomUser = this.isInGroup && accountId != this.groupLeaderId; // 在分组房间且不是组长
        const allowedUser = inMainRoomUser || inGroupRoomUser; // 普通用户

        return sameId && groupMode && allowedUser;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 是否展示退出全屏值     放置domain层原因：由于全屏按钮放置streamlist层，全屏的不知是本地流还是远端流
      exitScreenStatus() {
        return this.$domainStore.state.interactiveServer.fullScreenType;
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
    },
    created() {
      setTimeout(() => {
        if (!this.stream.streamId) {
          this.isShowNetError = true;
        }
      }, 5000);

      this.listenEvents();
    },
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
        useMsgServer().$onMsg('JOIN', this.handleUserJoin);
        useMsgServer().$onMsg('LEFT', this.handleUserLeave);

        // 订阅失败
        this.interactiveServer.$on('EVENT_REMOTESTREAM_FAILED', e => {
          if (e.data.accountId == this.stream.accountId) {
            this.isShowNetError = true;
            // Toast(this.$t(`interact.interact_1014`, { n: this.stream.nickname }));
            // this.subscribeRemoteStream();
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
      subscribeRemoteStream() {
        console.log('开始订阅', JSON.stringify(this.stream));
        let videoNode = `stream-${this.stream.streamId}`;
        document.getElementById(videoNode).innerHTML = '';
        // TODO:主屏订阅大流，小窗订阅小流
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode // 远端流显示容器， 必填
          // dual: this.mainScreen == this.accountId ? 1 : 0 // 双流订阅选项， 0 为小流 ， 1 为大流  选填。 默认为 1
        };
        this.interactiveServer
          .subscribe(opt)
          .then(e => {
            console.warn('订阅成功---------', e);
            try {
              if (document.querySelector(`#stream${e.streamId}`)) {
                document.querySelector(`#stream${e.streamId}`).play();
              }
              if (document.querySelector(`#stream${e.streamId}`)) {
                document.querySelector(`#stream${e.streamId}`).play();
              }
            } catch (error) {
              console.error('业务自行--- 播放失败----------', error);
            }
            this.getLevel();
          })
          .catch(e => {
            console.error('订阅失败----', e); // object 类型， { code:错误码, message:"", data:{} }
          });
      },
      getLevel() {
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (!this.stream.streamId) clearInterval(this._audioLeveInterval);
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
          if (!this.stream.streamId) clearInterval(this._netWorkStatusInterval);
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
            streamId: this.stream.streamId,
            vNode: `vmp-stream-remote__${this.stream.streamId}`
          })
          .then(() => {
            this.interactiveServer.state.fullScreenType = false;
          });
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-remote {
    width: 100%;
    height: 100%;
    background-color: #000;
    position: relative;

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

    .vmp-stream-remote__container {
      width: 100%;
      height: 100%;
    }
    .vmp-stream-remote__container__mute {
      background-image: url(./img/no_video_bg.png);
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
        width: 30px;
        height: 25px;
        margin-bottom: 1px;
        background-image: url('./img/net-error.png');
        background-size: cover;
        background-repeat: no-repeat;
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
      &-nickname {
        display: inline-block;
        width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
    &-exitscreen {
      width: 64px;
      height: 64px;
      line-height: 64px;
      z-index: 4;
      background: rgba(0, 0, 0, 0.4);
      position: absolute;
      left: 50%;
      top: 50%;
      text-align: center;
      transform: translate(-32px, -32px);
      border-radius: 50%;
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
