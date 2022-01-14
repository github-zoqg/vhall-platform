<template>
  <div class="vmp-stream-local" :class="{ 'vmp-stream-local__publish': isStreamPublished }">
    <!-- 流容器 -->
    <section
      class="vmp-stream-local__stream-box"
      :id="`stream-${roomBaseState.watchInitData.join_info.third_party_user_id}`"
    ></section>
    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bootom" v-show="isStreamPublished">
      <span
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
      <span class="vmp-stream-local__bootom-mic iconfont iconicon_maikefeng_1"></span>
    </section>
    <!-- 遮罩层 -->
    <section class="vmp-stream-local__shadow-box">
      <p class="vmp-stream-local__shadow-first-line">
        <span class="vmp-stream-local__shadow-label">
          {{ joinInfo.role_name | roleNameFilter }}
        </span>
        <el-tooltip :content="videoStatus ? '打开摄像头' : '关闭摄像头'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon"
            @click="muteDevice('video')"
            :class="
              videoStatus
                ? 'iconfont iconicon_shexiangtouguanbi'
                : 'iconfont iconicon_shexiangtoukaiqi'
            "
          ></span>
        </el-tooltip>
        <el-tooltip :content="audioStatus ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon"
            @click="muteDevice('audio')"
            :class="audioStatus ? 'iconfont iconicon_maikefengguanbi' : 'iconfont iconyinliang'"
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
        <span class="vmp-stream-local__shadow-label">视图</span>
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
  import { useInteractiveServer, useRoomBaseServer, useMicServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  export default {
    name: 'VmpStreamLocal',
    data() {
      return {
        videoStatus: false,
        audioStatus: false,
        isFullScreen: false,
        role: '',
        roomBaseState: null,
        isStreamPublished: false,
        isStreamCreated: false
      };
    },
    computed: {
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
      this.roomBaseServer = useRoomBaseServer();
      this.roomBaseState = this.roomBaseServer.state;
      this.micServer = useMicServer();
    },
    async mounted() {
      console.log('本地流组件mounted钩子函数');
      // 主持人同意上麦
      this.micServer.$on('user_apply_host_agree', async () => {
        console.log('---同意上麦---开始推流');
        this.startPush();
      });
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
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickPublishComplate'
        });
      },
      // 开始推流，不设置旁路，主持人之外的其他角色用
      async startPush() {
        // 创建本地流
        await this.createLocalStream();
        // 推流
        await this.publishLocalStream();
        // 派发事件
        console.log(this.cuid, '----cuid----');
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickPublishComplate'
        });
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
            videoNode: `stream-${this.roomBaseState.watchInitData.join_info.third_party_user_id}`
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
          window.$middleEventSdk.event.send({
            cuid: this.cuid,
            method: 'emitClickUnpublishComplate'
          });
        });
      },
      muteDevice() {},
      speakOff() {},
      exchange() {
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickExchange'
        });
      },
      fullScreen() {}
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
    .vmp-stream-local__bootom {
      width: 100%;
      height: 28px;
      font-size: 12px;
      line-height: 28px;
      color: #ffffff;
      box-sizing: border-box;
      padding: 0 10px;
      position: absolute;
      bottom: 0;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
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
        width: 100px;
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
        margin-top: 6px;
        background-size: contain;
        height: 16px;
        width: 16px;
        background-image: url(./images/network0.png);
        &-0 {
          background-image: url(./images/network0.png);
        }
        &-1 {
          background-image: url(./images/network1.png);
        }
        &-2 {
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
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
