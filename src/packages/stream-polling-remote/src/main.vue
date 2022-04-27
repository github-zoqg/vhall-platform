<template>
  <div
    class="vmp-polling-stream-remote"
    :class="{ fullscreen: isFullScreen }"
    :id="`vmp-polling-stream-remote__${stream.streamId}`"
  >
    <!-- 流容器 -->
    <div class="vmp-polling-stream-remote__container" :id="`stream-${stream.streamId}`"></div>

    <!-- 网络异常时占位图，根据是否有streamId判断 -->
    <section
      v-if="isShowNetError && !stream.streamId && isInstanceInit"
      class="vmp-polling-stream-remote__container__net-error"
    >
      <div class="net-error-img"></div>
      <p>{{ $t('interact.interact_1035') }}</p>
    </section>

    <!-- 底部流信息 -->
    <section class="vmp-polling-stream__bottom">
      <span class="vmp-polling-stream__bottom-nickname">
        {{ stream.attributes.nickname }}
      </span>
      <span
        class="vmp-polling-stream__bottom-signal"
        :class="`vmp-polling-stream__bottom-signal__${networkStatus}`"
      ></span>
    </section>

    <section class="vmp-polling-stream-remote__shadow-box">
      <el-tooltip
        :content="isFullScreen ? $t('doc.doc_1009') : $t('doc.doc_1010')"
        placement="bottom"
      >
        <span
          class="vmp-polling-stream-remote__shadow-icon vh-iconfont"
          :class="{
            'vh-line-amplification': !isFullScreen,
            'vh-line-narrow': isFullScreen
          }"
          v-show="stream.streamId"
          @click="fullScreen"
        ></span>
      </el-tooltip>
    </section>
  </div>
</template>

<script>
  import { useInteractiveServer, useMicServer, useMsgServer } from 'middle-domain';
  import { calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  import clientMsgApi from '@/packages/app-shared/utils/clientMsgApi';
  export default {
    name: 'VmpStreamPollingRemote',
    data() {
      return {
        networkStatus: 0,
        isFullScreen: false,
        isShowNetError: false // 是否展示网络异常占位图
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
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
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
    beforeDestroy() {
      // 清空计时器
      if (this._netWorkStatusInterval) {
        clearInterval(this._netWorkStatusInterval);
      }

      useMsgServer().$offMsg('JOIN', this.handleUserJoin);
      useMsgServer().$offMsg('LEFT', this.handleUserLeave);
    },
    methods: {
      listenEvents() {
        this.micServer.$on('live_over', () => {
          clearInterval(this._netWorkStatusInterval);
        });

        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              // 离开全屏
              this.isFullScreen = false;
              // 网页退出全屏
              clientMsgApi.JsCallQtMsg({ type: 'videoRoundExitFull' });
            }
          },
          true
        );

        this.interactiveServer.$on('EVENT_REMOTESTREAM_FAILED', e => {
          if (e.data.accountId == this.stream.accountId) {
            this.isShowNetError = true;
          }
        });

        // 加入房间
        useMsgServer().$onMsg('JOIN', this.handleUserJoin);
        useMsgServer().$onMsg('LEFT', this.handleUserLeave);

        // 客户端关闭全屏事件
        clientMsgApi.onQtCallFunctionPage(msg => {
          // 客户端关闭全屏事件
          if (msg === 13) {
            // 退出全屏
            this.fullScreen();
          }
        });

        if (this.$route.query.embed === 'client') {
          window.addEventListener('keydown', e => {
            if (e.keyCode == 27 && this.isFullScreen) {
              this.fullScreen();
            }
          });
        }
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
        const videos = document.querySelectorAll('.vmp-polling-stream-remote video');
        videos.length > 0 &&
          videos.forEach(video => {
            video.play();
          });
      },
      subscribeRemoteStream() {
        let videoNode = `stream-${this.stream.streamId}`;
        document.getElementById(videoNode).innerHTML = '';
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode // 远端流显示容器， 必填
        };

        this.interactiveServer
          .subscribe(opt)
          .then(() => {
            setTimeout(() => {
              this.replayPlay();
            }, 2000);
            this.getLevel();
          })
          .catch(e => {
            console.log('订阅失败----', e); // object 类型， { code:错误码, message:"", data:{} }
          });
      },

      fullScreen() {
        if (!this.isFullScreen) {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.stream.streamId,
              vNode: `vmp-polling-stream-remote__${this.stream.streamId}`
            })
            .then(() => {
              this.isFullScreen = true;
              // 网页进入全屏
              clientMsgApi.JsCallQtMsg({ type: 'videoRoundFull' });
            });
        } else {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.stream.streamId,
              vNode: `vmp-polling-stream-remote__${this.stream.streamId}`
            })
            .then(() => {
              this.isFullScreen = false;
              // 网页退出全屏
              clientMsgApi.JsCallQtMsg({ type: 'videoRoundExitFull' });
            });
        }
      },

      getLevel() {
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
      }
    }
  };
</script>

<style lang="less">
  .vmp-polling-stream-remote {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
    position: relative;
    &:hover {
      .vmp-polling-stream-remote__shadow-box {
        display: flex;
      }
    }
    &.fullscreen {
      .vmp-polling-stream-remote__shadow-box {
        display: flex;
        height: 24px;
        bottom: 10px;
        flex-direction: row;
        top: auto;
        background: rgba(0, 0, 0, 0);
        .vmp-polling-stream-remote__shadow-icon {
          // background: none;
          &:hover {
            background-color: #fb3a32;
          }
        }
      }
      .vmp-polling-stream__bottom {
        padding: 0 25px;
      }
    }
    .vmp-polling-stream-remote__container {
      width: 100%;
      height: 100%;
      background-color: #1a1a1a;
    }

    // 网络异常占位图
    .vmp-polling-stream-remote__container__net-error {
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

    .vmp-polling-stream__bottom {
      width: 100%;
      height: 50px;
      font-size: 14px;
      line-height: 50px;
      color: #e6e6e6;
      box-sizing: border-box;
      padding: 0 6px;
      position: absolute;
      bottom: 0;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
      overflow: hidden;
      &-nickname {
        display: inline-block;
        width: 80px;
        line-height: 70px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &-signal {
        float: right;
        font-size: 14px;
        margin-left: 5px;
        background-size: contain;
        height: 70px;
        line-height: 70px;
        width: 16px;
        background-position: center;
        background-repeat: no-repeat;
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
    .vmp-polling-stream-remote__shadow-box {
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
      .vmp-polling-stream-remote__shadow-icon {
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
        &:hover {
          background-color: #fb3a32;
        }
      }
    }
  }
</style>
