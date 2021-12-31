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
    <MsgTip v-else-if="state === 2" :text="errMsg"></MsgTip>
  </div>
</template>

<script>
  import roomState from '../headless/room-state.js';
  import MsgTip from './MsgTip.vue';
  import { useRoomInitGroupServer, contextServer } from 'vhall-sass-domain';
  export default {
    name: 'Home',
    components: {
      MsgTip
    },
    data() {
      return {
        state: 0, // 当前状态： 0:loading; 1：直播房间初始化成功； 2：初始化失败
        errMsg: ''
      };
    },
    beforeCreate() {
      this.roomInitGroupServer = useRoomInitGroupServer();
      this.msgServer = contextServer.get('msgServer');
    },
    async created() {
      // 初始化直播房间
      await this.initSendLive();
      roomState();
    },
    methods: {
      // 初始化直播房间
      async initSendLive() {
        const { id } = this.$route.params;
        const { token } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        try {
          await this.roomInitGroupServer.initSendLive({
            webinarId: id,
            requestHeaders: {
              token: localStorage.getItem('token')
            }
          });
          // 初始化完成
          this.state = 1;
        } catch (ex) {
          console.log('---ex--');
          console.log(ex);
          this.state = 1;
          this.errMsg = ex.msg;
        }
      }
    }
  };
</script>
