<template>
  <div
    class="vmp-video-polling-wrap"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <vmp-air-container v-if="state === 1" cuid="videoPollingRoot"></vmp-air-container>
    <MsgTip v-else-if="state === 2" :text="errMsg"></MsgTip>
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import videoPollingState from '../../headless/video-polling-state';
  import MsgTip from '../MsgTip';
  import Chrome from '../Chrome';
  import { Domain, useRoomBaseServer } from 'middle-domain';
  export default {
    data() {
      return {
        state: 0,
        errMsg: ''
      };
    },
    components: {
      MsgTip,
      Chrome
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
        const res = await videoPollingState();
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
        let {
          token,
          nickname = '',
          email = '',
          liveT = '',
          token_type = '',
          assistant_token = ''
        } = this.$route.query;
        if (token_type === '1' && !liveT && assistant_token) {
          liveT = assistant_token;
        }
        if (token_type === '0' && !token && assistant_token) {
          token = assistant_token;
        }
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          requestBody: {
            live_token: liveT
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'send',
            check_online: 0, // 不检查主持人是否在房间
            nickname,
            email
          }
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-video-polling-wrap {
    width: 100%;
    height: 100%;
  }
</style>
