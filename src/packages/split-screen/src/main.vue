<template>
  <div class="vmp-split-screen" ref="splitScreen">
    <!-- 头部悬浮区 -->
    <div class="vmp-split-screen__tip">
      <span class="tip-txt">分屏模式</span>
      <span
        class="exit-shadow vh-iconfont vh-line-close"
        @click="exitSplitScreen"
        title="退出分屏"
      ></span>
      <span
        class="v-fullScreen vh-iconfont"
        :class="isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'"
        @click="enterFullScreen"
        title="全屏"
      ></span>
    </div>
    <!-- 流列表 -->
    <div class="vmp-split-screen__stream-list__container">
      <div
        class="vmp-split-screen__stream-list"
        :class="`vmp-split-screen__stream-list__${layoutLevel}`"
      >
        <!-- 本地流 -->
        <div class="vmp-split-screen__stream-container" v-show="localSpeaker.accountId">
          <div class="vmp-split-screen__stream-container-box">
            <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container>
          </div>
        </div>
        <!-- 远端流 -->
        <div
          class="vmp-split-screen__stream-container"
          v-for="speaker in remoteSpeakers"
          :key="speaker.accountId"
        >
          <div class="vmp-split-screen__stream-container-box">
            <vmp-stream-remote :stream="speaker"></vmp-stream-remote>
          </div>
          <!-- 同一流只能初始化一次 否则会失败n-1次 导致时间延迟 -->
          <div
            v-if="
              insertStreamInfo.userInfo.accountId == speaker.accountId && insertStreamInfo.streamId
            "
            class="vmp-split-screen__stream-split"
            :key="speaker.streamId"
          >
            <!-- 插播流 -->
            <vmp-air-container :oneself="true" :cuid="childrenCom[1]"></vmp-air-container>
            <div class="stream_info">
              <span class="nickname">{{ speaker.nickname }}</span>
              <span class="signal" :class="`signal__${networkStatus}`"></span>
              <span class="vh-iconfont audio" :class="`vh-microphone${audioLevel}`"></span>
            </div>
          </div>
          <div
            v-if="
              desktopShareServerState.desktopShareInfo.accountId == speaker.accountId &&
              desktopShareServerState.localDesktopStreamId
            "
            class="vmp-split-screen__stream-split"
            :key="speaker.streamId"
          >
            <!-- 桌面共享流 -->
            <vmp-air-container :oneself="true" :cuid="childrenCom[2]"></vmp-air-container>
            <div class="stream_info">
              <span class="nickname">{{ speaker.nickname }}</span>
              <span class="signal" :class="`signal__${networkStatus}`"></span>
              <span class="vh-iconfont audio" :class="`vh-microphone${audioLevel}`"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { calculateAudioLevel, calculateNetworkStatus } from '@/app-shared/utils/stream-utils';
  import { useSplitScreenServer, useInteractiveServer } from 'middle-domain';
  import screenfull from 'screenfull';
  export default {
    name: 'VmpSplitScreen',
    data() {
      return {
        childrenCom: [],
        isFullscreen: false, // 是否进入全屏
        layoutLevel: 1,
        audioLevel: 0,
        networkStatus: 0
      };
    },
    computed: {
      // 远端流列表showPlayIcon
      speakerList() {
        return this.$domainStore.state.micServer.speakerList;
      },
      localSpeaker() {
        return (
          this.$domainStore.state.micServer.speakerList.find(
            item =>
              item.accountId ==
              this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id
          ) || {}
        );
      },
      remoteSpeakers() {
        return (
          this.speakerList.filter(
            item =>
              item.accountId !=
              this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id
          ) || []
        );
      },
      insertStreamInfo() {
        return this.$domainStore.state.insertFileServer.insertStreamInfo;
      },
      desktopShareServerState() {
        return this.$domainStore.state.desktopShareServer;
      }
    },
    watch: {
      // 流数量变更，更新视图的布局
      'speakerList.length': {
        immediate: true,
        handler(newVal) {
          if (newVal == 1) {
            this.layoutLevel = 1;
          } else if (newVal <= 4) {
            this.layoutLevel = 2;
          } else if (newVal <= 9) {
            this.layoutLevel = 3;
          } else if (newVal <= 16) {
            this.layoutLevel = 4;
          }
        }
      },
      'insertStreamInfo.streamId': {
        deep: true,
        immediate: true,
        handler(val) {
          if (val) {
            this.getLevel();
          }
        }
      },
      'desktopShareServerState.localDesktopStreamId': {
        deep: true,
        immediate: true,
        handler(val) {
          if (val) {
            this.getLevel();
          }
        }
      }
    },
    beforeCreate() {
      this.splitScreenServer = useSplitScreenServer();
      this.interactiveServer = useInteractiveServer();
    },
    created() {
      console.log(
        this.$domainStore.state.roomBaseServer.interactToolStatus.doc_permission,
        'doc_permission'
      );
      this.childrenCom = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      // TODO: 限定特定的组件的全屏更改
      screenfull.on('change', () => {
        this.isFullscreen = screenfull.isFullscreen;
      });
      // 订阅流播放失败    监听到播放失败, 然后展示按钮
      this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', () => {
        this.playboartCount ? ++this.playboartCount : (this.playboartCount = 1);
        if (this.playboartCount > 1) {
          return;
        }
        this.$alert('您已进入直播房间，马上开始互动吧', '', {
          title: '提示',
          confirmButtonText: '立即开始',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel',
          callback: () => {
            this.interactiveServer.playAbortStreams();
          }
        });
      });
    },
    methods: {
      exitSplitScreen() {
        this.splitScreenServer.closeSplit();
      },
      enterFullScreen() {
        screenfull.toggle(this.$refs.splitScreen);
      },
      // 停止推流之后，通知主页面结束直播停止计时
      handleUnpublishComplate() {
        console.log('----停止推流之后，通知主页面结束直播停止计时----');
        // 分屏推流结束，poostMessage消息通知主页面
        this.splitScreenServer.splitSendPostMessage({
          type: 'split_unpublish_complete'
        });
        // 关闭分屏
        this.splitScreenServer.splitCloseSplitProcess(false);
      },
      getLevel() {
        let streamId =
          this.insertStreamInfo.streamId || this.desktopShareServerState.localDesktopStreamId;
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (!streamId) return clearInterval(this._audioLeveInterval);
          // 获取音量
          this.interactiveServer
            .getAudioLevel({ streamId })
            .then(level => {
              this.audioLevel = calculateAudioLevel(level);
              console.log(this.audioLevel, 'insertStreamInfo.streamId', 'this.audioLevel');
            })
            .catch(() => {
              clearInterval(this._audioLeveInterval);
              this.audioLevel = 0;
            });
        }, 1000);

        // 网络信号查询计时器
        this._netWorkStatusInterval = setInterval(() => {
          if (!streamId) return clearInterval(this._netWorkStatusInterval);
          // 获取网络状态
          console.log(this.networkStatus, 'insertStreamInfo.streamId', 'this.networkStatus');
          this.interactiveServer
            .getStreamPacketLoss({ streamId })
            .then(status => {
              this.networkStatus = calculateNetworkStatus(status);
            })
            .catch(() => {
              clearInterval(this._netWorkStatusInterval);
              this.networkStatus = 0;
              console.log(this.networkStatus, 'insertStreamInfo.streamId', 'this.networkStatus');
            });
        }, 2000);
      }
    }
  };
</script>

<style lang="less">
  .vmp-split-screen {
    &:hover {
      .vmp-split-screen__tip {
        display: flex;
      }
    }
    width: 100%;
    height: 100%;
    overflow: auto;
    background: #2d2d2d;
    flex: 1;
    height: 100%;
    background-color: #2d2d2d;
    display: flex;
    flex-direction: column;
    .vmp-split-screen__tip {
      display: none;
      position: fixed;
      z-index: 1;
      width: 100%;
      height: 50px;
      background-color: #434343;
      color: white;
      align-items: center;
      padding: 0 20px;
      justify-content: space-between;
      .exit-shadow {
        cursor: pointer;
        width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 8px;
        right: 44px;
      }
      .v-fullScreen {
        cursor: pointer;
        width: 32px;
        height: 32px;
        line-height: 32px;
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 8px;
        right: 100px;
      }
    }
    .vmp-split-screen__stream-list__container {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .vmp-split-screen__stream-list {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      &__1 {
        .vmp-split-screen__stream-container {
          overflow: hidden;
          &-box {
            height: 100vh;
            padding-top: 0 !important;
            .vmp-stream-local {
              position: static !important;
            }
            .vmp-stream-remote {
              position: static !important;
            }
          }
        }
      }
      &__2 {
        .vmp-split-screen__stream-container {
          width: calc(50vh * 16 / 9);
          max-width: 50%;
          height: 50vh;
        }
      }
      &__3 {
        .vmp-split-screen__stream-container {
          width: 33.3%;
        }
      }
      &__4 {
        .vmp-split-screen__stream-container {
          width: 25%;
        }
      }
      .vmp-split-screen__stream-container {
        box-sizing: border-box;
        position: relative;
        border: 1px solid #000;
        &-box {
          padding-top: 56.25%;
          .vmp-stream-local {
            position: absolute;
            top: 0;
          }
          .vmp-stream-remote {
            position: absolute;
            top: 0;
          }
        }
        .vmp-stream-local__shadow-box,
        .vmp-stream-remote__shadow-box {
          display: none;
        }
      }
    }
    .vmp-split-screen__stream-split {
      position: absolute;
      top: 0;
      height: 100%;
      width: 100%;
      .stream_info {
        position: absolute;
        bottom: 0;
        color: #fff;
        padding: 3px 5px;
        width: 100%;
        box-sizing: border-box;
        font-size: 12px;
        .nickname {
          display: inline-block;
          width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .audio {
          float: right;
          margin-left: 5px;
          font-size: 13px;
          color: #fff;
        }
        .signal {
          float: right;
          font-size: 12px;
          margin-left: 5px;
          background-size: contain;
          height: 16px;
          width: 16px;
          background-image: url(../../stream-remote/src/img/network0.png);
          &__0 {
            background-image: url(../../stream-remote/src/img/network0.png);
          }
          &__1 {
            background-image: url(../../stream-remote/src/img/network1.png);
          }
          &__2 {
            background-image: url(../../stream-remote/src/img/network2.png);
          }
        }
      }
    }
  }
</style>
