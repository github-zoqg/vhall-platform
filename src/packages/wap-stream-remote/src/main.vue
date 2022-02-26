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
    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bootom">
      <span
        v-show="[1, 3, 4].includes(stream.attributes.roleName)"
        class="vmp-stream-local__bootom-role"
        :class="`vmp-stream-local__bootom-role__${stream.attributes.roleName}`"
      >
        {{ stream.attributes.roleName | roleNameFilter }}
      </span>
      <span class="vmp-stream-local__bootom-nickname">{{ stream.attributes.nickname }}</span>
      <span
        class="vmp-stream-local__bootom-signal"
        :class="`vmp-stream-local__bootom-signal__${networkStatus}`"
      ></span>
      <span
        class="vmp-stream-local__bootom-mic vh-iconfont"
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
  import { useInteractiveServer, useMicServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  export default {
    name: 'VmpWapStreamRemote',
    data() {
      return {
        audioLevel: 1,
        networkStatus: 0,
        isFullScreen: false
      };
    },
    props: {
      stream: {
        require: true
      }
    },
    computed: {
      // 是否显示摄像头开关按钮
      isShowVideoControl() {
        // 如果当前人是主持人,并且是主屏,显示
        // if (this.joinInfo.role_name == 1 && this.mainScreen == this.joinInfo.third_party_user_id) {
        //   return true
        // } else
        return true;
      },
      // 是否显示麦克风开关按钮
      isShowAudioControl() {
        return true;
      },
      mainScreen() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      exitScreenStatus() {
        return this.$domainStore.state.interactiveServer.fullScreenType;
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
    },
    mounted() {
      this.subscribeRemoteStream();
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
      subscribeRemoteStream() {
        // TODO:主屏订阅大流，小窗订阅小流
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode: `stream-${this.stream.streamId}` // 远端流显示容器， 必填
          // dual: this.mainScreen == this.accountId ? 1 : 0 // 双流订阅选项， 0 为小流 ， 1 为大流  选填。 默认为 1
        };
        this.interactiveServer
          .subscribe(opt)
          .then(e => {
            console.log('订阅成功----', e);
            this.getLevel();
            // 保证订阅成功后，正确展示画面   有的是订阅成功后在暂停状态显示为黑画面
            setTimeout(() => {
              const list = document.getElementsByTagName('video');
              for (const item of list) {
                item.play();
              }
            }, 2000);
          })
          .catch(e => {
            console.log('订阅失败----', e); // object 类型， { code:错误码, message:"", data:{} }
          });
      },
      speakOff() {
        this.micServer.speakOff({
          receive_account_id: this.stream.accountId
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
      showExitScreen() {
        if (!this.exitScreenStatus) {
          this.interactiveServer.state.fullScreenType = true;
        }
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.interactiveServer.state.fullScreenType = false;
        }, 5000);
      },
      exitFullScreen() {
        this.interactiveServer
          .exitStreamFullscreen({
            streamId: this.stream.streamId,
            vNode: `vmp-stream-remote__${this.stream.streamId}`
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
  .vmp-stream-remote {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    &:hover {
      .vmp-stream-remote__shadow-box {
        display: flex;
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
    }
  }
</style>
