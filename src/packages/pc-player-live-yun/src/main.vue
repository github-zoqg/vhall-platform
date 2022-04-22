<template>
  <div class="vmp-pc-player-live-yun">
    <!-- 播放器区域 -->
    <div id="vmp-player-yun" class="player_box" v-if="roleName == 1 && !pushStream">
      <div class="top_tip" :class="streamStatus ? 'success' : 'warning'">{{ tipText }}</div>
      <div class="err_tip" v-if="false">
        <div class="err_text">云导播推流异常 {{ errarTime }}</div>
      </div>
      <div class="stream_people_name">
        {{ $domainStore.state.roomBaseServer.watchInitData.join_info.nickname }}
      </div>

      <section class="vmp-stream-local__shadow-box" :class="isMiniDoc ? 'bigScreen' : ''">
        <p class="vmp-stream-local__shadow-second-line">
          <span class="vmp-stream-local__shadow-label">视图</span>
          <el-tooltip content="切换" placement="bottom">
            <span
              class="vmp-stream-local__shadow-icon vh-iconfont vh-line-copy-document"
              @click="exchange"
            ></span>
          </el-tooltip>
          <el-tooltip :content="isFullScreen ? '关闭全屏' : '全屏'" placement="bottom">
            <span
              class="vmp-stream-local__shadow-icon vh-iconfont"
              :class="{
                'vh-line-amplification': !isFullScreen,
                'vh-line-narrow': isFullScreen
              }"
              @click="fullScreenPlayer"
            ></span>
          </el-tooltip>
        </p>
      </section>
    </div>

    <!-- 本地推流区域 -->
    <div v-else class="stream_box">
      <div class="stream_box_header">
        <span class="header_left">视频推流到云导播台 — {{ $route.query.seat_name }}</span>
        <span class="header_right">
          <span class="vh-iconfont vh-line-setting" @click="setInteractive"></span>
          <span class="vh-iconfont vh-a-line-fullscreen" @click="fullScreen"></span>
          <span class="vh-iconfont vh-line-close" @click="closePage"></span>
        </span>
      </div>

      <div id="stream-yun-box" class="stream_box_content">
        <div class="floatLayer">
          <!-- 摄像头 -->
          <el-tooltip
            :content="videoMuted == 1 ? $t('interact.interact_1022') : $t('interact.interact_1006')"
            placement="top"
          >
            <span
              class="vmp-stream-local__shadow-icon"
              @click="handleClickMuteDevice('video')"
              :class="
                videoMuted == 1
                  ? 'vh-iconfont vh-line-turn-off-video-camera'
                  : 'vh-iconfont vh-line-video-camera'
              "
            ></span>
          </el-tooltip>

          <!-- 麦克风 -->
          <el-tooltip
            :content="audioMuted == 1 ? $t('interact.interact_1015') : $t('interact.interact_1005')"
            placement="top"
          >
            <span
              class="vmp-stream-local__shadow-icon vh-iconfont"
              @click="handleClickMuteDevice('audio')"
              :class="
                audioMuted == 1 ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
              "
            ></span>
          </el-tooltip>
        </div>
        <!-- 信号图片 -->
        <span
          class="vmp-stream-local__bottom-signal"
          :class="`vmp-stream-local__bottom-signal__${networkStatus}`"
        ></span>
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
        localSpeaker: {},
        audioLevel: 1,
        networkStatus: 2,
        showFloatLayer: false,
        isFullScreen: false,
        isMiniDoc: false,
        tipText: '未检测到云导播推流',
        streamStatus: null,
        time: 3580,
        videoMuted: localStorage.getItem('videoMuted') || 0, // 1为禁用
        audioMuted: localStorage.getItem('audioMuted') || 0 // 1为禁用
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
      // 是否为推流页面
      pushStream() {
        return (
          /lives\/yun/.test(location.pathname) &&
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.is_director == 1 &&
          !/embed/.test(location.search)
        );
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      }
    },
    watch: {},
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.playerServer = usePlayerServer();
      this.interactiveServer = useInteractiveServer();
    },
    mounted() {
      console.log(this.roomBaseServer, this.pushStream, 'this.interactiveServer');
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
        return this.playerServer
          .init({
            videoNode: 'vmp-player-yun',
            type: 'live',
            liveOption: {
              type: 'auto',
              roomId: this.roomBaseServer.state.watchInitData.interact.room_id // 互动应用ID，必填
            }
          })
          .then(() => {
            console.log('%c云导播播放器初始化成功', 'color:blue');
          });
      },
      // 切换大小窗
      exchange() {
        const roomBaseServer = useRoomBaseServer();
        let miniElement = '';
        miniElement = roomBaseServer.state.miniElement == 'doc' ? 'stream-list' : 'doc';
        roomBaseServer.setChangeElement(miniElement);
        window.vhallReportForProduct?.report(110135);
        this.isMiniDoc = true;
      },
      // 播放器全屏
      fullScreenPlayer() {
        if (this.isFullScreen) {
          this.playerServer.exitFullScreen();
        } else {
          this.playerServer.enterFullScreen();
        }
        this.isFullScreen = !this.isFullScreen;
      },
      // 创建本地流
      async createLocalStream() {
        console.log('创建本地流', this.$domainStore.state.mediaSettingServer.videoType);
        if (this.$domainStore.state.mediaSettingServer.videoType == 'camera') {
          await this.interactiveServer
            .createLocalVideoStream({
              videoNode: `stream-yun-box`,
              mute: { audio: this.audioMuted == 1, video: this.videoMuted == 1 }
            })
            .then(res => {
              this.localSpeaker.streamId = res.streamId;
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
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickMediaSetting'));
      },
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        console.log(this.localSpeaker, this.interactiveServer, deviceType, 'this.localSpeaker');
        const status = this.localSpeaker[`${deviceType}Muted`] ? 1 : 0;
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
        if (deviceType == 'audio') {
          console.log(123);
          this.interactiveServer.muteAudio({
            streamId: this.localSpeaker.streamId,
            isMute: this[`${deviceType}Muted`] == 0
          });
        } else {
          console.log(456);
          this.interactiveServer.muteVideo({
            streamId: this.localSpeaker.streamId,
            isMute: this[`${deviceType}Muted`] == 0
          });
        }
        this[`${deviceType}Muted`] = this[`${deviceType}Muted`] == 1 ? 0 : 1;
        localStorage.setItem(`${deviceType}Muted`, this[`${deviceType}Muted`]);
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
      &:hover {
        .vmp-stream-local__shadow-box {
          display: flex;
        }
      }
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
        height: 100%;
        text-align: center;
        background: #000000;
        .err_text {
          position: relative;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .stream_people_name {
        position: absolute;
        bottom: 6px;
        left: 6px;
        color: white;
        font-size: 12px;
      }
      .vmp-stream-local__shadow-box {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        position: absolute;
        top: 0;
        left: 0;
        display: none;
        z-index: 5;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .vmp-stream-local__shadow-label {
          display: inline-block;
          width: 54px;
          margin-right: 10px;
          text-align: right;
          color: #ffffff;
          font-size: 12px;
        }
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
      .bigScreen {
        top: initial;
        display: flex;
        height: 40px;
        bottom: 10px;
        background-color: initial;
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
      .vmp-stream-local__bottom-signal {
        position: absolute;
        right: 10px;
        bottom: 68px;
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
