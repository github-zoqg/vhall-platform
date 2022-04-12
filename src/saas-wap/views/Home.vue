<template>
  <div
    class="vmp-basic-layout"
    :class="{
      'vmp-basic-layout__noHeader': !showHeader
    }"
  >
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
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
    </div>
    <msg-tip v-if="state == 2" :liveErrorTip="liveErrorTip"></msg-tip>
  </div>
</template>

<script>
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import roomState from '../headless/room-state.js';
  import bindWeiXin from '../headless/bindWeixin.js';
  import { getQueryString } from '@/packages/app-shared/utils/tool';
  import { getVhallReportOs } from '@/packages/app-shared/utils/tool';
  import MsgTip from './MsgTip.vue';

  export default {
    name: 'Home',
    components: {
      MsgTip
    },
    data() {
      return {
        state: 2,
        liveErrorTip: ''
      };
    },
    computed: {
      /**
       * 是否显示头部
       */
      showHeader() {
        if (this.embedObj.embed || (this.webinarTag && this.webinarTag.organizers_status == 0)) {
          return false;
        } else {
          return true;
        }
      },
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      // 主办方配置
      webinarTag() {
        return this.$domainStore.state.roomBaseServer.webinarTag;
      }
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        let clientType = 'standard';
        // 初始化直播房间
        const roomBaseServer = useRoomBaseServer();
        // 判断是否是嵌入/单视频嵌入
        try {
          const _param = {
            isEmbed: false,
            isEmbedVideo: false
          };
          if (location.pathname.indexOf('embedclient') != -1) {
            _param.isEmbed = true;
            clientType = 'embed';
          }
          if (getQueryString('embed') == 'video') {
            _param.isEmbedVideo = true;
          }
          roomBaseServer.setEmbedObj(_param);
        } catch (e) {
          console.log('嵌入', e);
        }
        const domain = await this.initReceiveLive(clientType);
        if (this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe') {
          // 是否跳转预约页
          this.goSubscribePage(clientType);
          return;
        }
        await roomState();
        bindWeiXin();
        console.log('%c---初始化直播房间 完成', 'color:blue');

        const roomBaseState = roomBaseServer.state;
        document.title = roomBaseState.languages.curLang.subject;
        let lang = roomBaseServer.state.languages.lang;
        this.$i18n.locale = lang.type;
        // 初始化数据上报
        console.log('%c------服务初始化 initVhallReport 初始化完成', 'color:blue');
        // http://wiki.vhallops.com/pages/viewpage.action?pageId=23789619
        domain.initVhallReport(
          {
            bu: 0,
            user_id: roomBaseServer.state.watchInitData.join_info.join_id,
            webinar_id: this.$route.params.id,
            t_start: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            os: getVhallReportOs(),
            type: 2, //播放平台 2: wap
            entry_time: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            pf: 3, // wap
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test'
          },
          {
            namespace: 'saas', //业务线
            env: 'test', // 环境
            method: 'post' // 上报方式
          }
        );
        window.vhallReport.report('ENTER_WATCH');
        this.state = 1;
        this.addEventListener();
      } catch (err) {
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
          plugins: ['chat', 'player', 'doc', 'interaction', 'report', 'questionnaire'],
          requestHeaders: {
            token: clientType === 'embed' ? '' : localStorage.getItem('token') || ''
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: clientType, //客户端类型
            ...this.$route.query // 第三方地址栏传参
          }
        });
      },
      addEventListener() {
        const roomBaseServer = useRoomBaseServer();
        roomBaseServer.$on('ROOM_KICKOUT', () => {
          this.handleKickout();
        });
        // 不同意观看协议
        roomBaseServer.$on('VIEW_RESTRICTION_ERROR_PAGE', () => {
          this.state = 2;
          this.liveErrorTip = this.$t('other.other_1020');
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
        } else if (err.code == 611001) {
          this.liveErrorTip = '互动初始化失败，' + err.message;
        } else {
          this.liveErrorTip = this.$tec(err.code) || err.message;
        }
      },
      goSubscribePage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/subscribe/${this.$route.params.id}${window.location.search}`;
      }
    }
  };
</script>
