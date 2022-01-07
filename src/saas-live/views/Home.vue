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
  import { Domain, useMsgServer } from 'middleDomain';
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
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        await this.initSendLive();
        // await roomState();
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
      } catch (ex) {
        console.error('---初始化直播房间出现异常--');
        console.error(ex);
        this.state = 2;
        this.errMsg = ex.msg;
      }
    },
    methods: {
      // 初始化直播房间
      async initSendLive() {
        const { id } = this.$route.params;
        const { token } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction'],
          requestHeaders: {
            token: token || localStorage.getItem('token')
          },
          initRoom: {
            webinarId: id, //活动id
            clientType: 'send' //客户端类型
          }
        });
        // 初始化房间
        // await domainInstance.initRoom({
        //   webinarId: id, //活动id
        //   clientType: 'send' //客户端类型
        // });
      }
    }
  };
</script>
