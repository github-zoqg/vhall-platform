<template>
  <div class="vmp-wap-stream-local">
    <!-- 推流Dom -->
    <div :id="`stream-${this.joinInfo.third_party_user_id}`"></div>
    <div class="vmp-wap-stream-local-foot">
      <div class="nickname">
        大煞风景第十六届大煞风景第十六届福建省大大煞风景第十六届福建省大大煞风景第十六届福建省大福建省大
      </div>
      <div class="icon-box">
        <span class="network-status" :class="`network-status${netWorkStatus}`"></span>
        <span>
          <i
            class="iconfont iconfont-bottom"
            :class="
              audioMuteStatus ? 'icona-icon_maikefeng_guanbi2x' : `iconicon_maikefeng_${audioLevel}`
            "
            style="float: right; font-size: 13px; margin-top: 1px"
          ></i>
        </span>
      </div>
    </div>
    <!-- 订阅Dom   由于订阅流组件为编写，暂时先在此处显示 -->
    <div id=""></div>
  </div>
</template>
<script>
  import { useMicServer, useInteractiveServer, usePlayerServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  export default {
    name: 'VmpWapStreamLocal',
    data() {
      return {
        // isStreamPublished: false,
        localStreamId: null,
        audioLevel: 0, // 音量等级
        netWorkStatus: 0, // 网络等级
        audioMuteStatus: false // 设备状态状态
      };
    },
    async created() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
      this.playerServer = usePlayerServer();
    },
    async mounted() {
      if (this.micServer.state.isSpeakOn) {
        await this.startPush();
      }

      /*  暂时测试使用，测试完进行删除-------优先测试本地推流逻辑使用
        // 主持人邀请观众上麦
        case 'vrtc_connect_invite':
          this.$emit('vrtc_connect_invite', msg);
          break;
        // 用户同意上麦
        case 'vrtc_connect_invite_agree':
          this.$emit('vrtc_connect_invite_agree', msg);
          break;
        // 用户拒绝上麦
        case 'vrtc_connect_invite_refused':
          this.$emit('vrtc_connect_invite_refused', msg);
          break;
      */
      // 收到上麦邀请消息
      this.micServer.$on('vrtc_connect_invite', async msg => {
        if (msg.data.target_id === this.joinInfo.third_party_user_id) {
          // 调用确认上麦接口
          this.micServer.userSpeakOn();
        }
      });

      // 上麦成功消息
      this.micServer.$on('vrtc_connect_success', async msg => {
        if (this.joinInfo.third_party_user_id == msg.data.room_join_id) {
          // 如果成功，销毁播放器
          this.playerServer.destroy();

          // 实例化互动实例
          await this.interactiveServer.init();

          // 开始推流
          this.startPush();
        }
      });
    },
    computed: {
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      }
    },
    methods: {
      async startPush() {
        try {
          let res = await this.createLocalStream();
          this.localStreamId = res.streamId;

          await this.pushLocalStream();

          // 实时获取网络状况
          this.getLevel();
        } catch (error) {
          this.handleSpeakOnError(error);
        }
      },

      // 创建流
      async createLocalStream() {
        return await this.interactiveServer
          .createWapLocalStream({
            videoNode: `stream-${this.joinInfo.third_party_user_id}`
          })
          .catch(() => 'createLocalStreamError');
      },

      // 推流
      async pushLocalStream() {
        await this.interactiveServer
          .publishStream()
          .then(() => {
            // this.isStreamPublished = true;
          })
          .catch(() => 'publishStreamError');
      },

      // 获取网络/音量状态
      getLevel() {
        // 麦克风音量查询计时器
        console.warn('this.localStream.streamId---', this.localStreamId);
        this._audioLeveInterval = setInterval(() => {
          if (!this.localStreamId) return clearInterval(this._audioLeveInterval);
          // 获取音量
          this.interactiveServer
            .getAudioLevel({ streamId: this.localStreamId })
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
          if (!this.localStreamId) return clearInterval(this._netWorkStatusInterval);
          // 获取网络状态
          this.interactiveServer
            .getStreamPacketLoss({ streamId: this.localStreamId })
            .then(status => {
              this.networkStatus = calculateNetworkStatus(status);
            })
            .catch(() => {
              clearInterval(this._netWorkStatusInterval);
              this.networkStatus = 0;
            });
        }, 2000);
      },

      // 用户下麦接口
      userSpeakOff() {
        return this.micServer.userSpeakOff();
      },

      // 错误集合
      handleSpeakOnError(err) {
        console.error('进入错误集合----', err);
        if (err == 'createLocalStreamError') {
          // 本地流创建失败
          this.$message.error('初始化本地流失败，请检查设备是否被禁用或者被占用');
          // 下麦接口
          this.userSpeakOff();
          // TODO: 派发上麦失败事件，可能需要执行销毁互动实例重新创建播放器实例的逻辑
        } else if (err == 'publishStreamError') {
          // 推流失败
          this.$message.error('推流失败');
          // 下麦接口
          this.userSpeakOff();
          // TODO: 派发上麦失败事件，可能需要执行销毁互动实例重新创建播放器实例的逻辑
        } else {
          this.$message.error('代码错误');
        }
      }
    },
    beforeDestroy() {
      // 清空计时器
      if (this._audioLeveInterval) {
        clearInterval(this._audioLeveInterval);
      }
      if (this._netWorkStatusInterval) {
        clearInterval(this._netWorkStatusInterval);
      }
    }
  };
</script>
<style lang="less">
  .vmp-wap-stream-local {
    position: relative;
    &-foot {
      position: absolute;
      bottom: 0;
      padding: 0 6px 4px;
      height: 32px;
      line-height: 32px;
      word-break: keep-all;
      width: 100%;
      color: #fff;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-end;
      box-sizing: border-box;
      z-index: 2;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%);
      & > .nickname {
        width: 50%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }
      & > .icon-box {
        font-size: 24px;
        & > .network-status {
          height: 26px;
          width: 26px;
          margin-left: 5px;
          margin-top: 3px;
          background-size: contain;
          display: inline-block;
        }
        & > .network-status2 {
          background-image: url(./images/network2.png);
        }
        & > .network-status1 {
          background-image: url(./images/network1.png);
        }
        & > .network-status0 {
          background-image: url(./images/network0.png);
        }
      }
    }
  }
</style>
