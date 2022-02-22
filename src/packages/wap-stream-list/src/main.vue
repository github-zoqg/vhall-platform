<template>
  <div
    class="vmp-stream-list"
    :class="{ 'vmp-stream-list-h0': isStreamListH0, 'vmp-stream-list-h-all': isStreamListHAll }"
  >
    <template v-if="micServer.state.isSpeakOn">
      <div
        class="vmp-stream-list__local-container"
        :class="{
          'vmp-stream-list__main-screen': joinInfo.third_party_user_id == mainScreen
        }"
      >
        <div class="vmp-stream-list__remote-container-h">
          <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container>
        </div>
      </div>
    </template>
    <template v-if="remoteStreams.length">
      <div
        v-for="stream in remoteStreams"
        :key="stream.id"
        class="vmp-stream-list__remote-container"
        :class="{
          'vmp-stream-list__main-screen': stream.accountId == mainScreen
        }"
      >
        <div class="vmp-stream-list__remote-container-h">
          <vmp-wap-stream-remote :stream="stream"></vmp-wap-stream-remote>
        </div>
      </div>
    </template>
    <!-- 播放 按钮 -->
    <div class="vmp-stream-list-pause" v-show="showPlayIcon">
      <p @click="replayPlay">
        <i class="vh-iconfont vh-line-video-play"></i>
      </p>
    </div>
  </div>
</template>

<script>
  import { useInteractiveServer, useMicServer } from 'middle-domain';
  import { debounce } from 'lodash';
  export default {
    name: 'VmpWapStreamList',

    data() {
      return {
        childrenCom: [],
        miniElement: 'mainScreen',
        maxElement: '',
        playAbort: [], // 自动播放禁止的stream列表
        showPlayIcon: false // 是否展示播放按钮
      };
    },

    computed: {
      mainScreen() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
      },
      remoteStreams() {
        console.log(
          '----远端流列表更新----',
          this.$domainStore.state.interactiveServer.remoteStreams
        );
        return this.$domainStore.state.interactiveServer.remoteStreams;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      },
      // 流列表高度是否为 0 的属性(这个属性依赖的场景比较多,后续有人更改,请更新说明注释)
      isStreamListH0() {
        /**
         * 计算方式:
         * 1. 远端流列表长度为 0
         *    1) 如果存在本地流并且不是主屏,高度不为 0,返回 false
         *    2) 如果存在本地流并且是主屏,高度为 0,返回 true
         * 2. 远端流列表长度为 1
         *    1) 如果不存在本地流并且远端流是主屏,高度为 0,返回 true
         *    2) 如果不存在本地流并且远端流不是主屏,高度不为 0,返回 false
         *    3) 如果存在本地流,高度不为 0,返回 false
         * 3. 远端流列表长度大于 1
         *    高度不为 0,返回 false
         */
        if (!this.remoteStreams.length) {
          return !(
            this.$domainStore.state.interactiveServer.localStream.streamId &&
            this.joinInfo.third_party_user_id != this.mainScreen
          );
        } else if (this.remoteStreams.length == 1) {
          if (!this.$domainStore.state.interactiveServer.localStream.streamId) {
            return this.remoteStreams[0].accountId == this.mainScreen;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      isStreamListHAll() {
        // 只存在订阅一路流的情况下进行铺满
        return (
          this.remoteStreams.length == 1 &&
          !this.$domainStore.state.interactiveServer.localStream.streamId
        );
      }
    },

    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.micServer = useMicServer();
    },

    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      console.log(
        '-- this.childrenCom:',
        this.childrenCom,
        this.$domainStore.state.interactiveServer.remoteStreams
      );
      this.addSDKEvents();
      this.replayPlay = debounce(this.replayPlay, 500);
      // this.getStreamList();
    },

    mounted() {},

    methods: {
      addSDKEvents() {
        // 监听到自动播放
        this.interactiveServer.$on(VhallRTC.EVENT_STREAM_PLAYABORT, e => {
          this.playAbort.push(e.data);
          this.showPlayIcon = true;
        });
      },
      // 恢复播放
      replayPlay() {
        this.playAbort.forEach(stream => {
          this.interactiveServer.setPlay({ streamId: stream.streamId }).then(() => {
            this.showPlayIcon = false;
          });
        });
      },
      getStreamList() {
        this.interactiveServer.getRoomStreams();
        console.log('------remoteStreams------', this.remoteStreams);
      },
      exchange(compName) {
        window.$middleEventSdk?.event?.send({
          cuid: 'ps.surface',
          method: 'exchange',
          args: [compName, 2]
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-list {
    height: 83px;
    width: 100%;
    display: flex;
    justify-content: center;
    .vmp-stream-list__local-container {
      width: 148px;
    }
    .vmp-stream-list__remote-container {
      width: 148px;
      &-h {
        height: 100%;
      }
    }

    &-pause {
      height: 100%;
      width: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
      background: transparent;
      p {
        width: 108px;
        height: 108px;
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
    }

    // 流列表高度不为0
    .vmp-stream-list__main-screen {
      position: absolute;
      top: 83px;
      width: 597px;
      height: 337px;
      .vmp-stream-list__remote-container {
        &-h {
          padding-top: 56.25%;
        }
      }
      // 为了保持16:9的比例，这里需要重写一下stream的样式
      .vmp-stream-remote {
        position: absolute;
        top: 0;
      }
      .vmp-stream-local {
        position: absolute;
        top: 0;
      }
    }

    // 流列表高度为0
    &-h0 {
      height: 0;
      .vmp-stream-list__main-screen {
        top: 0;
      }
    }
    // 铺满全屏
    &-h-all {
      width: 100%;
      top: 0;
      .vmp-stream-list__main-screen {
        top: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
