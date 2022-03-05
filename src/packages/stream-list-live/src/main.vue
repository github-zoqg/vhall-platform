<template>
  <div
    class="vmp-stream-list"
    ref="streamList"
    :class="{ 'vmp-stream-list-h0': isStreamListH0, shrink: isShrink }"
  >
    <div class="vmp-stream-list__stream-wrapper">
      <div
        class="vmp-stream-list__local-container"
        :class="{
          'height-lower': isMainScreenHeightLower && !isShrink,
          'vmp-stream-list__main-screen': joinInfo.third_party_user_id == mainScreen,
          'vmp-dom__mini':
            miniElement == 'stream-list' && joinInfo.third_party_user_id == mainScreen,
          'vmp-dom__max': miniElement != 'stream-list' && joinInfo.third_party_user_id == mainScreen
        }"
        v-show="localStream.streamId"
      >
        <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container>
      </div>
      <template v-if="remoteStreams.length">
        <div
          v-for="stream in remoteStreams"
          :key="stream.id"
          class="vmp-stream-list__remote-container"
          :class="{
            'vmp-stream-list__main-screen': stream.accountId == mainScreen,
            'vmp-dom__mini': miniElement == 'stream-list' && stream.accountId == mainScreen,
            'vmp-dom__max': miniElement != 'stream-list' && stream.accountId == mainScreen
          }"
        >
          <vmp-stream-remote :stream="stream"></vmp-stream-remote>
        </div>
      </template>
    </div>

    <div
      class="vmp-stream-list__folder"
      v-show="remoteStreams.length > 0 || (splited && speakerList.length > 0)"
      v-if="!isSplited"
    >
      <span
        class="vmp-stream-list__folder--up"
        :class="{
          disable:
            isShrink ||
            (!splited && remoteStreams.length <= remoteMaxLength) ||
            (splited && speakerList.length - 1 <= remoteMaxLength)
        }"
        @click="toggleShrink(true)"
      ></span>
      <span
        class="vmp-stream-list__folder--down"
        :class="{
          disable:
            !isShrink ||
            (!splited && remoteStreams.length <= remoteMaxLength) ||
            (splited && speakerList.length - 1 <= remoteMaxLength)
        }"
        @click="toggleShrink(false)"
      ></span>
    </div>

    <saas-alert
      :visible="PopAlertOffline.visible"
      :retry="'点击重试'"
      :isShowClose="false"
      @onClose="PopAlertOfflineClose"
      @onSubmit="PopAlertOfflineConfirm"
    >
      <div slot="content">
        <span>网络异常导致互动房间连接失败</span>
      </div>
    </saas-alert>
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useSplitScreenServer,
    useMicServer,
    useMsgServer
  } from 'middle-domain';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';

  export default {
    name: 'VmpStreamListLive',

    data() {
      return {
        childrenCom: [],
        maxElement: '',
        isSplited: false,
        splited: false,
        isShrink: false, // 是否收起
        isMainScreenHeightLower: false, // 流列表高度增加时，主画面大屏显示position height是否降低
        remoteMaxLength: 0, //一行最大数
        speakerList: [],
        PopAlertOffline: {
          visible: false
        }
      };
    },
    components: {
      SaasAlert
    },
    computed: {
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      mainScreen() {
        console.warn(this.$domainStore.state, 789);
        if (this.$domainStore.state.groupServer.groupInitData.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.main_screen;
        } else {
          return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
        }
      },
      remoteStreams() {
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
          if (
            this.$domainStore.state.interactiveServer.localStream.streamId &&
            this.joinInfo.third_party_user_id != this.mainScreen
          ) {
            return false;
          } else {
            return true;
          }
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
      localStream() {
        return this.$domainStore.state.interactiveServer.localStream;
      }
    },

    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.splitScreenServer = useSplitScreenServer();
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

      // 房间信令异常断开事件
      this.interactiveServer.$on('EVENT_ROOM_EXCDISCONNECTED', () => {
        this.PopAlertOffline.visible = true;
      });
      this.listenEvents();
      // this.getStreamList();
    },

    mounted() {
      console.log(this.joinInfo, '----stream-list----joinInfo');

      // 计算一行最多放几个
      this.remoteMaxLength = parseInt(this.$refs.streamList.offsetWidth / 142);

      // 监听流列表高度变化
      this.computTop();
    },

    methods: {
      listenEvents() {
        // 助理等角色监听
        if (this.joinInfo.role_name != 1) {
          // 订阅流播放失败    监听到播放失败, 然后展示按钮
          this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', e => {
            let videos = document.querySelectorAll('video');
            videos.length > 0 &&
              videos.forEach(video => {
                video.pause();
              });
            this.interactiveServer.state.showPlayIcon = true;
          });

          // live_over 结束直播
          this.interactiveServer.$on('live_over', () => {
            this.$message.warning(this.$t('player.player_1017'));
          });
          // 接收设为主讲人消息
          this.micServer.$on('vrtc_big_screen_set', msg => {
            const str =
              this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode == 6
                ? '主画面'
                : '主讲人';
            this.$message.success(`${msg.data.nick_name}设置成为${str}`);
          });

          // 嘉宾：
          if (this.joinInfo.role_name == 3) {
            this.$alert('您已进入直播房间，马上开始互动吧', '', {
              title: '提示',
              confirmButtonText: '立即开始',
              customClass: 'zdy-message-box',
              cancelButtonClass: 'zdy-confirm-cancel',
              callback: () => {
                const list = document.getElementsByTagName('video');
                for (const item of list) {
                  item.play();
                }
              }
            });
          }
        }
        // 接收设为主讲人消息
        this.micServer.$on('vrtc_big_screen_set', msg => {
          if (this.joinInfo.role_name == 1) {
            const streams = this.interactiveServer.getRoomStreams();
            const mainScreenStream = streams.find(
              stream => stream.accountId == msg.data.room_join_id
            );
            if (mainScreenStream) {
              this.interactiveServer.setBroadCastScreen(mainScreenStream.streamId);
            }
          }
        });
      },
      getStreamList() {
        this.interactiveServer.getRoomStreams();
        console.log('------remoteStreams------', this.remoteStreams);
      },
      toggleShrink(flag) {
        this.isShrink = flag;
      },
      /**
       * 计算
       */
      computTop() {
        const MutationObserver =
          window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        const _this = this;
        const observer = new MutationObserver(function () {
          console.log('监听到streamList变动了', _this.$refs.streamList.offsetHeight);

          _this.isMainScreenHeightLower = _this.$refs.streamList.offsetHeight === 160;
        });
        observer.observe(this.$refs.streamList, { childList: true, subtree: true });
      },
      // 开启 / 关闭分屏
      toggleSplitScreen(command) {
        if (command === 'open') {
          this.splitScreenServer.startSplit();
        }
      },
      PopAlertOfflineClose() {
        this.PopAlertOffline.visible = false;
      },
      PopAlertOfflineConfirm() {
        window.location.reload();
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-list {
    width: 100%;
    background-color: #242424;
    display: flex;
    justify-content: center;

    &__stream-wrapper {
      flex: 1;
      justify-content: center;
      display: flex;
      overflow-y: hidden;
      flex-wrap: wrap;
    }
    // 除了主屏流，还有其他上麦流存在的情况
    .vmp-stream-list__main-screen {
      position: absolute;

      // 主屏在大窗的样式
      &.vmp-dom__max {
        width: auto;
        position: absolute;
        top: 80px;
        bottom: 0px;
        height: auto;
        min-height: auto;
        left: 60px;
        right: 310px;
        width: auto;
        &.height-lower {
          top: 160px;
        }
        // 本地流大窗样式
        .vmp-stream-local {
          .vmp-stream-local__shadow-box {
            display: flex;
            height: 41px;
            bottom: 10px;
            flex-direction: row;
            top: auto;
            background: rgba(0, 0, 0, 0);
            .vmp-stream-local__shadow-icon {
              background: none;
              &:hover {
                background-color: #fc5659;
              }
            }
          }
          .vmp-stream-local__bootom {
            bottom: 17px;
          }
        }
        // 远端流大窗样式
      }
      // 主屏在小窗的样式
      &.vmp-dom__mini {
        right: 0;
        left: auto;
        top: 0;
        width: 309px;
        height: 240px;
        z-index: 1;
      }
    }

    // 没有远端流的时候高度为0
    &-h0 {
      height: 0;
      .vmp-stream-list__main-screen {
        &.vmp-dom__max {
          top: 0;
        }
      }
    }

    // 收起流列表
    &.shrink {
      height: 80px;
    }

    .vmp-stream-list__remote-container,
    .vmp-stream-list__local-container {
      width: 142px;
      height: 80px;
    }

    &__folder {
      flex: none;
      width: 25px;
      height: auto;
      display: flex;
      background: #242424;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      position: relative;

      span {
        width: 18px;
        height: 18px;
        text-align: center;
        line-height: 18px;
        color: #d9d9d9;
        font-size: 12px;
        border-radius: 50%;
        position: absolute;
      }
      &--up {
        top: 10px;
        background: url('./img/uparr.png');
        background-size: 100%;
        cursor: pointer;
        &.disable {
          cursor: auto;
          // pointer-events: none;
          background-image: url('./img/downarr.png');
          transform: rotateZ(180deg);
        }
      }
      &--down {
        top: 50px;
        background: url('./img/uparr.png');
        background-size: 100%;
        transform: rotateZ(180deg);

        cursor: pointer;
        &.disable {
          transform: rotateZ(0deg);
          // pointer-events: none;
          cursor: auto;
          background-image: url('./img/downarr.png');
        }
      }
    }
  }
</style>
