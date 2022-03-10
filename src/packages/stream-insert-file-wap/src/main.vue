<template>
  <div id="vmp-wap-insert-file" v-show="isOpenInsertFile">
    <!-- 订阅桌面共享容器 -->
  </div>
</template>

<script>
  import { useRoomBaseServer, useInsertFileServer } from 'middle-domain';

  export default {
    name: 'VmpWapInsertFIle',

    computed: {
      isOpenInsertFile() {
        return this.insertFileServer.state.insertStreamInfo.streamId;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.insertFileServer = useInsertFileServer();
    },
    created() {
      this.addEvents();
    },
    mounted() {
      if (this.isOpenInsertFile) {
        this.subscribeInsert();
      }
    },
    methods: {
      // 订阅插播流
      subscribeInsert() {
        const opt = {
          videoNode: 'vmp-wap-insert-file', // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };
        this.insertFileServer.subscribeInsertStream(opt);
      },
      addEvents() {
        // 监听桌面共享或者插播流加入
        this.insertFileServer.$on('INSERT_FILE_STREAM_ADD', () => {
          this.subscribeInsert();
        });
        // 监听桌面共享或者插播流离开
        this.insertFileServer.$on('INSERT_FILE_STREAM_REMOVE', () => {
          this.insertFileServer.unsubscribeInsertStream();
        });
      }
    }
  };
</script>

<style lang="less">
  #vmp-wap-insert-file {
    width: 100%;
    height: 100%;
    background: #2d2d2d;
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
