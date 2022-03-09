<template>
  <div class="vmp-basic-layout">
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="subcribeRoot"></vmp-air-container>
    </div>
    <msg-tip v-if="state == 2" :liveErrorTip="liveErrorTip"></msg-tip>
  </div>
</template>
<script>
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import subscribeState from '../../headless/subscribe-state.js';
  import MsgTip from '../MsgTip.vue';
  export default {
    name: 'Subcribe',
    components: {
      MsgTip
    },
    data() {
      return {
        state: 0,
        liveErrorTip: ''
      };
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        let clientType = 'standard';
        if (location.pathname.indexOf('embedclient') != -1) {
          clientType = 'embed';
        }
        await this.initReceiveLive(clientType);
        await subscribeState();
        console.log('%c---初始化直播房间 完成', 'color:blue');

        const roomBaseServer = useRoomBaseServer();
        document.title = roomBaseServer.state.watchInitData.webinar.subject;
        // 是否跳转预约页
        if (this.$domainStore.state.roomBaseServer.watchInitData.status == 'live') {
          this.goWatchPage(clientType);
        }

        // 初始化数据上报
        console.log('%c------服务初始化 initVhallReport 初始化完成', 'color:blue');
        // http://wiki.vhallops.com/pages/viewpage.action?pageId=23789619
        this.state = 1;
      } catch (err) {
        console.error('---初始化直播房间出现异常2222222--');
        console.error(err);
        this.state = 2;
        this.handleErrorCode(err);
      }
    },
    mounted() {},
    methods: {
      initReceiveLive(clientType) {
        const { id } = this.$route.params;
        const { token } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'player'],
          requestHeaders: {
            token: localStorage.getItem('token') || '',
            'gray-id': sessionStorage.getItem('initGrayId')
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: clientType //客户端类型
          }
        });
      },
      handleErrorCode(err) {
        if (err.code == 512522) {
          this.liveErrorTip = this.$t('message.message_1009');
        } else if (err.code == 512541) {
          this.liveErrorTip = this.$t('message.message_1008');
        } else if (
          err.code == 516324 ||
          err.code == 516324 ||
          err.code == 512562 ||
          err.code == 512562 ||
          err.code == 512571 ||
          err.code == 512002
        ) {
          this.liveErrorTip = this.$t('message.message_1004');
        } else if (err.code == 512503 || err.code == 512502) {
          window.location.href = `${window.location.origin}/${this.$route.params.id}`;
        } else if (err.code == 512534) {
          // 第三方k值校验失败 跳转指定地址
          window.location.href = err.data.url;
        } else {
          this.liveErrorTip = this.$tes(err.code) || err.msg;
        }
      },
      goWatchPage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/watch/${this.$route.params.id}${window.location.search}`;
      }
    }
  };
</script>
