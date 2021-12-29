<template>
  <div class="vmp-basic-layout">
    <div class="vmp-basic-container" v-if="isInit">
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
    </div>
  </div>
</template>

<script>
  import { useRoomInitGroupServer, contextServer } from 'vhall-sass-domain';
  export default {
    name: 'Home',
    data() {
      return {
        isInit: false
      };
    },
    beforeCreate() {
      this.roomInitGroupServer = useRoomInitGroupServer();
    },
    created() {
      // 初始化直播房间
      this.initSendLive();
    },
    methods: {
      // 初始化直播房间
      async initSendLive() {
        const { id } = this.$route.params;
        const { token } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        await this.roomInitGroupServer.initSendLive({
          webinarId: id,
          requestHeaders: {
            token: localStorage.getItem('token')
          }
        });
        // 初始化完成
        this.isInit = true;
      },
      initChatSDK() {
        this.msgServer = contextServer.get('msgServer');
        this.msgServer.init().then(res => {
          console.log('聊天实例创建', res);
        });
      }
    }
  };
</script>
