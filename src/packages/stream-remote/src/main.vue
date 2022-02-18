<template>
  <div class="vmp-stream-remote" :id="`vmp-stream-remote__${stream.streamId}`">
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
    <!-- 鼠标 hover 遮罩层 -->
    <section class="vmp-stream-remote__shadow-box">
      <p class="vmp-stream-remote__shadow-first-line">
        <span
          v-if="[1, 3, 4].includes(stream.attributes.roleName)"
          class="vmp-stream-local__shadow-label"
        >
          {{ stream.attributes.roleName | roleNameFilter }}
        </span>
        <el-tooltip
          v-if="isShowVideoControl"
          :content="stream.videoMuted ? '打开摄像头' : '关闭摄像头'"
          placement="top"
        >
          <span
            class="vmp-stream-remote__shadow-icon"
            @click="handleClickMuteDevice('video')"
            :class="
              stream.videoMuted
                ? 'vh-iconfont vh-line-turn-off-video-camera'
                : 'vh-iconfont vh-line-video-camera'
            "
          ></span>
        </el-tooltip>
        <el-tooltip
          v-if="isShowAudioControl"
          :content="stream.audioMuted ? '打开麦克风' : '关闭麦克风'"
          placement="top"
        >
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              stream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
            "
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="stream.attributes.roleName != 1 && stream.attributes.roleName != 20"
          ></span>
        </el-tooltip>
      </p>
      <p class="vmp-stream-remote__shadow-second-line">
        <span
          v-if="[1, 3, 4].includes(stream.attributes.roleName)"
          class="vmp-stream-local__shadow-label"
        >
          视图
        </span>
        <el-tooltip content="切换" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-line-copy-document"
            v-if="!isFullScreen"
            @click="exchange"
          ></span>
        </el-tooltip>
        <el-tooltip content="全屏" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            :class="{
              'vh-line-amplification': !isFullScreen,
              'vh-line-narrow': isFullScreen
            }"
            @click="fullScreen"
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            v-if="stream.attributes.roleName != 1"
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>
    </section>
  </div>
</template>

<script>
  import { useInteractiveServer } from 'middle-domain';
  import { calculateAudioLevel, calculateNetworkStatus } from '../../app-shared/utils/stream-utils';
  export default {
    name: 'VmpStreamRemote',
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
      // 点击mute按钮事件
      handleClickMuteDevice(deviceType) {
        const status = this.stream[`${deviceType}Muted`] ? 1 : 0;
        this.interactiveServer.setDeviceStatus({
          device: deviceType == 'video' ? 2 : 1,
          status,
          receive_account_id: this.stream.accountId
        });
      },
      speakOff() {},
      fullScreen() {
        this.interactiveServer.setStreamFullscreen({
          streamId: this.stream.streamId,
          vNode: `vmp-stream-remote__${this.stream.streamId}`
        });
      },
      exchange() {
        this.roomBaseServer.requestChangeMiniElement('stream-list');
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
      background-image: url(./images/no_video_bg.png);
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
    .vmp-stream-remote__shadow-box {
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
      .vmp-stream-remote__shadow-first-line {
        line-height: 36px;
      }
      .vmp-stream-remote__shadow-second-line {
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
      .vmp-stream-remote__shadow-icon {
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
