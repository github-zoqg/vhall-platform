<template>
  <div class="vmp-stream-list" :class="{ 'vmp-stream-list-h0': !remoteStreams.length }">
    <div
      class="vmp-stream-list__local-container"
      :class="{
        'vmp-stream-list__main-screen': accountId == mainScreen,
        'vmp-dom__max': maxElement == 'mainScreen' && accountId == mainScreen,
        'vmp-dom__mini': miniElement == 'mainScreen' && accountId == mainScreen
      }"
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
          'vmp-dom__max': maxElement == 'mainScreen' && stream.accountId == mainScreen,
          'vmp-dom__mini': miniElement == 'mainScreen' && stream.accountId == mainScreen
        }"
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
        mainScreen: '16422770',
        accountId: '16422770',
        childrenCom: [],
        miniElement: 'mainScreen',
        maxElement: ''
      };
    },

    computed: {
      remoteStreams() {
        return this.$domainStore.state.interactiveServer.remoteStreams;
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

    // 除了主屏流，还有其他上麦流存在的情况
    .vmp-stream-list__main-screen {
      position: absolute;
      top: 80px;
      left: 60px;
      right: 310px;
      bottom: 0;
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
        top: 0;
      }
    }

    .vmp-stream-list__remote-container {
      width: 142px;
      height: 100%;
    }
  }
</style>
