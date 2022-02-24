<template>
  <div class="vmp-wap-stream-wrap" ref="vmp-wap-stream-wrap">
    <div
      ref="vmp-wap-stream-list"
      class="vmp-stream-list"
      :class="{ 'vmp-stream-list-h0': isStreamListH0, 'vmp-stream-list-h-all': isStreamListHAll }"
    >
      <div
        class="vmp-stream-list__local-container"
        :class="{
          'vmp-stream-list__main-screen': joinInfo.third_party_user_id == mainScreen
        }"
        v-show="micServer.state.isSpeakOn"
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
            'vmp-stream-list__main-screen': stream.accountId == mainScreen
          }"
        >
          <div class="vmp-stream-list__remote-container-h">
            <vmp-wap-stream-remote :stream="stream"></vmp-wap-stream-remote>
          </div>
        </div>
      </template>
      <!-- 播放 按钮 showPlayIcon-->
      <div class="vmp-stream-list-pause" v-show="false">
        <p @click="replayPlay">
          <i class="vh-iconfont vh-line-video-play"></i>
        </p>
      </div>

      <!-- 左右滑动Mask 待做 -->

      <!-- 默认进入触发权限弹窗 待做 -->
    </div>
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useMicServer,
    useMsgServer,
    roomBaseServer,
    useMediaCheckServer
  } from 'middle-domain';
  import { debounce } from 'lodash';
  import BScroll from '@better-scroll/core';
  export default {
    name: 'VmpWapStreamList',

    data() {
      return {
        childrenCom: [],
        miniElement: 'mainScreen',
        maxElement: '',
        playAbort: [], // 自动播放禁止的stream列表
        showPlayIcon: false, // 是否展示播放按钮
        scroll: null,
        mainScreenDom: null
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
      useMediaCheckServer().checkSystemRequirements();
      this.micServer = useMicServer();
      this.msgServer = useMsgServer();
    },

    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      console.log(
        '-- this.childrenCom:',
        this.childrenCom,
        this.$domainStore.state.interactiveServer.remoteStreams
      );
      this.addSDKEvents();
      if (!useMediaCheckServer().state.isBrowserNotSupport) {
        this.$message.error('浏览器不支持互动');
      }
      if (
        [3, 6].includes(roomBaseServer.state.watchInitData.webinar.mode) &&
        roomBaseServer.state.watchInitData.webinar.type == 1
      ) {
        // TODO: 弹出确认框 触发用户操作
      }
      this.replayPlay = debounce(this.replayPlay, 500);
    },

    mounted() {
      this.createBScroll();
    },
    beforeDestroy() {
      if (this.scroll) {
        this.scroll.destroy();
      }
    },

    methods: {
      // 事件监听
      addSDKEvents() {
        // 监听到自动播放
        this.interactiveServer.$on(VhallRTC.EVENT_STREAM_PLAYABORT, e => {
          this.playAbort.push(e.data);
          this.showPlayIcon = true;
        });

        // 接收设为主讲人消息
        this.micServer.$on('vrtc_big_screen_set', msg => {
          const str = roomBaseServer.state.watchInitData.webinar.mode == 6 ? '主画面' : '主讲人';
          this.$message.error(`${msg.nick_name}设置成为${str}`);
        });
      },

      // 创建betterScroll
      createBScroll() {
        this.$nextTick(() => {
          if (this.scroll) {
            this.scroll.destroy();
          }
          this.scroll = new BScroll(this.$refs['vmp-wap-stream-wrap'], {
            scrollX: true,
            probeType: 3 // listening scroll event
          });
          this.scroll.on('scroll', ({ x }) => {
            if (this.mainScreenDom) {
              this.mainScreenDom.style.left = `${30 + -x}px`;
            } else {
              this.mainScreenDom = document.querySelector('.vmp-stream-list__main-screen');
            }
          });
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
  .vmp-wap-stream-wrap {
    white-space: nowrap;
    height: 422px;
    width: 100%;
  }
  .vmp-stream-list {
    height: 83px;
    display: inline-block;
    .vmp-stream-list__local-container {
      width: 148px;
      height: 100%;
      display: inline-block;
    }
    .vmp-stream-list__remote-container {
      width: 148px;
      height: 100%;
      display: inline-block;
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
      left: 76px;
      display: inline-block;
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
