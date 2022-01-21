<template>
  <div
    class="vmp-basic-layout"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="layerRoot"></vmp-air-container>

      <aside class="vmp-basic-dialog-container">
        <!-- <VmpPcMediaCheck></VmpPcMediaCheck> -->
      </aside>
    </div>
    <MsgTip v-else-if="state === 2" :text="errMsg"></MsgTip>
  </div>
</template>

<script>
  import roomState from '../headless/room-state.js';
  import MsgTip from './MsgTip.vue';
  import { Domain, useMicServer, useRoomBaseServer } from 'middle-domain';
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
        console.log(useRoomBaseServer());
        await roomState();
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
      } catch (ex) {
        console.error('---初始化直播房间出现异常--');
        console.error(ex);
        this.state = 2;
        this.errMsg = ex.msg;
      }
      this.micServer = useMicServer();
      this.micServer.$on('user_apply', msg => {
        console.log('----dingxiaodong----收到申请上麦消息', msg);
        this.$confirm(`${msg.data.nickname}申请上麦`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            this.micServer.hostAgreeApply({
              receive_account_id: msg.data.applyUserId
            });
          })
          .catch(() => {
            this.micServer.hostRejectApply({
              receive_account_id: msg.data.applyUserId
            });
          });
      });
    },
    methods: {
      // 初始化直播房间
      initSendLive() {
        const { id } = this.$route.params;
        const { token } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction'],
          requestHeaders: {
            token: token || localStorage.getItem('token')
          },
          initRoom: {
            webinar_id: id, //活动id
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
