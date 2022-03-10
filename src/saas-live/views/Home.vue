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
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import {
    Domain,
    useRoomBaseServer,
    useSplitScreenServer,
    useMicServer,
    useInteractiveServer
  } from 'middle-domain';
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
        roomBaseServer.startGetDegradationInterval({
          staticDomain: process.env.VUE_APP_DEGRADE_STATIC_DOMAIN,
          environment: process.env.NODE_ENV != 'production' ? 'test' : 'product',
          systemKey: 2
        });
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
        if (res === 'isBrowserNotSupport') {
          this.state = 3;
          return;
        }
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
        this.addEventListener();
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
        const { token, nickname = '', email = '', liveT = '' } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
          requestHeaders: {
            token: localStorage.getItem('token') || '',
            'gray-id': sessionStorage.getItem('initGrayId')
          },
          requestBody: {
            live_token: liveT
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'send', //客户端类型
            nickname,
            email
          }
        });
      },
      addEventListener() {
        const roomBaseServer = useRoomBaseServer();
        const splitScreenServer = useSplitScreenServer();
        const interactiveServer = useInteractiveServer();
        roomBaseServer.$on('ROOM_KICKOUT', () => {
          this.handleKickout();
        });
        // 关闭分屏模式
        splitScreenServer.$on('SPLIT_SHADOW_DISCONNECT', async () => {
          // 还原流信息
          interactiveServer.state.localStream = {
            streamId: null, // 本地流id
            videoMuted: false,
            audioMuted: false,
            attributes: {}
          };
          interactiveServer.state.remoteStreams = [];
          await interactiveServer.init();
          window.$middleEventSdk?.event?.send(boxEventOpitons('layerRoot', 'checkStartPush'));
        });
        // 分屏页面关闭
        splitScreenServer.$on('SPLIT_SHADOW_CLOSE', async () => {
          this.$message('正在与分屏页面建立连接，请稍等...');
        });
        // 分屏页面关闭10s未重新连接
        splitScreenServer.$on('SPLIT_CLOSE_TO_HOST', async () => {
          this.$message('关闭分屏模式');
        });
        splitScreenServer.$on('SPLIT_CUSTOM_MESSAGE', msg => {
          // 分屏停止推流完成的消息
          if (msg.data.body.type == 'split_unpublish_complete') {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons('comStreamLocal', 'emitClickUnpublishComplate')
            );
          }
        });
      },
      handleKickout() {
        this.state = 2;
        this.errMsg = '您已被禁止访问当前活动';
      }
    }
  };
</script>
