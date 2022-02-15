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
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import roomState from '../headless/room-state.js';
  import MsgTip from './MsgTip';
  import Chrome from './Chrome';
  import { Domain, useMicServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'Home',
    components: {
      MsgTip,
      Chrome
    },
    data() {
      return {
        state: 0, // 当前状态： 0:loading; 1：直播房间初始化成功； 2：初始化失败；3：浏览器不支持
        errMsg: ''
      };
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        const domain = await this.initSendLive();
        const roomBaseServer = useRoomBaseServer();
        domain.initVhallReport(
          {
            bu: 0,
            user_id: roomBaseServer.state.watchInitData.join_info.join_id,
            webinar_id: this.$route.params.id,
            t_start: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            os: 10,
            type: 4,
            entry_time: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            pf: 7,
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test'
          },
          {
            namespace: 'saas', //业务线
            env: 'test', // 环境
            method: 'post' // 上报方式
          }
        );
        window.vhallReport.report('ENTER_WATCH');
        window.vhallLog({
          tag: 'doc', // 日志所属功能模块
          data: {
            user_id: 20001,
            user_name: 'hello world',
            url: 'https://t.e.vhall.com'
          },
          type: 'log' // log 日志埋点，event 业务数据埋点
        });
        const res = await roomState();
        // 如果浏览器不支持
        if (res === 'isBrowserNotSuppport') {
          this.state = 3;
          return;
        }
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
      } catch (ex) {
        console.error('---初始化直播房间出现异常--');
        console.error(ex);
        this.state = 2;
        this.errMsg = ex.msg;
      }
      this.micServer = useMicServer();
      // FIXME:测试连麦代码，由于成员列表尚未接入，成员接入后删除
      this.micServer.$on('vrtc_connect_apply', msg => {
        console.log('----dingxiaodong----收到申请上麦消息', msg);
        this.$confirm(`${msg.data.nick_name}申请上麦`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            this.micServer.hostAgreeApply({
              receive_account_id: msg.data.room_join_id
            });
          })
          .catch(() => {
            this.micServer.hostRejectApply({
              receive_account_id: msg.data.room_join_id
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
      }
    }
  };
</script>
