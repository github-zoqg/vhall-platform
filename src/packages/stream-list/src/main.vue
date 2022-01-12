<template>
  <div class="vmp-stream-list" :class="{ 'vmp-stream-list-h0': !streamList.length }">
    <div
      class="vmp-stream-list__local-container"
      :class="{ 'vmp-stream-list__main-screen': accountId !== mainScreen }"
    >
      <div class="vmp-stream-list__remote-container-h">
        <!-- <vmp-air-container :oneself="true" :cuid="childrenCom[0]"></vmp-air-container> -->
      </div>
    </div>
    <template v-if="streamList.length">
      <div
        v-for="stream in streamList"
        :key="stream.id"
        class="vmp-stream-list__remote-container"
        :class="{ 'vmp-stream-list__main-screen': stream.accountId == 'mainScreen' }"
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
        streamList: [],
        mainScreen: '16422770',
        accountId: '',
        childrenCom: []
      };
    },

    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
    },

    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
      console.log('-- this.childrenCom:', this.childrenCom);
      this.getStreamList();
    },

    methods: {
      getStreamList() {
        // this.streamList = this.interactiveServer.state.interactiveInstance.currentStreams;
        console.log('------streamlist------', this.streamList);
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
    // 除了主屏流，还有其他上麦流存在的情况
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
      &-h {
        height: 100%;
      }
    }
    // 只有一个主屏流的情况，设置高度为 0
    &-h0 {
      height: 0;
      .vmp-stream-list__main-screen {
        top: 0;
      }
    }
  }
</style>
