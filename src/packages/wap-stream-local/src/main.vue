<template>
  <div :id="`vmp-stream-local__${joinInfo.third_party_user_id}`" class="vmp-stream-local">
    <!-- 流容器 -->
    <section
      class="vmp-stream-local__stream-box"
      :id="`stream-${joinInfo.third_party_user_id}`"
    ></section>
    <!-- videoMuted 的时候显示流占位图 -->
    <section v-if="localStream.videoMuted" class="vmp-stream-local__stream-box__mute"></section>
    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bootom" v-show="isStreamPublished">
      <span
        v-show="[1, 3, 4].includes(joinInfo.role_name)"
        class="vmp-stream-local__bootom-role"
        :class="`vmp-stream-local__bootom-role__${joinInfo.role_name}`"
      >
        {{ joinInfo.role_name | roleNameFilter }}
      </span>
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
  </div>
</template>

<script>
  import { useInteractiveServer, useMicServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpWapStreamLocal',
    data() {
      return {
        isStreamPublished: false,
        networkStatus: 2,
        audioLevel: 1
      };
    },
    computed: {
      localStream() {
        console.log(
          '----localStream更新了----',
          this.$domainStore.state.interactiveServer.localStream
        );
        return this.$domainStore.state.interactiveServer.localStream;
      },
      mainScreen() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      isNoDelay() {
        // 1：无延迟直播
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
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
    created() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
    },
    async mounted() {
      if (this.micServer.state.isSpeakOn) {
        this.startPush();
      }

      // 主持人同意上麦申请
      this.micServer.$on('vrtc_connect_agree', async () => {
        this.userSpeakOn();
      });

      // 上麦成功
      this.micServer.$on('vrtc_connect_success', async msg => {
        console.log('上麦成功', msg);
        if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
          if (
            this.joinInfo.role_name == 3 ||
            (this.joinInfo.role_name == 1 && !this.localStream.streamId)
          ) {
            // 开始推流
            this.startPush();
          } else if (this.joinInfo.role_name == 2 || this.isNoDelay === 1 || this.mode === 6) {
            // 实例化互动实例
            await this.interactiveServer.init();
            // 开始推流
            this.startPush();
          }
        }
      });
      // 下麦成功
      this.micServer.$on('vrtc_disconnect_success', async () => {
        await this.stopPush();

        this.interactiveServer.destroy();
        if (this.isNoDelay === 1 || this.mode === 6) {
          // 实例化互动实例
          this.interactiveServer.init();
        }
      });
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
            await this.setBroadCastScreen();
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
        await this.interactiveServer
          .createLocalVideoStream({
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
          .catch(() => 'publishStreamError');
      },
      // 结束推流
      stopPush() {
        return new Promise(resolve => {
          this.interactiveServer.unpublishStream(this.localStream.streamId).then(() => {
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
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-local {
    width: 100%;
    height: 100%;
    position: relative;
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
  }
</style>
