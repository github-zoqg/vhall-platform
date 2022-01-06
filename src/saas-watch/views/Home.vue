<template>
  <div
    class="vmp-basic-layout"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
    </div>
  </div>
</template>

<script>
  import { useRoomInitGroupServer } from 'vhall-sass-domain';
  import roomState from '../headless/room-state.js';
  export default {
    name: 'Home',
    data() {
      return {
        state: 0
      };
    },
    beforeCreate() {
      this.roomInitGroupServer = useRoomInitGroupServer();
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        await this.initReceiveLive();
        await roomState();
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
      } catch (ex) {
        console.error('---初始化直播房间出现异常--');
        // console.error(ex);
        // this.state = 2;
        // this.errMsg = ex.msg;
      }
    },
    mounted() {
      // 派发推流事件
      setTimeout(() => {
        window.$middleEventSdk?.event?.send({
          cuid: 'comStreamLocal',
          method: 'startPush'
        });
      }, 3000);
    },
    methods: {
      initReceiveLive() {
        const { id } = this.$route.params;
        return this.roomInitGroupServer.initReceiveLive({
          webinarId: id,
          visitor_id: '',
          refer: '',
          record_id: '',
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          }
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
