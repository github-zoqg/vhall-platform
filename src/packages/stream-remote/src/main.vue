<template>
  <div class="vmp-stream-remote" :id="`vmp-stream-remote__${stream.streamId}`">
    <!-- 流容器 -->
    <div class="vmp-stream-remote__container" :id="`stream-${stream.streamId}`"></div>
    <!-- videoMuted 的时候显示流占位图; 开启分屏的时候显示分屏占位图 -->
    <section
      v-if="stream.videoMuted || isShowSplitScreenPlaceholder"
      class="vmp-stream-remote__container__placeholder"
      :class="{
        'vmp-stream-remote__container__placeholder-spliting': isShowSplitScreenPlaceholder,
        'vmp-stream-remote__container__placeholder-mute':
          stream.videoMuted && !isShowSplitScreenPlaceholder
      }"
    ></section>

    <!-- 音频直播的的时候显示流占位图 -->
    <section v-if="liveMode == 1" class="vmp-stream-remote__container__audio"></section>

    <!-- 网络异常时占位图，根据是否有streamId判断 -->
    <section v-if="!stream.streamId" class="vmp-stream-remote__container__net-error">
      <div class="net-error-img"></div>
      <p>对方网络异常</p>
    </section>

    <!-- 顶部流消息 -->
    <section class="vmp-stream-local__top">
      <div v-show="isShowPresentationScreen" class="vmp-stream-local__top-presentation">演示中</div>
    </section>

    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bootom">
      <span
        v-show="[1, 3, 4].includes(stream.attributes.roleName) && isInGroup"
        class="vmp-stream-local__bootom-role"
        :class="`vmp-stream-local__bootom-role__${stream.attributes.roleName}`"
      >
        {{ stream.attributes.roleName | roleFilter }}
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
    <!-- {{ joinInfo.role_name }} -- {{ groupRole }} -->
    <!-- 鼠标 hover 遮罩层 -->
    <section v-if="mainScreen == stream.accountId" class="vmp-stream-remote__shadow-box">
      <p
        v-if="joinInfo.role_name == 1 || groupRole == 20"
        class="vmp-stream-remote__shadow-first-line"
      >
        <span
          v-if="[1, 3, 4].includes(stream.attributes.roleName)"
          class="vmp-stream-local__shadow-label"
        >
          {{ stream.attributes.roleName | roleFilter }}
        </span>

        <el-tooltip :content="stream.videoMuted ? '打开摄像头' : '关闭摄像头'" placement="top">
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

        <el-tooltip :content="stream.audioMuted ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              stream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
            "
          ></span>
        </el-tooltip>
      </p>

      <p class="vmp-stream-remote__shadow-second-line" v-if="liveMode != 1">
        <span
          v-if="[1, 3, 4].includes(stream.attributes.roleName)"
          class="vmp-stream-local__shadow-label"
        >
          视图
        </span>

        <el-tooltip content="切换" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-line-copy-document"
            v-if="miniElement && !isFullScreen"
            @click="exchange"
          ></span>
        </el-tooltip>

        <el-tooltip :content="isFullScreen ? '关闭全屏' : '全屏'" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            :class="{
              'vh-line-amplification': !isFullScreen,
              'vh-line-narrow': isFullScreen
            }"
            @click="fullScreen"
          ></span>
        </el-tooltip>

        <!-- 主持人和组长不能互相下麦 -->
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            v-if="isShowDownMicBtn"
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>
    </section>

    <section v-else class="vmp-stream-remote__shadow-box">
      <p
        v-if="joinInfo.role_name == 1 || groupRole == 20"
        class="vmp-stream-remote__shadow-first-line"
      >
        <el-tooltip :content="stream.videoMuted ? '打开摄像头' : '关闭摄像头'" placement="top">
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

        <el-tooltip :content="stream.audioMuted ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont"
            @click="handleClickMuteDevice('audio')"
            :class="
              stream.audioMuted ? 'vh-line-turn-off-microphone' : `vh-microphone${audioLevel}`
            "
          ></span>
        </el-tooltip>
        <!--
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
            v-if="joinInfo.role_name != 1 && stream.attributes.roleName != 20"
          ></span>
        </el-tooltip> -->
      </p>

      <p
        v-if="joinInfo.role_name == 1 || groupRole == 20"
        class="vmp-stream-remote__shadow-second-line"
      >
        <el-tooltip content="设为主讲人" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
            v-show="
              !isInGroup && (stream.attributes.roleName == 4 || stream.attributes.roleName == 1)
            "
            @click="setOwner(stream.accountId)"
          ></span>
        </el-tooltip>

        <!-- 设为主画面 -->
        <el-tooltip content="设为主画面" placement="bottom">
          <span
            v-show="isShowSetMainScreenBtn"
            @click="setMainScreen"
            class="vmp-stream-remote__shadow-icon vh-saas-iconfont vh-saas-line-speaker1"
          ></span>
        </el-tooltip>

        <el-tooltip content="下麦" placement="bottom">
          <span
            v-show="isShowDownMicBtn"
            class="vmp-stream-remote__shadow-icon vh-iconfont vh-a-line-handsdown"
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>
    </section>

    <!-- VmpBasicCenterContainer 组件内还有一个占位图 -->
    <!-- <section class="vmp-stream-remote__pause" v-show="showInterIsPlay">
      <img :src="coverImgUrl" alt />
      <p @click.stop="replayPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </section> -->
  </div>
</template>

<script>
  import { useInteractiveServer, useMicServer, useRoomBaseServer } from 'middle-domain';
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
      liveMode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      //默认的主持人id
      hostId() {
        const { watchInitData = {} } = this.$domainStore.state.roomBaseServer;
        const { webinar = {} } = watchInitData;
        return webinar?.userinfo?.user_id;
      },
      //当前的组长id
      groupLeaderId() {
        return this.$domainStore.state.groupServer.groupInitData.doc_permission;
      },
      // 小组内角色，20为组长
      groupRole() {
        return this.$domainStore.state.groupServer.groupInitData?.join_role;
      },
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      },
      mainScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.main_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
        }
      },
      presentationScreen() {
        if (this.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.presentation_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.presentation_screen;
        }
      },
      //显示是否在演示中
      isShowPresentationScreen() {
        const { accountId } = this.stream;
        const sameId = this.presentationScreen === accountId;
        const groupMode = this.liveMode == 6;
        const inMainRoomUser = !this.isInGroup && accountId != this.hostId;
        const inGroupRoomUser = this.isInGroup && accountId != this.groupLeaderId;
        const allowedUser = inMainRoomUser || inGroupRoomUser;
        return sameId && groupMode && allowedUser;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      // 封面图
      coverImgUrl() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.img_url;
      },
      // 主屏 + 自动播放失败 + 观众 + 文档开启 => 此时，主屏画面在右上角
      showInterIsPlay() {
        return (
          this.mainScreen == this.stream.accountId &&
          this.interactiveServer.state.showPlayIcon &&
          this.joinInfo.role_name == 2 &&
          this.liveMode === 6
        );
      },
      isShowSplitScreenPlaceholder() {
        return (
          this.$domainStore.state.splitScreenServer.isOpenSplitScreen &&
          this.$domainStore.state.splitScreenServer.role == 'host'
        );
      },
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      // 主持人、组长是否显示下麦按钮
      isShowDownMicBtn() {
        return (
          (this.joinInfo.role_name == 1 && this.stream.accountId != this.groupLeaderId) ||
          (this.groupRole == 20 && this.stream.roleName != 1)
        );
      },
      isShowSetMainScreenBtn() {
        if (this.isInGroup) {
          return true;
        } else {
          return (
            this.stream.roleName == 2 || (this.joinInfo.role_name == 1 && this.stream.roleName != 4)
          );
        }
      }
    },
    filters: {},
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
    },
    created() {
      this.listenEvents();
    },
    mounted() {},
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
      listenEvents() {
        this.micServer.$on('live_over', () => {
          clearInterval(this._audioLeveInterval);
          clearInterval(this._netWorkStatusInterval);
        });

        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              // 离开全屏
              this.isFullScreen = false;
            }
          },
          true
        );
      },
      // 恢复播放
      replayPlay() {
        const videos = document.querySelectorAll('video');
        videos.length > 0 &&
          videos.forEach(video => {
            video.play();
          });
        this.interactiveServer.state.showPlayIcon = false;
      },
      subscribeRemoteStream() {
        // TODO:主屏订阅大流，小窗订阅小流
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode: `stream-${this.stream.streamId}` // 远端流显示容器， 必填
          // dual: this.mainScreen == this.accountId ? 1 : 0 // 双流订阅选项， 0 为小流 ， 1 为大流  选填。 默认为 1
        };

        console.log('订阅参数', opt);
        this.interactiveServer
          .subscribe(opt)
          .then(e => {
            console.log('订阅成功--1--', e);
            this.getLevel();
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
      speakOff() {
        this.micServer.speakOff({
          receive_account_id: this.stream.accountId
        });
      },
      fullScreen() {
        if (!this.isFullScreen) {
          this.interactiveServer
            .setStreamFullscreen({
              streamId: this.stream.streamId,
              vNode: `vmp-stream-remote__${this.stream.streamId}`
            })
            .then(() => {
              this.isFullScreen = true;
            });
        } else {
          this.interactiveServer
            .exitStreamFullscreen({
              streamId: this.stream.streamId,
              vNode: `vmp-stream-remote__${this.stream.streamId}`
            })
            .then(() => {
              this.isFullScreen = false;
            });
        }
      },
      // 切换大小窗
      exchange() {
        const roomBaseServer = useRoomBaseServer();
        let miniElement = '';
        if (this.isShareScreen) {
          miniElement = roomBaseServer.state.miniElement == 'screen' ? 'stream-list' : 'screen';
        } else {
          miniElement = roomBaseServer.state.miniElement == 'doc' ? 'stream-list' : 'doc';
        }
        roomBaseServer.setChangeElement(miniElement);
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

      /**
       * 设置主讲人
       * @param {Number | String} accountId 用户ID
       * @Function void()
       */
      setOwner(accountId, setMainScreen = true) {
        // if (accountId) {
        //   const streamInfo = this.getDesktopAndIntercutInfo();
        //   const users = streamInfo.remoteUsers.concat(streamInfo.localUser);
        //   const mainScreenUser = users.find(u => u.accountId == accountId) || { streams: [] };
        //   const mainScreenStream = mainScreenUser.streams.find(s => s.streamType == 2) || {};
        //   if (!mainScreenStream.streamId) return EventBus.$emit('BIGSCREENSET_FAILED');
        // }
        if (setMainScreen) {
          this.setMainScreen();
        }
        this.interactiveServer
          .setSpeaker({
            receive_account_id: accountId || this.stream.accountId
          })
          .then(res => {
            console.log('setSpeaker success ::', res);
          })
          .catch(err => {
            console.error('setSpeaker failed ::', err);
          });
      },

      //  设为主画面
      setMainScreen() {
        this.interactiveServer
          .setMainScreen({
            receive_account_id: this.stream.accountId
          })
          .then(res => {
            console.log('setmainscreen success ::', res);
          })
          .catch(err => {
            console.error('setmainscreen failed ::', err);
          });
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-remote {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.85);
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
    .vmp-stream-remote__container__placeholder {
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      &-mute {
        background-image: url(./img/no_video_bg.png);
      }
      &-spliting {
        background-color: #2d2d2d;
        background-image: url(./img/split.png);
        background-size: 80px 52px;
        background-position: center;
      }
    }

    .vmp-stream-remote__container__audio {
      background-image: url(./img/audio.gif);
      background-size: cover;
      background-repeat: no-repeat;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    // 网络异常占位图
    .vmp-stream-remote__container__net-error {
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
        height: 18px;
        margin-bottom: 1px;
        background-image: url('./img/net-error.png');
        background-size: cover;
        background-repeat: no-repeat;
      }
      & > p {
        font-size: 12px;
        color: #ccc;
      }
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
    .vmp-stream-local__top {
      pointer-events: none;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      &-presentation {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 12px;
        color: @font-dark-normal;
        padding: 0 8px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        margin: 4px 0 0 4px;
        overflow: hidden;
        text-align: left;
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

    // 暂停按钮
    &__pause {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 6;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      img {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
      p {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 32px;
          color: #f5f5f5;
        }
      }
    }
  }
</style>
