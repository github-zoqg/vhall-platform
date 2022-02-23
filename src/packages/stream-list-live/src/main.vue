<template>
  <div class="vmp-stream-list" :class="{ 'vmp-stream-list-h0': !remoteStreams.length }">
    <div
      class="vmp-stream-list__local-container"
      :class="[
        joinInfo.third_party_user_id == mainScreen ? 'vmp-stream-list__main-screen' : '',
        miniElement == 'stream-list' && joinInfo.third_party_user_id == mainScreen
          ? 'vmp-dom__mini'
          : 'vmp-dom__max'
      ]"
    >
      <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container>
    </div>
    <template v-if="remoteStreams.length">
      <div
        v-for="stream in remoteStreams"
        :key="stream.id"
        class="vmp-stream-list__remote-container"
        :class="[
          stream.accountId == mainScreen ? 'vmp-stream-list__main-screen' : '',
          miniElement == 'stream-list' && stream.accountId == mainScreen
            ? 'vmp-dom__mini'
            : 'vmp-dom__max'
        ]"
      >
        <vmp-stream-remote :stream="stream"></vmp-stream-remote>
      </div>
    </template>
  </div>
</template>

<script>
  import { useInteractiveServer } from 'middle-domain';
  export default {
    name: 'VmpStreamListLive',

    data() {
      return {
        childrenCom: [],
        maxElement: ''
      };
    },

    computed: {
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      mainScreen() {
        return this.$domainStore.state.roomBaseServer.interactToolStatus.main_screen;
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

    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
    },

    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      console.log(
        '-- this.childrenCom:',
        this.childrenCom,
        this.$domainStore.state.interactiveServer.remoteStreams
      );
      // this.getStreamList();
    },

    mounted() {
      console.log(this.joinInfo, '----stream-list----joinInfo');
    },

    methods: {
      getStreamList() {
        this.interactiveServer.getRoomStreams();
        console.log('------remoteStreams------', this.remoteStreams);
      }
      // exchange(compName) {
      //   window.$middleEventSdk?.event?.send({
      //     cuid: 'ps.surface',
      //     method: 'exchange',
      //     args: [compName, 2]
      //   });
      // }
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

    // 除了主屏流，还有其他上麦流存在的情况
    .vmp-stream-list__main-screen {
      position: absolute;

      // 主屏在大窗的样式
      &.vmp-dom__max {
        position: absolute;
        top: 80px;
        bottom: 0px;
        width: calc(100% - 370px);
        height: auto;
        min-height: auto;
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

    .vmp-stream-list__remote-container {
      width: 142px;
      height: 100%;
    }
  }
</style>
