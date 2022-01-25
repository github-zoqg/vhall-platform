<template>
  <div class="vmp-stream-list" :class="{ 'vmp-stream-list-h0': isStreamListH0 }">
    <div
      class="vmp-stream-list__local-container"
      :class="{
        'vmp-stream-list__main-screen': joinInfo.third_party_user_id == mainScreen,
        'vmp-dom__max': maxElement == 'mainScreen' && joinInfo.third_party_user_id == mainScreen,
        'vmp-dom__mini': miniElement == 'mainScreen' && joinInfo.third_party_user_id == mainScreen
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
          'vmp-dom__max': maxElement == 'mainScreen' && stream.accountId == mainScreen,
          'vmp-dom__mini': miniElement == 'mainScreen' && stream.accountId == mainScreen
        }"
      >
        <div class="vmp-stream-list__remote-container-h">
          <vmp-stream-remote :stream="stream"></vmp-stream-remote>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import { useInteractiveServer } from 'middle-domain';
  export default {
    name: 'VmpStreamList',

    data() {
      return {
        childrenCom: [],
        miniElement: 'mainScreen',
        maxElement: ''
      };
    },

    computed: {
      mainScreen() {
        return this.$domainStore.state.interactiveServer.mainScreen;
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
      this.getStreamList();
    },

    mounted() {},

    methods: {
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
    height: 80px;
    width: 100%;
    background-color: #242424;
    display: flex;
    justify-content: center;
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

    // 流列表高度为0
    &-h0 {
      height: 0;
      .vmp-stream-list__main-screen {
        top: 0;
      }
    }

    // 主屏在小窗的样式
    .vmp-dom__mini {
      right: 0;
      top: 0;
      width: 360px;
      z-index: 1;
    }
  }
</style>
