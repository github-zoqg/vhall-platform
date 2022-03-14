<template>
  <div
    class="vmp-stream-list-wrapper"
    ref="noDelayStreamContainer"
    :class="{
      'no-delay-layout': isUseNoDelayLayout,
      'vmp-dom__mini': isUseNoDelayLayout && miniElement == 'stream-list'
    }"
  >
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
            v-show="localSpeaker.accountId"
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

          <template
            v-if="remoteSpeakers.length && roomBaseServer.state.watchInitData.webinar.type == 1"
          >
            <div
              v-for="speaker in remoteSpeakers"
              :key="speaker.accountId"
              class="vmp-stream-list__remote-container"
              :class="{
                'vmp-stream-list__main-screen': speaker.accountId == mainScreen,
                'vmp-dom__max': miniElement != 'stream-list' && speaker.accountId == mainScreen,
                'vmp-dom__mini': miniElement == 'stream-list' && speaker.accountId == mainScreen
              }"
            >
              <div class="vmp-stream-list__remote-container-h">
                <vmp-stream-remote :stream="streamInfo(speaker)"></vmp-stream-remote>
              </div>
            </div>
          </template>

          <!-- 主持人进入小组后助理占位图 -->
          <div
            v-if="mode == 6 && isHostInGroup && !isInGroup"
            class="vmp-stream-list__host-placeholder-in-group vmp-stream-list__main-screen"
            :class="{
              'vmp-dom__mini': miniElement == 'stream-list',
              'vmp-dom__max': miniElement != 'stream-list'
            }"
          >
            <i class="vh-saas-iconfont vh-saas-a-line-Requestassistance"></i>
            小组协作中
          </div>
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
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useRoomBaseServer,
    useMicServer,
    useGroupServer
  } from 'middle-domain';
  import { streamInfo } from '@/packages/app-shared/utils/stream-utils';

  export default {
    name: 'VmpStreamList',

    data() {
      return {
        childrenCom: [],
        isShowInteract: true, // 是否展示互动区
        isShowControlArrow: false, // 是否展示左右按钮
        // 主持人是否在小组内
        isHostInGroup: !!this.$domainStore.state.roomBaseServer.interactToolStatus.is_host_in_group,
        streamInfo
      };
    },

    computed: {
      isInteractiveInited() {
        return this.$domainStore.state.interactiveServer.isInteractiveInited;
      },
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      },
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      mainScreen() {
        if (this.isInGroup) {
          return this.groupServer.state.groupInitData.main_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
        }
      },
      localSpeaker() {
        return (
          this.$domainStore.state.micServer.speakerList.find(
            item => item.accountId == this.joinInfo.third_party_user_id
          ) || {}
        );
      },
      remoteSpeakers() {
        return (
          this.$domainStore.state.micServer.speakerList.filter(
            item => item.accountId != this.joinInfo.third_party_user_id
          ) || []
        );
      },
      speakerList() {
        return this.$domainStore.state.micServer.speakerList;
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
         * 4. 没有互动实例的时候高度为0
         */
        if (!this.$domainStore.state.interactiveServer.isInstanceInit) {
          return true;
        }
        if (!this.remoteSpeakers.length) {
          if (this.localSpeaker.accountId && this.joinInfo.third_party_user_id != this.mainScreen) {
            return false;
          } else {
            return true;
          }
        } else if (this.remoteSpeakers.length == 1) {
          if (!this.localSpeaker.accountId) {
            return this.remoteSpeakers[0].accountId == this.mainScreen;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      // 互动无延迟 未上麦观众是否使用类似旁路布局
      isUseNoDelayLayout() {
        return !this.localSpeaker.accountId && this.mode == 3;
      }
    },
    watch: {
      isStreamListH0: {
        handler(newval) {
          this.interactiveServer.setStreamListHeightInWatch(newval ? 0 : 80);
        },
        immediate: true
      },
      'remoteSpeakers.length'(newval) {
        this.isShowControlArrow = newval * 142 > this.$refs.streamWrapper.clientWidth;
      }
    },
    beforeCreate() {
      this.groupServer = useGroupServer();
      this.interactiveServer = useInteractiveServer();
      this.roomBaseServer = useRoomBaseServer();
      this.micServer = useMicServer();
    },

    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;

      // 监听自动上麦的异常code
      useInteractiveServer().$on('SPEAKON_FAILED', e => {
        this.$message(e.msg);
      });
      // 订阅流播放失败
      this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', e => {
        let videos = document.querySelectorAll('video');
        videos.length > 0 &&
          videos.forEach(video => {
            video.pause();
          });
        this.interactiveServer.state.showPlayIcon = true;
      });

      // 主持人进入退出小组 消息监听
      this.groupServer.$on('GROUP_MANAGER_ENTER', msg => {
        if (msg.data.status == 'enter') {
          this.isHostInGroup = true;
        } else if (msg.data.status == 'quit') {
          this.isHostInGroup = false;
        }
      });
    },

    mounted() {},

    methods: {
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
      },
      /**
       * 监听无延迟未上麦时，观众采用类似旁路布局的容器高度变化
       */
      computeTop() {
        const MutationObserver =
          window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        const _this = this;
        const observer = new MutationObserver(function () {
          console.log(
            '监听到noDelayStreamContainer变动了',
            _this.$refs.noDelayStreamContainer.clientHeight
          );
        });
        observer.observe(this.$refs.noDelayStreamContainer, { childList: true, subtree: true });
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

    // 主持人在小组内占位图
    &__host-placeholder-in-group {
      display: flex;
      width: 100%;
      height: 100%;
      background: #2d2d2d;
      flex-direction: column;
      color: #999;
      justify-content: center;
      text-align: center;
      i {
        display: block;
        font-size: 40px;
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
    z-index: 10;
  }

  .vmp-stream-list-wrapper {
    &.no-delay-layout {
      width: calc(100% - 380px);
      position: absolute;
      top: 0;
      left: 0;
      bottom: 56px;

      &.vmp-dom__mini {
        right: 0;
        top: 0;
        width: 360px;
        z-index: 10;
        left: auto;
        height: 204px;
        .vmp-stream-list {
          height: 40px;
        }
        .vmp-stream-list__remote-container {
          width: 72px;
        }
        .vmp-stream-list__main-screen {
          width: 100%;
          height: 164px;
        }
      }
      .vmp-stream-list {
        position: absolute;
        left: 0;
        bottom: 0;
      }
      .vmp-stream-list__main-screen {
        bottom: 100%;
        left: 0;
        top: auto;
        position: absolute;
        width: 100%;
        height: 484px;
        @media screen and (max-width: 1366px) {
          height: 350px;
        }
      }
      .vmp-stream-list__stream-wrapper-scroll {
        justify-content: flex-start;
      }
    }
  }
</style>
