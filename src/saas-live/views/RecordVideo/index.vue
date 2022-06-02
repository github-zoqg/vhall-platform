<template>
  <div
    class="vmp-basic-layout"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="recordVideoRoot"></vmp-air-container>
    </div>
    <MsgTip v-else-if="state === 2" :text="errMsg"></MsgTip>
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import roomState from '../../headless/record-video-state.js';
  import MsgTip from '../MsgTip';
  import Chrome from '../Chrome';
  import { Domain, useRoomBaseServer } from 'middle-domain';
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
        const watchInitData = roomBaseServer.state.watchInitData;

        domain.initVhallReport({
          bu: 0,
          user_id: watchInitData.join_info.join_id,
          webinar_id: this.$route.params.id,
          t_start: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          os: 10,
          type: 4,
          entry_time: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          pf: 7,
          env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test'
        });
        window.vhallReport.report('ENTER_WATCH');
        const res = await roomState();

        // 使用活动的标题作为浏览器title显示, 由于发起端不用翻译所以直接用活动下的, 如果后期要翻译需要, 通过翻译里取
        document.title = watchInitData.webinar.subject;

        // 如果浏览器不支持
        if (res === 'isBrowserNotSupport') {
          this.state = 3;
          return;
        }
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
      } catch (err) {
        console.error('---初始化直播房间出现异常--');
        console.error(err);
        if (err.code == 510008) {
          // 未登录
          location.href = `${process.env.VUE_APP_WEB_BASE + process.env.VUE_APP_WEB_KEY}/login?${
            location.search
          }`;
        }
        this.state = 2;
        this.errMsg = err.msg;
      }
    },
    methods: {
      // 初始化直播房间
      initSendLive() {
        const { id } = this.$route.params;
        return new Domain({
          plugins: ['chat', 'doc', 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'record' //录制房间初始化
          },
          // 日志上报的参数
          devLogOptions: {
            namespace: 'saas', //业务线
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境
            method: 'post' // 上报方式
          }
        });
      }
    }
  };
</script>
