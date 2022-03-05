<template>
  <div class="vmp-wap-stream-wrap" ref="vmp-wap-stream-wrap" @click.stop="videoShowIcon">
    <div
      class="vmp-stream-list"
      :class="{
        'vmp-stream-list-h0': isStreamListH0,
        'vmp-stream-list-h-all': isStreamListHAll,
        'vmp-stream-list-no-speack': !micServer.state.isSpeakOn
      }"
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
      <!-- 左右滑动Mask 待做 -->
    </div>
    <div class="vmp-wap-stream-wrap-mask">
      <!-- 热度 -->
      <div
        class="vmp-wap-stream-wrap-mask-heat"
        :class="[iconShow ? 'opcity-true' : 'opcity-flase']"
      >
        <p>
          <i class="vh-saas-iconfont vh-saas-line-heat"></i>
          热度 &nbsp;{{ hotNum | formatHotNum }}
        </p>
      </div>
      <!-- 播放 -->
      <div class="vmp-wap-stream-wrap-mask-pause" v-show="showPlayIcon">
        <p @click.stop="replayPlay">
          <i class="vh-iconfont vh-line-video-play"></i>
        </p>
      </div>
      <!-- 进入全屏 -->
      <div
        class="vmp-wap-stream-wrap-mask-screen"
        :class="[iconShow ? 'opcity-true' : 'opcity-flase']"
        @click.stop="setFullScreen"
      >
        <i class="vh-iconfont vh-a-line-fullscreen"></i>
      </div>
      <div class="vmp-wap-stream-wrap-mask-background" v-show="defaultBg">
        <img src="./../img/load.gif" />
      </div>
    </div>
    <!-- 小组协作中 -->
    <div class="vmp-wap-stream-wrap-group" v-show="showGroupMask">
      <i class="vh-saas-iconfont vh-saas-line-heat"></i>
      小组协作中
    </div>
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useMicServer,
    useMsgServer,
    useRoomBaseServer,
    useMediaCheckServer,
    useGroupServer
  } from 'middle-domain';
  import { debounce } from 'lodash';
  import BScroll from '@better-scroll/core';
  import { Toast, Dialog } from 'vant';

  export default {
    name: 'VmpWapStreamList',

    data() {
      return {
        childrenCom: [],
        miniElement: 'mainScreen',
        maxElement: '',
        playAbort: [], // 自动播放禁止的stream列表
        showPlayIcon: false, // 是否展示播放按钮
        scroll: null, // BScroll 插件
        mainScreenDom: null, // 主屏Dom
        iconShow: false, // 5 秒的展示
        is_host_in_group: this.roomBaseServer.state.interactToolStatus?.is_host_in_group // 主持人是否在小组中
      };
    },
    filters: {
      formatHotNum(value) {
        value = parseInt(value);
        let unit = '';
        const k = 99999;
        const sizes = ['', '万', '亿', '万亿'];
        let i;
        if (value > k) {
          i = Math.floor(Math.log(value) / Math.log(k));
          value = (value / Math.pow(k / 10, i)).toFixed(1);
          unit = sizes[i];
        }
        return value + unit;
      }
    },
    computed: {
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
      remoteStreams() {
        console.log(
          '----远端流列表更新----',
          this.$domainStore.state.interactiveServer.remoteStreams,
          this.micServer.state.isSpeakOn
        );
        if (this.micServer.state.isSpeakOn) {
          // 远端流个数改变且 在推流 才进行初始化BScroll
          this.createBScroll();
        }
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
          this.remoteStreams[0].accountId == this.mainScreen &&
          !this.$domainStore.state.interactiveServer.localStream.streamId
        );
      },
      // 小组协作中
      showGroupMask() {
        // 分组活动 + 自己不在小组 + 主持人不在小组
        let _flag =
          !this.$domainStore.state.groupServer.groupInitData.isInGroup &&
          this.is_host_in_group &&
          this.roomBaseServer.state.watchInitData.webinar.mode == 6;
        return _flag;
      },
      hotNum() {
        return (
          Number(this.$domainStore.state.virtualAudienceServer.uvHot) +
          Number(this.$domainStore.state.virtualAudienceServer.virtualHot) +
          1
        );
      },
      // 开始推流到成功期间展示默认图
      defaultBg() {
        return this.interactiveServer.state.defaultStreamBg;
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      useMediaCheckServer().checkSystemRequirements();
      this.roomBaseServer = useRoomBaseServer();
      this.micServer = useMicServer();
      this.msgServer = useMsgServer();
      this.groupServer = useGroupServer();
    },

    async created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      this.addSDKEvents();

      if (useMediaCheckServer().state.isBrowserNotSupport) {
        return Toast(`浏览器不支持互动`);
      }
      this.replayPlay = debounce(this.replayPlay, 500);
    },

    mounted() {
      // 在麦上 才存在滑动情况
      if (this.micServer.state.isSpeakOn) {
        this.createBScroll();
        if (window.orientation == 90 || window.orientation == -90) {
          this.setFullScreen();
        }
      }
      this.fiveDown();
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
        this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', e => {
          this.playAbort.push(e.data);
          this.showPlayIcon = true;
        });

        // 接收设为主讲人消息
        this.micServer.$on('vrtc_big_screen_set', msg => {
          const str =
            this.roomBaseServer.state.watchInitData.webinar.mode == 6 ? '主画面' : '主讲人';
          Toast(`${msg.data.nick_name}设置成为${str}`);
          this.$nextTick(() => {
            this.mainScreenDom = document.querySelector('.vmp-stream-list__main-screen');
            if (this.mainScreenDom && this.micServer.state.isSpeakOn) {
              this.mainScreenDom.style.left = `${1.02667}rem`;
            }
          });
        });

        // 房间信令异常断开事件
        this.interactiveServer.$on('EVENT_ROOM_EXCDISCONNECTED', () => {
          Dialog.alert({
            message: '网络异常导致互动房间连接失败'
          }).then(() => {
            window.location.reload();
          });
        });

        // 主持人进入退出小组 消息监听
        this.groupServer.$on('dispatch_group_enter', msg => {
          if (msg.data.status == 'enter') {
            this.is_host_in_group = true;
          } else if (msg.data.status == 'quit') {
            this.is_host_in_group = false;
          }
        });

        // 开启分组讨论
        this.groupServer.$on('GROUP_SWITCH_START', () => {
          if (this.groupServer.state.groupInitData.isInGroup) {
            this.gobackHome(1, this.groupServer.state.groupInitData.name);
          }
        });

        // 结束分组讨论
        this.groupServer.$on('GROUP_SWITCH_END', () => {
          this.gobackHome(3, this.groupServer.state.groupInitData.name);
        });

        // 小组解散
        this.groupServer.$on('GROUP_DISBAND', () => {
          this.gobackHome(4);
        });

        // 本人被踢出来
        this.groupServer.$on('ROOM_GROUP_KICKOUT', () => {
          this.gobackHome(5, this.groupServer.state.groupInitData.name);
        });

        // 组长变更
        this.groupServer.$on('GROUP_LEADER_CHANGE', () => {
          if (this.$domainStore.state.groupServer.groupInitData.isInGroup) {
            if (this.groupServer.state.groupInitData.join_role == 20) {
              this.gobackHome(6);
            } else {
              this.gobackHome(7);
            }
          }
        });

        // 与王佳佳沟通 => wap横屏时，直接进行全屏主屏流
        window.addEventListener('orientationchange', () => {
          if (screen.orientation.angle == 90 || screen.orientation.angle == 270) {
            this.setFullScreen();
          }
        });
      },
      // 返回主房间提示
      gobackHome(index, name) {
        let title = '';
        switch (index) {
          case 1:
            title = '主持人开启了分组讨论，您将进入' + name + '组参与讨论';
            break;
          case 2:
            title = '主持人已将您分配至' + name + '组';
            break;
          case 3:
            title = this.$t('chat.chat_1073');
            break;
          case 4:
            title = this.$t('chat.chat_1074');
            break;
          case 5:
            title = this.$t('chat.chat_1007');
            break;
          case 6:
            title = '您被提升为组长!';
            break;
          case 7:
            title = '组长身份已变更';
            break;
        }
        Toast(title);
      },

      // 创建betterScroll
      createBScroll() {
        this.$nextTick(() => {
          if (this.scroll) {
            this.scroll.refresh();
            // this.scroll.destroy();
          } else {
            this.scroll = new BScroll(this.$refs['vmp-wap-stream-wrap'], {
              scrollX: true,
              click: true,
              probeType: 3 // listening scroll event
            });
          }

          this.mainScreenDom = document.querySelector('.vmp-stream-list__main-screen');
          if (this.mainScreenDom) {
            this.mainScreenDom.style.left = `${1.02667}rem`;
          }
          this.scroll.on('scroll', ({ x }) => {
            if (this.mainScreenDom) {
              this.mainScreenDom.style.left = `${30 + -x}px`;
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
        this.playAbort = [];
      },

      // 全屏
      setFullScreen() {
        /*
         * 布局原因：wap进入全屏仅全屏主屏流
         *    进入全屏在list内，退出全屏在remote/local内进行退出
         */
        let allStream = this.interactiveServer.getRoomStreams();
        let mainScreenStream = allStream.find(stream => stream.accountId == this.mainScreen);
        if (mainScreenStream) {
          if (mainScreenStream.streamSource == 'remote') {
            this.interactiveServer.setStreamFullscreen({
              streamId: mainScreenStream.streamId,
              vNode: `vmp-stream-remote__${mainScreenStream.streamId}`
            });
          } else {
            this.interactiveServer.setStreamFullscreen({
              streamId: mainScreenStream.streamId,
              vNode: `vmp-stream-local__${mainScreenStream.streamId}`
            });
          }
          if (!navigator.userAgent.match(/Version\/([\d.]+).*Safari/)) {
            this.interactiveServer.state.fullScreenType = true;
          }
        }
      },

      exchange(compName) {
        window.$middleEventSdk?.event?.send({
          cuid: 'ps.surface',
          method: 'exchange',
          args: [compName, 2]
        });
      },

      videoShowIcon() {
        this.iconShow = true;
        this.fiveDown();
      },
      // 5秒后消失
      fiveDown() {
        clearTimeout(this.setIconTime);
        this.setIconTime = setTimeout(() => {
          this.iconShow = false;
        }, 5000);
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-stream-wrap {
    white-space: nowrap;
    height: 422px;
    width: 100%;
    position: relative;
    background: #000;
    &-group {
      position: absolute;
      top: 100px;
      display: flex;
      width: 100%;
      height: 50%;
      flex-direction: column;
      justify-content: center;
      color: #999;
      text-align: center;
      font-size: 28px;
      z-index: 1;
      i {
        display: block;
        font-size: 70px;
        margin-bottom: 14px;
      }
    }
    &-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-start;
      &-heat {
        top: 24px;
        left: 24px;
        padding: 0 24px;
        color: #fff;
        position: absolute;
        font-size: 28px;
        z-index: 5;
        p {
          border-radius: 44px;
          height: 48px;
          line-height: 48px;
          padding: 0 16px;
          text-align: center;
          background: rgba(0, 0, 0, 0.5);
          i {
            vertical-align: bottom;
            font-size: 28px;
          }
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
      &-screen {
        width: 64px;
        height: 64px;
        line-height: 64px;
        z-index: 4;
        background: rgba(0, 0, 0, 0.4);
        position: absolute;
        left: 50%;
        top: 50%;
        text-align: center;
        transform: translate(-32px, -32px);
        border-radius: 50%;
      }
      &-background {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
        background: #000;
        img {
          width: 88px;
          height: 88px;
        }
      }
      .opcity-flase {
        display: none;
        transition: all 1s;
        -webkit-transition: all 1s;
      }
      .opcity-true {
        opacity: 1;
        transition: all 1s;
        z-index: 6;
        -webkit-transition: all 1s;
        i {
          color: #fff;
        }
      }
    }
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

    // 流列表高度不为0
    .vmp-stream-list__main-screen {
      position: absolute;
      top: 83px;
      width: 597px;
      height: 337px;
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

    // 未上麦样式进行覆盖
    &-no-speack {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      align-content: flex-end;
      height: 422px;
      .vmp-stream-list__remote-container {
        // align-items: center;
        width: 150px;
        height: 85px;
      }
      .vmp-stream-list__local-container {
        width: 150px;
        height: 85px;
      }
      .vmp-stream-list__main-screen {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: calc(100% - 85px);
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
