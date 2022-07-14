<template>
  <div
    class="vmp-split-screen-wrap"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <vmp-air-container v-if="state === 1" cuid="splitScreenRoot"></vmp-air-container>
    <MsgTip v-else-if="state === 2" :text="errMsg"></MsgTip>
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import splitScreenState from '../headless/split-screen-state';
  import MsgTip from './MsgTip';
  import Chrome from './Chrome';
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import { logRoomInitSuccess, logRoomInitFailed } from '@/app-shared/utils/report';
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
        const watchInitData = roomBaseServer.state.watchInitData;

        domain.initVhallReport({
          bu: 0,
          user_id: watchInitData.join_info.join_id,
          webinar_id: this.$route.params.id,
          t_start: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          os: 10,
          type: 4,
          entry_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          pf: 7,
          env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test'
        });

        // 使用活动的标题作为浏览器title显示, 由于发起端不用翻译所以直接用活动下的, 如果后期要翻译需要, 通过翻译里取
        document.title = watchInitData.webinar.subject;

        const res = await splitScreenState();
        // 如果浏览器不支持
        if (res === 'isBrowserNotSupport') {
          this.state = 3;
          return;
        } else if (res === 'splitOpenError') {
          this.state = 2;
          this.errMsg = '页面无法打开，请检查分屏页面是否已打开或分屏模式未开启';
          return;
        }
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
        //上报日志
        logRoomInitSuccess({ isSend: true });
      } catch (err) {
        //上报日志
        logRoomInitFailed({ isSend: true, error: err });
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
        const { token, nickname = '', email = '', liveT = '', live_token = '' } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          requestBody: {
            live_token: liveT || live_token
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'send',
            check_online: 0, // 不检查主持人是否在房间
            nickname,
            email
          },
          // 日志上报的参数
          devLogOptions: {
            namespace: 'saas', //业务线
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境
            method: 'post' // 上报方式
          }
        });
      }
      // 直播结束停止推流事件
      // handleUnpublishComplate() {

      // }
    }
  };
</script>

<style lang="less">
  .vmp-split-screen-wrap {
    width: 100%;
    height: 100%;
  }
</style>
