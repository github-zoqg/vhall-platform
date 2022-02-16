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
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>
        <el-tooltip :content="localStream.audioMuted ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              localStream.audioMuted
                ? 'vh-line-turn-off-microphone'
                : `iconicon_maikefeng_${audioLevel}`
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
            class="vmp-stream-local__shadow-icon vh-iconfont vh-line-copy-document"
            v-if="!isFullScreen"
            @click="exchange"
          ></span>
        </el-tooltip>
        <el-tooltip content="全屏" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon vh-iconfont"
            :class="{
              'vh-line-amplification': !isFullScreen,
              'vh-line-narrow': isFullScreen
            }"
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
        return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
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
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
    },
    async mounted() {
      console.log('本地流组件mounted钩子函数');
      // 主持人同意上麦
      this.micServer.$on('vrtc_connect_agree', async () => {
        // 调上麦接口
        const isSuccessSpeakOn = await this.userSpeakOn();
        if (isSuccessSpeakOn) {
          // 如果成功，销毁播放器，初始化互动，上麦

          // 如果上麦成功开始推流
          this.startPush();
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
      userSpeakOff() {
        return this.micServer.userSpeakOff();
      },
      // 处理上麦失败
      handleSpeakOnError(err) {
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
        } else if (err == 'startBroadCastError') {
          // 开启主屏失败
          console.log('开启主屏失败');
          // TODO: 主屏失败错误处理
        } else if (err == 'setBroadCastScreenError') {
          // 设置旁路主屏布局失败
          console.log('设置主屏失败');
          // TODO: 设置旁路主屏布局失败错误处理
        } else {
          throw new Error('代码错误');
        }
      },
      // 开始推流并设置旁路，主持人用
      async startPushAndSetBroadCast() {
        try {
          // 创建本地流
          await this.createLocalStream();
          // 推流
          await this.publishLocalStream();
          // 开启旁路
          await this.startBroadCast();
          // 配置旁路主屏
          await this.setBroadCastScreen();
          // 实时获取网络状况
          this.getLevel();
          // 派发事件
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickPublishComplate')
          );
        } catch (err) {
          this.handleSpeakOnError(err);
        }
      },
      // 开始推流，不设置旁路，主持人之外的其他角色用
      async startPush() {
        try {
          // 创建本地流
          await this.createLocalStream();
          // 推流
          await this.publishLocalStream();
          // 实时获取网络状况
          this.getLevel();
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
      // 开启旁路
      async startBroadCast() {
        const options1 = {
          adaptiveLayoutMode:
            VhallRTC[sessionStorage.getItem('layout')] || VhallRTC.CANVAS_ADAPTIVE_LAYOUT_TILED_MODE
        };

        await this.interactiveServer.startBroadCast(options1).catch(() => 'startBroadCastError');
      },
      // 设置主屏
      async setBroadCastScreen() {
        await this.interactiveServer.setBroadCastScreen().catch(() => 'setBroadCastScreenError');
      },
      // 结束推流
      stopPush() {
        this.interactiveServer.unpublishStream(this.localStream.streamId).then(() => {
          this.isStreamPublished = false;
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
      // 进入、退出全屏
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
      // 切换大小窗
      exchange() {
        const roomBaseServer = useRoomBaseServer();
        roomBaseServer.requestChangeMiniElement('stream-list');
      },
      // 实时获取网路状况和麦克风能量
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
      },
      speakOff() {}
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
