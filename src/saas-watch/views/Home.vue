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
        this.roomInitGroupServer.initReceiveLive({
          webinar_id: '876395481',
          webinarId: '876395481',
          visitor_id: '',
          refer: '',
          record_id: ''
        });
        // this.roomInitGroupServer.initSendLive({
        //   webinarId: 693742622,
        //   requestHeaders: {
        //     token: localStorage.getItem('token')
        //   }
        // });
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
<style lang="less">
  // 媒体查询分辨率下效果
  @media screen and (min-width: 1920px) {
    .vmp-basic-bd {
      max-width: 1658px;
    }
  }

  @media screen and (min-width: 1706px) {
    .vmp-basic-bd {
      max-width: 1658px;
    }
  }

  @media screen and (min-width: 1388px) and (max-width: 1705px) {
    .vmp-basic-bd {
      max-width: 1339px;
    }
  }

  @media screen and (max-width: 1387px) {
    .vmp-basic-bd {
      max-width: 1339px;
    }
  }

  @media screen and (max-width: 1440px) {
    .vmp-basic-bd {
      max-width: 1339px;
    }
  }

  @media screen and (max-width: 1366px) {
    .vmp-basic-bd {
      max-width: 1103px;
    }
  }

  @media screen and (max-width: 1151px) {
    // 浏览器中部最小间距，低于此分辨率1151px滚动条
    .vmp-basic-bd {
      max-width: 1103px;
    }
  }
</style>
