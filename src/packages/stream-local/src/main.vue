<template>
  <div
    :id="`vmp-stream-local__${joinInfo.third_party_user_id}`"
    class="vmp-stream-local"
    :class="{ 'vmp-stream-local__publish': isStreamPublished }"
  >
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
        class="vmp-stream-local__bootom-mic iconfont"
        :class="
          localStream.audioMuted ? 'iconicon_maikefeng_of' : `iconicon_maikefeng_${audioLevel}`
        "
      ></span>
    </section>
    <!-- 遮罩层 -->
    <section class="vmp-stream-local__shadow-box">
      <p class="vmp-stream-local__shadow-first-line">
        <span v-if="[1, 3, 4].includes(joinInfo.role_name)" class="vmp-stream-local__shadow-label">
          {{ joinInfo.role_name | roleNameFilter }}
        </span>
        <el-tooltip :content="localStream.videoMuted ? '打开摄像头' : '关闭摄像头'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              localStream.videoMuted
                ? 'iconfont iconicon_shexiangtouguanbi'
                : 'iconfont iconicon_shexiangtoukaiqi'
            "
          ></span>
        </el-tooltip>
        <el-tooltip :content="localStream.audioMuted ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              localStream.audioMuted ? 'iconicon_maikefeng_of' : `iconicon_maikefeng_${audioLevel}`
            "
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="top">
          <span
            class="vmp-stream-local__shadow-icon iconfont iconicon_xiamai"
            @click="speakOff"
            v-if="joinInfo.role_name != 1 && role != 20"
          ></span>
        </el-tooltip>
      </p>
      <p class="vmp-stream-local__shadow-second-line">
        <span v-if="[1, 3, 4].includes(joinInfo.role_name)" class="vmp-stream-local__shadow-label">
          视图
        </span>
        <el-tooltip content="切换" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon iconfont iconicon_qiehuan"
            v-if="!isFullScreen"
            @click="exchange"
          ></span>
        </el-tooltip>
        <el-tooltip content="全屏" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon iconfont"
            :class="{ iconicon_quanping: !isFullScreen, iconicon_quxiaoquanping: isFullScreen }"
            @click="fullScreen"
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon iconfont iconicon_xiamai"
            v-if="joinInfo.role_name != 1"
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>
    </section>
  </div>
</template>

<script>
  import { useInteractiveServer, useMicServer, useRoomBaseServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpStreamLocal',
    data() {
      return {
        isFullScreen: false,
        role: '',
        isStreamPublished: false,
        isStreamCreated: false,
        networkStatus: 2,
        audioLevel: 1
      };
    },
    computed: {
      miniElement() {
        return this.$domainStore.roomBaseServer.miniElement;
      },
      localStream() {
        console.log(
          '----localStream更新了----',
          this.$domainStore.state.interactiveServer.localStream
        );
        return this.$domainStore.state.interactiveServer.localStream;
      },
      mainScreen() {
        return this.$domainStore.state.interactiveServer.mainScreen;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
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
      // 设置主屏的次数，限制递归次数
      this._setBroadCastScreenCount = 0;
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
    },
    async mounted() {
      console.log('本地流组件mounted钩子函数');
      // 主持人同意上麦
      this.micServer.$on('vrtc_connect_agree', async () => {
        this.micServer.userSpeakOn();
        console.log('---同意上麦---开始推流');
        this.startPush();
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
      // 开始推流并设置旁路，主持人用
      async startPushAndSetBroadCast() {
        // 创建本地流
        await this.createLocalStream();
        // 推流
        await this.publishLocalStream();
        // 开启旁路
        await this.startBroadCast();
        // 配置旁路主屏
        await this.setBroadCastScreen();
        // 派发事件
        console.log(this.cuid, '----cuid----');
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickPublishComplate'));
      },
      // 开始推流，不设置旁路，主持人之外的其他角色用
      async startPush() {
        // 创建本地流
        await this.createLocalStream();
        // 推流
        await this.publishLocalStream();
        // 派发事件
        console.log(this.cuid, '----cuid----');
        this.getLevel();
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickPublishComplate'));
      },
      sleep(sleepTime) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, sleepTime);
        });
      },
      // 创建本地流
      async createLocalStream() {
        if (!this.interactiveServer) {
          return;
        }
        await this.interactiveServer
          .createLocalVideoStream({
            videoNode: `stream-${this.joinInfo.third_party_user_id}`
          })
          .then(data => {
            this.localStreamId = data.streamId;
            this.isStreamCreated = true;
          });
      },
      // 推流
      async publishLocalStream() {
        await this.interactiveServer.publishStream().then(() => {
          this.isStreamPublished = true;
        });
      },
      // 开启旁路
      async startBroadCast() {
        const options1 = {
          adaptiveLayoutMode:
            VhallRTC[sessionStorage.getItem('layout')] || VhallRTC.CANVAS_ADAPTIVE_LAYOUT_TILED_MODE
        };

        await this.interactiveServer.startBroadCast(options1).catch(async () => {
          // 等待 1000ms 重试
          await this.sleep(1000);
          await this.startBroadCast();
        });
      },
      // 设置主屏
      async setBroadCastScreen() {
        if (this._setBroadCastScreenCount >= 3) {
          return;
        }
        this._setBroadCastScreenCount++;
        await this.interactiveServer
          .setBroadCastScreen(this.localStreamId)
          .then(res => {
            console.log('设置主屏成功', res);
          })
          .catch(async error => {
            console.log('设置主屏失败', error);
            // 等待 50ms 重试
            await this.sleep(50);
            await this.setBroadCastScreen();
          });
      },
      // 结束推流
      stopPush() {
        this.interactiveServer.unpublishStream(this.localStreamId).then(() => {
          this.isStreamPublished = false;
          this.isStreamCreated = false;
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickUnpublishComplate')
          );
        });
      },
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        const status = this.interactiveServer.state.localStream[`${deviceType}Muted`] ? 1 : 0;
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.joinInfo.third_party_user_id
        });
      },
      speakOff() {},
      fullScreen() {
        if (!this.isFullScreen) {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.localStream.streamId,
              vNode: `vmp-stream-local__${this.joinInfo.third_party_user_id}`
            })
            .then(() => {
              this.isFullScreen = true;
            });
        } else {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.localStream.streamId,
              vNode: `vmp-stream-local__${this.joinInfo.third_party_user_id}`
            })
            .then(() => {
              this.isFullScreen = false;
            });
        }
      },
      exchange() {
        const roomBaseServer = useRoomBaseServer();
        roomBaseServer.requestChangeMiniElement('stream-list');
      },
      getLevel() {
        // 麦克风音量查询计时器
        this._audioLeveInterval = setInterval(() => {
          if (!this.localStream.streamId) clearInterval(this._audioLeveInterval);
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
          if (!this.localStream.streamId) clearInterval(this._netWorkStatusInterval);
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
    &.vmp-stream-local__publish {
      &:hover {
        .vmp-stream-local__shadow-box {
          display: flex;
        }
      }
    }
    .vmp-stream-local__stream-box {
      width: 100%;
      height: 100%;
    }
    .vmp-stream-local__stream-box__mute {
      background-image: url(./images/no_video_bg.png);
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
        background-image: url(./images/network0.png);
        &__0 {
          background-image: url(./images/network0.png);
        }
        &__1 {
          background-image: url(./images/network1.png);
        }
        &__2 {
          background-image: url(./images/network2.png);
        }
      }
    }
    // 遮罩层样式
    .vmp-stream-local__shadow-box {
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
      .vmp-stream-local__shadow-first-line {
        line-height: 36px;
      }
      .vmp-stream-local__shadow-second-line {
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
        &:hover {
          background-color: #fc5659;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
