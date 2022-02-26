<template>
  <div class="vmp-stream-list" :class="{ 'vmp-stream-list-h0': isStreamListH0 }">
    <!-- 左翻页 -->
    <span
      v-show="isShowControlArrow"
      class="vmp-stream-list__scroll-btn left-btn"
      @click="scrollStream('left')"
    >
      <i class="vh-iconfont vh-line-arrow-left" />
    </span>

    <!-- <template v-if="showScrollDom && (isShowInteract || mode == 6)"></template> -->
    <div ref="streamWrapper" class="vmp-stream-list__stream-wrapper">
      <div class="vmp-stream-list__stream-wrapper-scroll">
        <div
          class="vmp-stream-list__local-container"
          :class="{
            'vmp-stream-list__main-screen': joinInfo.third_party_user_id == mainScreen,
            'vmp-dom__max':
              miniElement != 'stream-list' && joinInfo.third_party_user_id == mainScreen,
            'vmp-dom__mini':
              miniElement == 'stream-list' && joinInfo.third_party_user_id == mainScreen
          }"
        >
          <div class="vmp-stream-list__remote-container-h">
            <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container>
          </div>
        </div>
        <template v-if="remoteStreams.length">
          <div
            v-for="stream in remoteStreams"
            :key="stream.id"
            class="vmp-stream-list__remote-container"
            :class="{
              'vmp-stream-list__main-screen': stream.accountId == mainScreen,
              'vmp-dom__max': miniElement != 'stream-list' && stream.accountId == mainScreen,
              'vmp-dom__mini': miniElement == 'stream-list' && stream.accountId == mainScreen
            }"
          >
            <div class="vmp-stream-list__remote-container-h">
              <vmp-stream-remote :stream="stream"></vmp-stream-remote>
            </div>
          </div>
        </template>
      </div>
    </div>

    <span
      v-show="isShowControlArrow"
      class="vmp-stream-list__scroll-btn right-btn"
      @click="scrollStream('right')"
    >
      <i class="vh-iconfont vh-line-arrow-right" />
    </span>
  </div>
</template>

<script>
  import { useInteractiveServer, useRoomBaseServer, useMicServer } from 'middle-domain';
  export default {
    name: 'VmpStreamList',

    data() {
      return {
        childrenCom: [],
        isShowInteract: true, // 是否展示互动区
        isShowControlArrow: false // 是否展示左右按钮
      };
    },

    computed: {
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
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
      }
    },
    watch: {
      isStreamListH0: {
        handler(newval) {
          this.interactiveServer.setStreamListHeightInWatch(newval ? 0 : 80);
        },
        immediate: true
      },
      'remoteStreams.length'(newval) {
        this.isShowControlArrow = newval * 142 > this.$refs.streamWrapper.clientWidth;
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.roomBaseServer = useRoomBaseServer();
      this.micServer = useMicServer();
    },

    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      console.log(
        '-- this.childrenCom:',
        this.childrenCom,
        this.$domainStore.state.interactiveServer.remoteStreams
      );
    },

    mounted() {},

    methods: {
      getStreamList() {
        this.interactiveServer.getRoomStreams();
      },
      exchange(compName) {
        window.$middleEventSdk?.event?.send({
          cuid: 'ps.surface',
          method: 'exchange',
          args: [compName, 2]
        });
      },

      scrollStream(direction) {
        const scrollLeft = this.$refs.streamWrapper.scrollLeft;
        if (direction === 'left') {
          this.$refs.streamWrapper.scrollLeft = scrollLeft <= 142 ? 0 : scrollLeft - 142;
        } else {
          const scrollWidth = this.$refs.streamWrapper.scrollWidth;
          this.$refs.streamWrapper.scrollLeft =
            scrollLeft <= scrollWidth ? scrollLeft + 142 : scrollWidth;
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-list {
    height: 80px;
    width: 100%;
    background-color: #242424;
    display: flex;
    justify-content: center;
    background: #000;
    border-bottom: 1px solid #1f1f1f;

    &__stream-wrapper {
      flex: 1;
      overflow: hidden;
      display: flex;
      &-scroll {
        display: flex;
        justify-content: center;
        min-width: 100%;
        flex: none;
      }
      &::-webkit-scrollbar {
        /*隐藏滚轮*/
        display: none;
      }
    }

    // 流列表高度为0
    &-h0 {
      height: 0;
      .vmp-stream-list__main-screen {
        top: 0;
      }
    }

    &__scroll-btn {
      width: 22px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: blur(0);
      & > i {
        font-size: 12px;
        color: #e6e6e6;
      }

      // 左箭头
      &.left-btn {
        background: linear-gradient(270deg, rgba(84, 84, 84, 0) 0%, rgba(0, 0, 0, 0.85) 100%);

        border-radius: 4px 0 0 0;
      }

      // 右箭头
      &.right-btn {
        border-radius: 0 4px 0 0;
        background: linear-gradient(90deg, rgba(84, 84, 84, 0) 0%, rgba(0, 0, 0, 0.85) 100%);
      }
    }
  }
  .vmp-stream-list__local-container {
    width: 142px;
  }

  // 流列表高度不为0
  .vmp-stream-list__main-screen {
    position: absolute;
    top: 80px;
    width: calc(100% - 380px);
    .vmp-stream-list__remote-container {
      &-h {
        padding-top: 56.25%;
      }
    }

    // 主屏在大窗的样式
    &.vmp-dom__max {
      position: absolute;
      left: 0;
      bottom: 56px;
      width: calc(100% - 380px);
      height: auto;
      min-height: auto;
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

  .vmp-stream-list__remote-container {
    width: 142px;
    &-h {
      height: 100%;
    }
  }

  // 主屏在小窗的样式
  .vmp-dom__mini {
    right: 0;
    top: 0;
    width: 360px;
    z-index: 1;
  }
</style>
