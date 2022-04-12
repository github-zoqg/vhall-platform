<template>
  <div class="vmp-pc-player-live-yun">
    <!-- 播放器区域 -->
    <div id="vmp-player-yun" class="player_box" v-if="roleName == 1 && !pushStream">
      <div class="top_tip" :class="streamStatus ? 'success' : 'warning'">{{ tipText }}</div>
      <div class="err_tip">云导播推流异常 {{ errarTime }}</div>
      <div class="stream_people_name">GMIC大会悟空</div>
    </div>

    <!-- 本地推流区域 -->
    <div v-else class="stream_box">
      <div class="stream_box_header">
        <span class="header_left">视频推流到云导播台 — 机位2</span>
        <span class="header_right">
          <span class="vh-iconfont vh-line-setting" @click="setInteractive"></span>
          <span class="vh-iconfont vh-a-line-fullscreen" @click="fullScreen"></span>
          <span class="vh-iconfont vh-line-close" @click="closePage"></span>
        </span>
      </div>

      <div id="stream-yun-box" class="stream_box_content">
        <div class="floatLayer">
          <!-- 摄像头 -->
          <el-tooltip :content="$t('interact.interact_1006')" placement="top">
            <span
              class="vmp-stream-local__shadow-icon"
              @click="handleClickMuteDevice('video')"
              :class="
                localSpeaker.videoMuted
                  ? 'vh-iconfont vh-line-turn-off-video-camera'
                  : 'vh-iconfont vh-line-video-camera'
              "
            ></span>
          </el-tooltip>

          <!-- 麦克风 -->
          <el-tooltip :content="$t('interact.interact_1015')" placement="top">
            <span
              class="vmp-stream-local__shadow-icon vh-iconfont"
              @click="handleClickMuteDevice('audio')"
              :class="
                localSpeaker.audioMuted
                  ? 'vh-line-turn-off-microphone'
                  : `vh-microphone${audioLevel}`
              "
            ></span>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import { useRoomBaseServer, usePlayerServer, useInteractiveServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  export default {
    name: 'VmpPcPlayerLiveYun',
    data() {
      return {
        audioLevel: 1,
        showFloatLayer: false,
        tipText: '未检测到云导播推流',
        streamStatus: null,
        time: 3580
      };
    },
    computed: {
      errarTime() {
        let H = Math.floor(this.time / 3600);
        let M = Math.floor((this.time % 3600) / 60);
        let S = (this.time % 3600) % 60;
        return (H > 9 ? H : '0' + H) + ':' + (M > 9 ? M : '0' + M) + ':' + (S > 9 ? S : '0' + S);
      },
      // 直播类型 6分组
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData?.join_info?.role_name;
      },
      pushStream() {
        return /lives\/yun/.test(location.pathname);
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      localSpeaker() {
        console.log('-------localSpeaker更新--------');
        return (
          this.$domainStore.state.micServer.speakerList.find(
            item => item.accountId == this.joinInfo.third_party_user_id
          ) || {}
        );
      }
    },
    watch: {},
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.playerServer = usePlayerServer();
      this.interactiveServer = useInteractiveServer();
    },
    mounted() {
      this.init();
      setInterval(() => {
        this.time++;
      }, 1000);
    },
    methods: {
      async init() {
        // 主持人初始化播放器
        if (this.roleName == 1 && !this.pushStream) {
          this.initPlayer();
        } else {
          // 其他人创建本地流&推流
          await this.createLocalStream();
          await this.publishLocalStream();
          // 实时获取网络状况
          this.getLevel();
        }
      },
      // 初始化播放器
      async initPlayer() {
        console.log('云导播初始化播放器');
        return this.playerServer
          .init({
            videoNode: 'vmp-player-yun'
          })
          .then(() => {});
      },
      // 创建本地流
      async createLocalStream() {
        console.log('创建本地流', this.$domainStore.state.mediaSettingServer.videoType);
        if (this.$domainStore.state.mediaSettingServer.videoType == 'camera') {
          await this.interactiveServer
            .createLocalVideoStream({
              videoNode: `stream-yun-box`
            })
            .catch(e => {
              if (e && e?.name == 'NotAllowed') {
                return Promise.reject('NotAllowed');
              } else {
                return Promise.reject('createLocalStreamError');
              }
            });
        }
      },
      sleep(time = 1000) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(true);
          }, time);
        });
      },
      // 推流
      async publishLocalStream() {
        await this.interactiveServer.publishStream().catch(e => {
          console.log('paltForm publishLocalStream failed....', e);
          if (e.code === '611007') {
            this.handleSpeakOnError('noPermission');
          } else {
            this.handleSpeakOnError('publishStreamError');
          }
        });
      },
      // 实时获取网路状况和麦克风能量
      getLevel() {
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (
            !this.localSpeaker.streamId ||
            !this.$domainStore.state.interactiveServer.isInstanceInit
          )
            return clearInterval(this._audioLeveInterval);
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
          if (
            !this.localSpeaker.streamId ||
            !this.$domainStore.state.interactiveServer.isInstanceInit
          )
            return clearInterval(this._netWorkStatusInterval);
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
      // 关闭页面
      closePage() {
        window.open('about:blank', '_self', '');
        window.close();
      },
      // 全屏
      fullScreen() {
        console.log('全屏');
        this.interactiveServer.setStreamFullscreen({
          streamId: this.interactiveServer.state.localStream.streamId,
          vNode: `stream-yun-box`
        });
      },
      // 打开媒体设置
      setInteractive() {
        console.log(12321321);
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickMediaSetting'));
      },
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        const status = this.localSpeaker[`${deviceType}Muted`] ? 1 : 0;
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
        // 110136关闭    110137 开启
        if (deviceType == 'video') {
          window.vhallReportForProduct?.report(status == 1 ? 110137 : 110136);
        } else {
          // 110138 关闭    110139 开启
          window.vhallReportForProduct?.report(status == 1 ? 110139 : 110138);
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-pc-player-live-yun {
    width: 100%;
    height: 100%;
    .player_box,
    .stream_box,
    #stream-yun-box {
      width: 100%;
      height: 100%;
    }
    .player_box {
      position: relative;
      .top_tip {
        position: absolute;
        padding: 6px 16px;
        top: 4px;
        left: 50%;
        font-size: 14px;
        white-space: nowrap;
        border-radius: 16px;
        background: rgba(0, 0, 0, 0.5);
        transform: translate(-50%);
      }
      .warning {
        color: #fc5659;
      }
      .success {
        color: #0fba5a;
      }
      .err_tip {
        position: absolute;
        color: #fc5659;
        width: 100%;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .stream_people_name {
        position: absolute;
        bottom: 6px;
        left: 6px;
        color: white;
        font-size: 12px;
      }
    }
    .stream_box_header {
      height: 56px;
      background: #2a2a2a;
      color: #e6e6e6;
      font-size: 18px;
      display: flex;
      align-items: center;
      .header_left {
        margin-left: 36px;
      }
      .header_right {
        flex: 1 0 auto;
        text-align: right;
        margin-right: 26px;
        .vh-iconfont {
          margin-left: 10px;
          cursor: pointer;
        }
      }
    }
    .stream_box_content {
      position: relative;
      &:hover {
        .floatLayer {
          display: flex;
        }
      }
      .floatLayer {
        width: 100%;
        position: absolute;
        height: 100%;
        color: white;
        background: rgba(0, 0, 0, 0.75);
        display: none;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        z-index: 1;

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
    }
  }
</style>
