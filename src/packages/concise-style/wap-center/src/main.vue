<template>
  <div class="vmp-concise-center-wap">
    <!-- 播放 按钮 -->
    <!-- {{ isWapBodyDocSwitchFullScreen + '-' + !isPlaying + '-' + !isVodEnd + '-' + !isSmallPlayer }} -->
    <div
      v-show="isWapBodyDocSwitchFullScreen && !isPlaying && !isVodEnd && !isSmallPlayer"
      class="vmp-wap-player-pause"
      :class="{
        'player-container__sticktop': isDocStickTop
      }"
      :style="{
        'z-index': isDocStickTop ? zIndexServerState.zIndexMap.questionnaire || 302 : 12
      }"
    >
      <p @click.stop="startPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </div>
    <!-- 回放结束（正常回放和试看回放结束） -->
    <div
      v-show="isVodEnd && !isPlaying"
      class="vmp-wap-player-ending"
      v-parseImgOss="{ type: 'bg', url: webinarsBgImgVod }"
      :style="`backgroundImage: url('${webinarsBgImgVod}')`"
    >
      <!-- 回放播放结束 -->
      <div class="vmp-wap-player-ending-box" @click.stop="startPlay">
        <p class="vmp-wap-player-ending-box-noraml">
          <i class="vh-iconfont vh-line-refresh-left"></i>
        </p>
        <p class="vmp-wap-player-ending-box-reset">{{ $t('player.player_1016') }}</p>
      </div>
    </div>

    <!-- 直播结束 -->
    <div
      v-if="isLivingEnd"
      class="vmp-wap-body-ending"
      v-parseImgOss="{ type: 'bg', url: webinarsBgImgLive }"
      :style="`backgroundImage: url('${webinarsBgImgLive}')`"
    >
      <div class="vmp-wap-body-ending-box">
        <div class="vmp-wap-body-ending-box-img">
          <img src="./img/livingEnd@2x.png" alt="" />
        </div>
        <h1 class="vmp-wap-body-ending-box-text">
          {{ $t('player.player_1017') }}
        </h1>
      </div>
    </div>
    <!-- 音频直播 -->
    <div
      class="vmp-wap-player-audie"
      v-if="
        (isAudio || audioStatus) && !isVodEnd && !isShowPosterAudio && isWapBodyDocSwitchFullScreen
      "
    >
      <p>{{ $t('player.player_1014') }}</p>
    </div>
    <div
      key="vmp-concise-center-wap__doc-container"
      class="vmp-concise-center-wap__doc-container"
      :class="{
        'doc-container__mini': switchDrag,
        'doc-container__sticktop': isDocStickTop,
        'doc-container__becovered':
          isDocBeCovered || !switchStatus || (isDocStickTop && isWapBodyDocSwitchFullScreen)
      }"
      v-drag="{ close: !switchDrag }"
      :style="{
        'z-index':
          isDocBeCovered || !switchStatus || (isDocStickTop && isWapBodyDocSwitchFullScreen)
            ? -1
            : isDocStickTop
            ? zIndexServerState.zIndexMap.questionnaire || 302
            : switchDrag
            ? 302
            : 'auto'
      }"
    >
      <!-- doc组件-->
      <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container>
    </div>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { useInteractiveServer } from 'middle-domain';
  import { useZIndexServer } from 'middle-domain';

  export default {
    name: 'VmpConciseCenterWap',
    components: {},
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        // isPlayering: false, // 是否是播放状态
        isSmallPlayer: false,
        isVodEnd: false, // 回放结束
        childrenComp: [],
        abortStreams: [], // 自动播放禁止的stream列表
        isDocBeCovered: false, // 文档是否被封面覆盖，为 true 的时候将文档的层级置为 -1
        isDocStickTop: false, // 文档是否吸顶（问卷弹出的情况）
        webinarsBgImgVod: '', //回放结束背景图
        webinarsBgImgLive: '', //直播结束背景图
        audioStatus: false, // 选中清晰度是否是音频模式
        // isAudio: false, //判断是否是音频直播模式
        isLivingEnd: false,
        isShowPosterAudio: false // 音频封面显示 false
      };
    },
    computed: {
      // 是否观众可见
      switchStatus() {
        return this.$domainStore.state.docServer.switchStatus;
      },
      // 是否是无延迟活动
      noDelayWebinar() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar === 1;
      },
      // 文档可拖拽: 1.文档可见  2.文档小窗
      switchDrag() {
        return this.switchStatus && this.isWapBodyDocSwitchFullScreen;
      },
      // 竖屏直播，文档播放器位置切换的状态
      isWapBodyDocSwitchFullScreen() {
        return this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.$domainStore.state.roomBaseServer.watchInitData.webinar.type);
      },
      // 播放状态
      isPlaying(val) {
        //直播中 无延迟 且 未初始化完成，使用play的播放状态
        if (
          (this.noDelayWebinar && !this.isInstanceInit && this.webinarType == 1) ||
          !this.noDelayWebinar ||
          this.webinarType == 5
        ) {
          return this.$domainStore.state.playerServer.isPlaying;
        } else {
          return this.abortStreams.length == 0 ? true : false;
        }
      },
      // 互动 是否初始化完成
      isInstanceInit() {
        return this.interactiveServer.state.isInstanceInit;
      },
      //判断是否是音频直播模式
      isAudio() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode == 1;
      }
    },
    watch: {
      isDocStickTop(newVal, oldVal) {
        if (newVal != oldVal) {
          this.$nextTick(() => {
            if (this.switchDrag) {
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocCancleZoom'));
            }
          });
        }
      },
      switchDrag(newVal, oldVal) {
        if (newVal != oldVal) {
          this.$nextTick(() => {
            // 派发事件：docResize
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocResize'));
            if (newVal) {
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocCancleZoom'));
            }
          });
        }
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
      this.interactiveServer = useInteractiveServer();
      this.addSDKEvents();
    },
    mounted() {},
    methods: {
      startPlay() {
        if (this.isWapBodyDocSwitchFullScreen && this.switchStatus) {
          this.$domainStore.state.roomBaseServer.isWapBodyDocSwitchFullScreen = false;
        }
        if (
          (this.noDelayWebinar && !this.isInstanceInit && this.webinarType == 1) ||
          !this.noDelayWebinar ||
          this.webinarType == 5
        ) {
          this.isPlaying ? this.pause() : this.play();
        } else {
          this.abortStreams = [];
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitStreamPlay'));
        }
      },
      // 播放
      play() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerPlay'));
      },
      // 暂停
      pause() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerPause'));
      },
      // // 改变播放状态
      // updatePlayStatus(val) {
      //   this.isPlayering = val;
      // },
      // 设置文档容器是否隐藏（z-index:-1）
      setDocContainerCovered(val) {
        this.isDocBeCovered = val;
      },
      // 设置文档容器是否置顶
      setDocContainerStickTop(val) {
        this.isDocStickTop = val;
        // if (val) {
        //   this.qaZIndex = this.getQaZindex || 302;
        // }
        this.$nextTick(() => {
          // 派发事件：docResize
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitDocResize'));
        });
        this.$nextTick(() => {
          // 派发事件：设置文档容器是否置顶
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitDocContainerStickTop', [val])
          );
        });
      },
      getWebinarsBgImgVod(val) {
        this.webinarsBgImgVod = val;
      },
      getWebinarsBgImgLive(val) {
        this.webinarsBgImgLive = val;
      },
      getVodEnd(val) {
        this.isVodEnd = val;
      },
      getIsSmallPlayer(val) {
        this.IsSmallPlayer = val;
      },
      getAudioStatus(val) {
        this.audioStatus = val;
      },
      // getIsAudio(val) {
      //   this.IsAudio = val;
      // },
      getLivingEnd(val) {
        this.isLivingEnd = val;
      },
      // 事件监听
      addSDKEvents() {
        // 监听到自动播放
        this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', e => {
          console.warn('自动播放失败------', e);
          this.$set(this.abortStreams, this.abortStreams.length, e.data);
        });
      },
      getAudioPlayerPoster(val) {
        this.isShowPosterAudio = val;
      }
    }
  };
</script>

<style lang="less">
  .vmp-basic-bd {
    background-color: transparent !important;
  }
  .vmp-concise-center-wap {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
    > .vmp-wap-player-pause {
      height: 0;
      width: 0;
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 12;
      background: transparent;
      p {
        width: 108px;
        min-width: 108px;
        height: 108px;
        min-height: 108px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 46px;
          color: #f5f5f5;
        }
      }
      &.player-container__sticktop {
        height: 422px;
        width: 100vw;
        top: 0;
        left: 0;
        transform: translate(0, 0);
        z-index: 302;
      }
    }
    > .vmp-wap-player-audie {
      display: block !important;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      background: url('./img/video.gif') no-repeat;
      background-size: 100% 100%;
      p {
        font-size: 28px;
        color: #fff;
        margin-top: 40%;
        text-align: center;
      }
    }
    &__doc-container {
      background: #fff;
      &.doc-container__mini {
        position: fixed;
        top: 16px;
        right: 16px;
        height: 160px;
        width: 284px;
        z-index: 302;
        overflow: hidden;
        border-radius: 8px;
        // 文档小窗的样式
        .vmp-doc-wap {
          .pageGroup {
            display: none;
          }
          .tools {
            .btn-doc-rotate,
            .btn-doc-fullscreen,
            .btn-pager,
            .btn-doc-restore {
              display: none;
            }
          }
          .vmp-doc-placeholder__inner {
            img {
              width: 60px;
              margin-bottom: 4px;
            }
            span {
              font-size: 16px;
              line-height: 24px;
            }
          }
        }
      }
      &.doc-container__sticktop {
        position: fixed;
        left: 0 !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        height: 422px;
        width: 100%;
        z-index: 302;
        overflow: hidden;
        // 文档小窗的样式
        .vmp-doc-wap {
          .pageGroup {
            display: none;
          }
          .tools {
            .btn-doc-rotate,
            .btn-doc-fullscreen,
            .btn-doc-restore,
            .btn-doc-transposition {
              display: none;
            }
          }
          .btn-pager {
            display: none;
          }
        }
      }
      &.doc-container__becovered {
        z-index: -1;
      }
    }
  }
  .isVod .vmp-concise-center-wap > .vmp-wap-player-pause {
    display: none;
  }
</style>
