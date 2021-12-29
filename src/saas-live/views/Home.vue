<template>
  <div class="vmp-basic-layout">
    <div class="vmp-basic-container">
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
    </div>
  </div>
</template>

<script>
  import { useRoomInitGroupServer, contextServer } from 'vhall-sass-domain';
  export default {
    name: 'Home',
    data() {},
    beforeCreate() {
      this.roomInitGroupServer = useRoomInitGroupServer();
    },
    created() {
      this.setToken();
      this.initSendLive();
    },
    methods: {
      setToken() {
        localStorage.setItem(
          'token',
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDA2ODMyNDgsImV4cCI6MTY0MzI3NTI0OCwidXNlcl9pZCI6IjE2NDIyNzcwIiwicGxhdGZvcm0iOiI3IiwiY2giOiJiIiwiYnVzaW5lc3NfYWNjb3VudF9pZCI6IiJ9.zBKTqqn4EEmLKHduBlUfsmqMMU1I3vPmBfjfGR1cXfo'
        );
      },
      initSendLive() {
        this.roomInitGroupServer.initSendLive({
          webinarId: 693742622,
          requestHeaders: {
            token: localStorage.getItem('token')
          }
        });
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
