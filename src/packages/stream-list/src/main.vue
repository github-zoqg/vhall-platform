<template>
  <div
    class="vmp-stream-list"
    id="vmp-stream-list"
    :class="{
      'vmp-stream-list-h0': isStreamListH0 && !isUseNoDelayLayout,
      'no-delay-layout': isUseNoDelayLayout,
      'vmp-dom__mini': isUseNoDelayLayout && miniElement == 'stream-list',
      'is-share-screen': isUseNoDelayLayout && isShareScreen
    }"
  >
    <!-- 左翻页 -->
    <span
      v-show="isShowControlArrow"
      class="vmp-stream-list__scroll-btn left-btn"
      @click="scrollStream('left')"
    >
      <i class="vh-iconfont vh-line-arrow-left" />
    </span>

    <!-- <template v-if="showScrollDom && (isShowInteract || mode == 6)"></template> -->
    <div v-drag ref="streamWrapper" class="vmp-stream-list__stream-wrapper">
      <div class="vmp-stream-list__stream-wrapper-scroll">
        <!-- 本地流容器 -->
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

        <template v-if="isShowRemoteList">
          <!-- 远端流列表 -->
          <div
            v-for="speaker in remoteSpeakers"
            :key="speaker.accountId"
            class="vmp-stream-list__remote-container"
            :class="{
              'vmp-stream-list__main-screen': speaker.accountId == mainScreen,
              'vmp-dom__max': miniElement != 'stream-list' && speaker.accountId == mainScreen,
              'vmp-dom__mini': miniElement == 'stream-list' && speaker.accountId == mainScreen,
              embed: isEmbed
            }"
          >
            <div class="vmp-stream-list__remote-container-h">
              <vmp-stream-remote :stream="streamInfo(speaker)"></vmp-stream-remote>
            </div>
          </div>
        </template>

        <!-- 主持人进入小组后占位图 -->
        <div
          v-if="showGroupMask"
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

    <!-- 右翻页 -->
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
  import {
    useInteractiveServer,
    useRoomBaseServer,
    useMicServer,
    useGroupServer,
    useDocServer
  } from 'middle-domain';
  import { streamInfo } from '@/packages/app-shared/utils/stream-utils';

  export default {
    name: 'VmpStreamList',

    data() {
      return {
        childrenCom: [],
        isShowInteract: true, // 是否展示互动区
        isShowControlArrow: false, // 是否展示左右按钮
        streamInfo
      };
    },

    computed: {
      isEmbed() {
        return (
          this.$domainStore.state.roomBaseServer.embedObj.embed &&
          !this.$domainStore.state.roomBaseServer.embedObj.embedVideo
        );
      },
      // 主持人是否在小组内
      isHostInGroup() {
        return !!this.$domainStore.state.roomBaseServer.interactToolStatus.is_host_in_group;
      },
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
      // 是否开启了桌面共享
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
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
         *    高度不为 0,但是为无延迟旁路布局，返回true,否则返回 false
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
          if (this.isUseNoDelayLayout) {
            return true;
          } else {
            return false;
          }
        }
      },

      isNoDelay() {
        // 1：无延迟直播
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar;
      },
      // 互动无延迟 未上麦观众是否使用类似旁路布局
      isUseNoDelayLayout() {
        return (
          !this.localSpeaker.accountId &&
          this.mode == 3 &&
          this.isNoDelay == 1 &&
          this.remoteSpeakers.length > 1
        );
      },
      // 是否存在主屏画面 配合主持人进入小组内时，页面内是否存在主画面
      isShowMainScreen() {
        let _flag = false;
        _flag =
          this.remoteSpeakers.findIndex(ele => ele.accountId == this.mainScreen) > -1 ||
          this.joinInfo.third_party_user_id == this.mainScreen;
        return _flag;
      },
      // 小组协作中
      showGroupMask() {
        // 分组活动 + 自己不在小组 + 主持人不在小组 + 无主画面
        return !this.isInGroup && this.isHostInGroup && this.mode == 6 && !this.isShowMainScreen;
      },
      // 直播状态 1直播
      liveStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      },
      // 是否展示流列表
      isShowRemoteList() {
        return this.remoteSpeakers.length && this.liveStatus == 1;
      }
    },
    watch: {
      isStreamListH0: {
        handler(newval) {
          this.interactiveServer.setStreamListHeightInWatch(newval ? 0 : 80);
        },
        immediate: true
      },

      // 流列表宽度超过 streamWrapper 时显示 翻页按钮
      'remoteSpeakers.length': {
        handler() {
          this.handleControlArrowShow();
        },
        immediate: true
      },
      // 监听是否有桌面共享，更改页面布局
      isShareScreen: {
        handler(newval) {
          if (this.isUseNoDelayLayout) {
            // 互动无延迟模仿旁路布局
            if (newval) {
              // 开启共享
              if (useDocServer().state.switchStatus) {
                useRoomBaseServer().setChangeElement('doc');
                // 开启文档
              } else {
                useRoomBaseServer().setChangeElement('');
              }
            }
          } else {
            if (newval) {
              // useDocServer().resetLayoutByMiniElement();
              // 开启共享
              useRoomBaseServer().setChangeElement('stream-list');
            }
          }
        },
        immediate: true
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
      /**
       * useInteractiveServer().$on('SPEAKON_FAILED', e => {
        if (
          +e.code === 513025 ||
          +this.roomBaseServer.state?.watchInitData?.joinInfo?.role_name === 2
        ) {
          return;
        }
        e.msg && this.$message.warning(e.msg);
      });*/
      // 订阅流播放失败
      this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', () => {
        let videos = document.querySelectorAll('video');
        videos.length > 0 &&
          videos.forEach(video => {
            video.pause();
          });
        this.interactiveServer.state.showPlayIcon = true;
      });
    },

    mounted() {
      this.computTop();
    },

    methods: {
      /**
       * 左右翻页更改streamWrapper的scrollLeft值实现滚动
       */
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
       * 计算streamList变动
       */
      computTop() {
        const MutationObserver =
          window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        const _this = this;
        const observer = new MutationObserver(function () {
          console.log('监听到streamWrapper变动了', _this.$refs.streamWrapper.offsetWidth);

          _this.handleControlArrowShow();
        });
        observer.observe(this.$refs.streamWrapper, {
          childList: true,
          subtree: true,
          attributes: true
        });
      },
      /**
       * 计算是否显示箭头
       */
      handleControlArrowShow() {
        if (this.$refs.streamWrapper) {
          this.isShowControlArrow =
            this.remoteSpeakers.length * 142 > this.$refs.streamWrapper.clientWidth;
        }
      }
    },
    directives: {
      drag(el, bindings) {
        el.onmousedown = function (e) {
          // const boxdom = document.getElementById('vmp-stream-list');
          let startX = e.pageX;
          // var disx = e.pageX - el.offsetLeft;
          // const boxdomScrollLeft = boxdom.scrollLeft;
          el.onmousemove = function (e) {
            const l = e.pageX - startX;
            // boxdom.scrollLeft = boxdomScrollLeft - l * (boxdom.offsetWidth / el.offsetWidth);
            el.scrollLeft -= l;
          };
          el.onmouseup = function (e) {
            el.onmousemove = null;
          };
        };
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

    // 流列表高度为0
    &-h0 {
      height: 0 !important;
      .vmp-stream-list__main-screen {
        top: 0 !important;
      }
    }

    &__stream-wrapper {
      flex: 1;
      overflow: hidden;
      display: flex;
      display: inherit;
      cursor: pointer;

      user-select: none;
      &-scroll {
        display: flex;
        justify-content: center;
        min-width: 100%;
        flex: none;

        .vmp-stream-list__local-container {
          width: 142px;
        }

        .vmp-stream-list__remote-container {
          width: 142px;
          &-h {
            height: 100%;
          }
        }

        // 流列表高度不为0
        .vmp-stream-list__main-screen {
          position: absolute;
          top: 80px;
          width: calc(100% - 380px);
          .vmp-stream-list__remote-container-h {
            padding-top: 56.25%;
          }

          // 主屏在大窗的样式
          &.vmp-dom__max {
            position: absolute;
            left: 0;
            bottom: 56px;
            width: calc(100% - 380px);
            height: auto;
            min-height: auto;
            &.embed {
              width: calc(100% - 360px);
            }
          }

          // 主屏在小窗的样式
          &.vmp-dom__mini {
            right: 0;
            top: 0;
            width: 360px;
            z-index: 10;
            .vmp-stream-local__bottom-role {
              padding: 0 8px;
            }
            .vmp-stream-local__bottom-nickname {
              width: 80px;
            }
            .vmp-stream-local__bottom-mic {
              font-size: 14px;
            }
            .vmp-stream-local__bottom-signal {
              margin-left: 10px;
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

          .vmp-stream-local__bottom {
            &-role {
              padding: 0 6px;
            }
            &-nickname {
              width: 80px;
            }
          }
        }
      }
      &::-webkit-scrollbar {
        /*隐藏滚轮*/
        display: none;
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
      background: #000;
      flex-direction: column;
      color: #999;
      justify-content: center;
      text-align: center;
      i {
        display: block;
        font-size: 40px;
      }
      &.vmp-dom__mini {
        height: 204px;
      }
    }
  }

  // 无延迟互动仿旁路布局
  .vmp-stream-list {
    &.no-delay-layout {
      width: calc(100% - 380px);
      position: absolute;
      top: 0;
      left: 0;
      bottom: 56px;
      height: auto;

      &.is-share-screen {
        display: none;
      }
      .vmp-stream-list__main-screen {
        bottom: 80px;
        top: 0;
        position: absolute;
        width: 100% !important;
        height: auto !important;
      }

      .vmp-stream-list__stream-wrapper-scroll {
        justify-content: normal;
        flex-wrap: wrap;
        align-items: flex-end;
        align-content: flex-end;
        .vmp-stream-list__remote-container {
          height: 80px;
        }
      }
      // 小屏样式
      &.vmp-dom__mini {
        right: 0;
        top: 0;
        width: 360px;
        z-index: 10;
        left: auto;
        height: 204px;
        .vmp-stream-list__remote-container {
          width: 72px;
          height: 40px;

          &:not(.vmp-stream-list__main-screen) {
            .vmp-stream-local__bottom-nickname {
              width: 60px;
            }
          }
        }
        .vmp-stream-local__bottom-role {
          display: none;
        }
        .vmp-stream-list__main-screen {
          bottom: 40px;
        }
        .vmp-stream-local__bottom {
          padding: 0 10px;
          height: 28px;
          line-height: 28px;
        }
      }

      .vmp-stream-list__remote-container-h {
        padding-top: 0;
      }
    }
  }
</style>
