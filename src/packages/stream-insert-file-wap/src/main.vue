<template>
  <div
    id="vmp-wap-insert-file"
    :class="{
      'vmp-wap-insert-file-main-screen': isMergeMode,
      'vmp-wap-insert-file-main-screen-top': isMergeMode && !isSpeakOn
    }"
    v-show="isOpenInsertFile && !isAudio"
    @click="openSet"
  >
    <!-- 退出全屏 -->
    <div
      class="vmp-stream-remote-exitscreen"
      @click.stop="exitFullScreen"
      v-if="isFull && iconShow"
    >
      <i class="vh-iconfont vh-a-line-exitfullscreen"></i>
    </div>
    <!-- 进入全屏 -->
    <div
      v-if="!isFull && iconShow"
      class="vmp-wap-stream-wrap-mask-screen"
      @click.stop="setFullScreen"
    >
      <i class="vh-iconfont vh-a-line-fullscreen"></i>
    </div>
    <!-- 订阅桌面共享容器 -->
  </div>
</template>

<script>
  import { useRoomBaseServer, useInsertFileServer, useInteractiveServer } from 'middle-domain';

  export default {
    name: 'VmpWapInsertFIle',
    data() {
      return {
        isFull: false,
        iconShow: false
      };
    },

    computed: {
      isOpenInsertFile() {
        return this.insertFileServer.state.insertStreamInfo.streamId;
      },
      // 是否是音频插播
      isAudio() {
        return !this.$domainStore.state.insertFileServer.insertStreamInfo.has_video;
      },
      // 是否是合并模式
      isMergeMode() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout == 1;
      },
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.insertFileServer = useInsertFileServer();
      this.interactiveServer = useInteractiveServer();
    },
    created() {
      this.addEvents();
    },
    mounted() {
      if (this.isOpenInsertFile) {
        this.subscribeInsert();
      }
    },
    methods: {
      // 订阅插播流
      subscribeInsert() {
        const opt = {
          videoNode: 'vmp-wap-insert-file', // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };
        try {
          this.insertFileServer.subscribeInsertStream(opt);
        } catch (error) {
          console.log('error', error);
        }
      },
      addEvents() {
        // 监听全屏变化
        window.addEventListener(
          'fullscreenchange',
          () => {
            if (!document.fullscreenElement) {
              this.isFull = false;
              this.iconShow = false;
            }
          },
          true
        );
        // 监听插播流加入
        this.insertFileServer.$on('INSERT_FILE_STREAM_ADD', () => {
          this.subscribeInsert();
        });
        // 监听插播流离开
        this.insertFileServer.$on('INSERT_FILE_STREAM_REMOVE', () => {
          try {
            this.insertFileServer.unsubscribeInsertStream();
          } catch (error) {
            console.log('error', error);
          }
        });
        // 本地推流或订阅远端流异常断开事件
        this.insertFileServer.$on('INSERT_FILE_STREAM_FAILED', () => {
          this.subscribeInsert();
        });
        // this.insertFileServer.$on('insert_mic_mute_change', status => {
        //   if (status == 'play') {
        //     this.$toast(this.$t('interact.interact_1026'));
        //   } else {
        //     this.$toast('麦克风开启，对方将听到您的声音');
        //   }
        // });
      },
      // 全屏
      setFullScreen() {
        /*
         * 布局原因：wap进入全屏仅全屏主屏流， 本地流和远端流都存在被设置为主屏情况
         *    进入全屏在list内，退出全屏在remote/local内进行退出
         */
        this.interactiveServer
          .setStreamFullscreen({
            streamId: this.isOpenInsertFile,
            vNode: `vmp-wap-insert-file`
          })
          .then(() => {
            this.isFull = true;
          });
      },
      // 退出全屏
      exitFullScreen() {
        this.interactiveServer
          .exitStreamFullscreen({
            streamId: this.isOpenInsertFile,
            vNode: `vmp-wap-insert-file`
          })
          .then(() => {
            this.isFull = false;
          });
      },
      openSet() {
        console.log(12312312321);
        this.iconShow = true;
        this.fiveDown();
      },
      // 5秒后消失
      fiveDown() {
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.iconShow = false;
          this.isOpenlang = false;
        }, 5000);
      }
    }
  };
</script>

<style lang="less">
  @desk-w: 597px;
  @desk-h: 337px;
  #vmp-wap-insert-file {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    // 合并模式下，桌面共享只占主画面
    &.vmp-wap-insert-file-main-screen {
      width: @desk-w;
      height: @desk-h;
      left: calc((100% - @desk-w) / 2);
      top: 85px;
      &-top {
        top: 0;
      }
    }
  }
</style>
