<template>
  <div
    class="vmp-stream-list"
    ref="streamList"
    :class="{
      'vmp-stream-list-h0': isStreamListH0,
      shrink: isShrink,
      'vmp-stream-list-height': !isStreamListH0
    }"
  >
    <div class="vmp-stream-list__stream-wrapper">
      <!-- 本地流容器 -->
      <div
        class="vmp-stream-list__local-container"
        :class="{
          'height-lower': isMainScreenHeightLower && !isShrink,
          'vmp-stream-list__main-screen':
            joinInfo.third_party_user_id == mainScreen || (initLocalSpeaker && liveStatus != 1),
          'vmp-dom__mini':
            (['stream-list', 'insert-video', 'rebroadcast-stream'].includes(miniElement) &&
              joinInfo.third_party_user_id == mainScreen) ||
            (initLocalSpeaker && liveStatus != 1),
          'vmp-dom__max':
            !['stream-list', 'insert-video', 'rebroadcast-stream'].includes(miniElement) &&
            joinInfo.third_party_user_id == mainScreen
        }"
        v-show="
          localSpeaker.accountId ||
          (!isThirdStream && joinInfo.role_name == 1) ||
          (isStreamYun && joinInfo.role_name == 1) ||
          isRecord ||
          (initLocalSpeaker && liveStatus != 1)
        "
      >
        <!-- 云导播活动 -->
        <vmp-air-container
          :oneself="true"
          v-if="isStreamYun && joinInfo.role_name == 1"
          :cuid="childrenCom[1]"
        ></vmp-air-container>
        <!-- 非云导播活动 -->
        <vmp-air-container
          :oneself="true"
          :cuid="childrenCom[0]"
          v-if="!isStreamYun"
        ></vmp-air-container>
      </div>

      <!-- 远端流列表 -->
      <template v-if="remoteSpeakers.length">
        <div
          v-for="speaker in remoteSpeakers"
          :key="speaker.accountId"
          class="vmp-stream-list__remote-container"
          :class="{
            'vmp-stream-list__main-screen': speaker.accountId == mainScreen,
            'vmp-dom__mini':
              ['stream-list', 'insert-video'].includes(miniElement) &&
              speaker.accountId == mainScreen,
            'vmp-dom__max':
              !['stream-list', 'insert-video'].includes(miniElement) &&
              speaker.accountId == mainScreen
          }"
        >
          <!-- 云导播活动 -->
          <vmp-air-container
            :oneself="true"
            :cuid="childrenCom[1]"
            v-if="isStreamYun && joinInfo.role_name == 3"
          ></vmp-air-container>
          <!-- 非云导播活动 -->
          <vmp-stream-remote
            :cuid="childrenCom[2]"
            :stream="streamInfo(speaker)"
            v-if="!isStreamYun"
          ></vmp-stream-remote>
        </div>
      </template>

      <!-- 主持人进入小组后助理占位图 -->
      <div
        v-if="showGroupMask"
        class="vmp-stream-list__host-placeholder-in-group vmp-stream-list__main-screen"
        :class="{
          'vmp-dom__mini': ['stream-list', 'insert-video'].includes(miniElement),
          'vmp-dom__max': !['stream-list', 'insert-video'].includes(miniElement)
        }"
      >
        <i class="vh-saas-iconfont vh-saas-a-line-Requestassistance"></i>
        小组协作中
      </div>
    </div>

    <!-- 滚动操作 -->
    <div class="vmp-stream-list__folder" v-show="remoteSpeakers.length > 0 && !isStreamListH0">
      <span
        class="vmp-stream-list__folder--up"
        :class="{
          disable: isShrink || remoteSpeakers.length <= remoteMaxLength
        }"
        @click="toggleShrink(true)"
      ></span>
      <span
        class="vmp-stream-list__folder--down"
        :class="{
          disable: !isShrink || remoteSpeakers.length <= remoteMaxLength
        }"
        @click="toggleShrink(false)"
      ></span>
    </div>
  </div>
</template>

<script>
  import {
    useInteractiveServer,
    useSplitScreenServer,
    useMicServer,
    useMsgServer,
    useGroupServer
  } from 'middle-domain';
  import { streamInfo } from '@/app-shared/utils/stream-utils';

  export default {
    name: 'VmpStreamListLive',

    data() {
      return {
        childrenCom: [],
        isShrink: false, // 是否收起
        isMainScreenHeightLower: false, // 流列表高度增加时，主画面大屏显示position height是否降低
        remoteMaxLength: 0, //一行最大数

        streamInfo
      };
    },
    computed: {
      // 是否是录制
      isRecord() {
        return this.$domainStore.state.roomBaseServer.clientType == 'record';
      },
      // 直播状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      liveStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      },
      // 3互动 //6分组
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      mainScreen() {
        if (this.$domainStore.state.groupServer.groupInitData.isInGroup) {
          return this.$domainStore.state.groupServer.groupInitData.main_screen;
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
         * 4. 没有互动实例并且分屏没有打开的时候高度为0，如果分屏打开根绝上麦列表的长度判断
         */
        if (
          !this.$domainStore.state.interactiveServer.isInstanceInit &&
          !this.$domainStore.state.splitScreenServer.isOpenSplitScreen
        ) {
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
      localStream() {
        return this.$domainStore.state.interactiveServer.localStream;
      },
      // 是否存在主屏画面 配合主持人进入小组内时，页面内是否存在主画面
      isShowMainScreen() {
        let _flag = false;
        _flag =
          this.remoteSpeakers.findIndex(ele => ele.accountId == this.mainScreen) > -1 ||
          this.joinInfo.third_party_user_id == this.mainScreen;
        return _flag;
      },
      showGroupMask() {
        // 主持人是否在组内 + 直播中 + 分组 + 助理 + 自身不在小组中 + 无主画面
        return (
          this.$domainStore.state.roomBaseServer.interactToolStatus?.is_host_in_group == 1 &&
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1 &&
          this.mode == 6 &&
          this.joinInfo.role_name == 3 &&
          !this.isInGroup &&
          !this.isShowMainScreen
        );
      },
      isStreamYun() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.is_director == 1 &&
          this.$domainStore.state.roomBaseServer.watchInitData.permissionKey['webinar.director'] ==
            1
        );
      },
      // 是否开启第三方推流
      isThirdStream() {
        return this.$domainStore.state.roomBaseServer.isThirdStream;
      },
      initLocalSpeaker() {
        return this.$domainStore.state.interactiveServer.localSpeaker;
      }
    },

    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.splitScreenServer = useSplitScreenServer();
      this.micServer = useMicServer();
      this.msgServer = useMsgServer();
      this.groupServer = useGroupServer();
    },

    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;

      this.listenEvents();
    },

    mounted() {
      console.log(this.localSpeaker, 'localSpeaker');
      // 计算一行最多放几个
      this.remoteMaxLength = parseInt(this.$refs.streamList.offsetWidth / 142);

      // 监听流列表高度变化
      this.computTop();
    },

    methods: {
      listenEvents() {
        // 订阅流播放失败    监听到播放失败, 然后展示按钮
        this.interactiveServer.$on('EVENT_STREAM_PLAYABORT', () => {
          this.playboartCount ? ++this.playboartCount : (this.playboartCount = 1);
          if (this.playboartCount > 1) {
            return;
          }
          this.$alert('您已进入直播房间，马上开始互动吧', '', {
            title: '提示',
            confirmButtonText: '立即开始',
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel',
            callback: () => {
              this.interactiveServer.playAbortStreams();
            }
          });
        });

        // 助理等角色监听
        if (this.joinInfo.role_name != 1) {
          // live_over 结束直播
          this.interactiveServer.$on('live_over', () => {
            this.$message.warning(this.$t('player.player_1017'));
          });

          // 接收设为主画面消息
          this.micServer.$on('vrtc_big_screen_set', msg => {
            this.$message.success(
              this.$t('interact.interact_1012', { n: msg.data.nick_name, m: '主画面' })
            );
          });

          // 接收设为主讲人消息
          this.micServer.$on('vrtc_speaker_switch', msg => {
            const m =
              this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode == 6
                ? '主画面'
                : this.$t('interact.interact_1034');
            this.$message.success(
              this.$t('interact.interact_1012', {
                n: msg.data.nick_name,
                m: m
              })
            );
          });
        }
        // 接收设为主讲人消息
        // 云导播不提示 is_director==1
        this.micServer.$on('vrtc_big_screen_set', msg => {
          if (
            this.joinInfo.role_name == 1 &&
            !(
              this.$domainStore.state.roomBaseServer.watchInitData.webinar.is_director == 1 &&
              this.$domainStore.state.roomBaseServer.watchInitData.permissionKey[
                'webinar.director'
              ] == 1
            )
          ) {
            const mainScreenSpeaker = this.speakerList.find(
              speaker => speaker.accountId == msg.data.room_join_id
            );
            // 非合并模式 或 合并模式下开启文档融屏，不设置旁路主画面
            const docCloudStatus =
              this.$domainStore.state.roomBaseServer.interactToolStatus.speakerAndShowLayout;
            if (
              mainScreenSpeaker.streamId &&
              (docCloudStatus != 1 ||
                (docCloudStatus == 1 && !this.$domainStore.state.docServer.switchStatus))
            ) {
              this.interactiveServer.setBroadCastScreen(mainScreenSpeaker.streamId);
            }
          }
        });
      },

      toggleShrink(flag) {
        if (this.remoteSpeakers.length <= this.remoteMaxLength) {
          return;
        }
        this.isShrink = flag;
      },
      /**
       * 计算streamList变动
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
            bottom: 0px;
            flex-direction: row;
            top: auto;
            background: rgba(0, 0, 0, 0);
            .vmp-stream-local__shadow-icon {
              background: none;
              &:hover {
                background-color: #fb3a32;
              }
            }
          }
          // .vmp-stream-local__bottom {
          //   bottom: 18px;
          // }
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
        .vmp-stream-local__bottom {
          padding: 0 10px;
          height: 28px;
          line-height: 28px;
        }
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

    .vmp-stream-list__remote-container {
      width: 142px;
      height: 80px;
    }

    .vmp-stream-list__local-container {
      width: 142px;
      height: 80px;
    }

    // 展开收起按钮
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

  // 有远端流的时候高度
  .vmp-stream-list-height {
    min-height: 80px !important;
  }
</style>
