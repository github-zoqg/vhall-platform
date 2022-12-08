<template>
  <div class="vmp-basic-layout vmp-basic-layout-embed">
    <van-loading
      v-show="state === 0"
      size="32px"
      type="spinner"
      :vertical="true"
      style="
        position: absolute;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      "
    >
      {{ $t('common.common_1001') }}
    </van-loading>
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="embedVideoLayerRoot"></vmp-air-container>
    </div>
    <msg-tip v-if="state == 2" :liveErrorTip="liveErrorTip"></msg-tip>
  </div>
</template>

<script>
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import roomState from '../../headless/embed-video-state.js';
  import { getVhallReportOs, isWechatCom } from '@/app-shared/utils/tool';
  import { logRoomInitFailed } from '@/app-shared/utils/report';
  import MsgTip from '../MsgTip.vue';

  export default {
    name: 'Home',
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
        if (isWechatCom()) {
          if (sessionStorage.getItem('reloadStatus')) {
            sessionStorage.setItem('reloadStatus', 2);
          } else {
            sessionStorage.setItem('reloadStatus', 1);
            window.location.reload();
          }
        }
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        let clientType = 'embed';
        // 初始化直播房间
        const roomBaseServer = useRoomBaseServer();
        // 单视频嵌入
        roomBaseServer.setEmbedObj({
          isEmbed: true,
          isEmbedVideo: true
        });
        document.documentElement.style.background = 'initial';

        const domain = await this.initReceiveLive(clientType);
        if (this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe') {
          // 是否跳转预约页
          this.goSubscribePage(clientType);
          return;
        }
        await roomState();
        console.log('%c---初始化直播房间 完成', 'color:blue');

        const roomBaseState = roomBaseServer.state;
        document.title = roomBaseState.languages.curLang.subject;
        let lang = roomBaseServer.state.languages.lang;
        this.$i18n.locale = lang.type;
        // 初始化数据上报
        console.log('%c------服务初始化 initVhallReport 初始化完成', 'color:blue');
        // http://wiki.vhallops.com/pages/viewpage.action?pageId=23789619
        domain.initVhallReport({
          bu: 0,
          user_id: roomBaseServer.state.watchInitData.join_info.join_id,
          webinar_id: this.$route.params.id,
          t_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          os: getVhallReportOs(),
          type: 2, //播放平台 2: wap
          entry_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          pf: 3, // wap
          env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV) ? 'production' : 'test'
        });
        window.vhallReport.report('ENTER_WATCH');
        this.state = 1;
        this.addEventListener();
      } catch (err) {
        //上报日志
        logRoomInitFailed({ error: err });
        console.error('---初始化直播房间出现异常--', err);
        console.error(err);
        this.state = 2;
        this.handleErrorCode(err);
      }
    },
    mounted() {
      useRoomBaseServer().$on('ROOM_SIGNLE_LOGIN', () => {
        this.state = 2;
        this.liveErrorTip = this.$t('message.message_1003');
      });
    },
    beforeDestroy() {
      window.vhallReport && window.vhallReport.report('LEAVE_WATCH', {}, false);
    },
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
            token: clientType === 'embed' ? '' : localStorage.getItem('token') || ''
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: clientType, //客户端类型
            ...this.$route.query // 第三方地址栏传参
          },
          // 日志上报的参数
          devLogOptions: {
            namespace: 'saas', //业务线
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test', // 环境
            method: 'post' // 上报方式
          }
        });
      },
      addEventListener() {
        const roomBaseServer = useRoomBaseServer();
        roomBaseServer.$on('ROOM_KICKOUT', () => {
          this.handleKickout();
        });
        // 浏览器或者页面关闭时上报
        window.addEventListener('beforeunload', function (e) {
          console.log('home beforeunload------->', e);
          // 离开H5观看端页面
          if (/lives\/watch/.test(window.location.pathname)) {
            window.vhallReport && window.vhallReport.report('LEAVE_WATCH', {}, false);
          }
        });
      },
      handleKickout() {
        this.state = 2;
        this.handleErrorCode({
          code: 512514,
          msg: this.$t('message.message_1007')
        });
      },
      handleErrorCode(err) {
        let currentQuery = location.search;
        let origin =
          process.env.NODE_ENV === 'production'
            ? window.location.origin
            : 'https://t-webinar.e.vhall.com';
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
          currentQuery =
            currentQuery.indexOf('nickname=') != -1
              ? currentQuery.replace('nickname=', 'name=')
              : currentQuery;
          currentQuery =
            currentQuery.indexOf('record_id=') > -1
              ? currentQuery.replace('record_id=', 'rid=')
              : currentQuery;
          window.location.href = `${origin}/webinar/inituser/${this.$route.params.id}${currentQuery}`; // 跳转到老
        } else if (err.code == 512534) {
          // 第三方k值校验失败 跳转指定地址
          window.location.href = err.data.url;
        } else if (err.code == 611001) {
          this.liveErrorTip = '互动初始化失败，' + err.msg;
        } else {
          this.liveErrorTip = this.$tec(err.code) || err.msg;
        }
      },
      goSubscribePage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        location.replace(
          `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/subscribe/${this.$route.params.id}${window.location.search}`
        );
      }
    }
  };
</script>
<style lang="less">
  .vmp-basic-layout-embed {
    .vmp-basic-container {
      display: flex;
      align-items: center;
    }
  }
</style>
