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
  import { Domain, useRoomBaseServer, useUserServer } from 'middle-domain';
  import roomState from '../headless/room-state.js';
  import bindWeiXin from '../headless/bindWeixin.js';
  import { getQueryString, getVhallReportOs, isWechatCom } from '@/app-shared/utils/tool';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  import { logRoomInitFailed, generateWatchReportCommonParams } from '@/app-shared/utils/report';
  import MsgTip from './MsgTip.vue';

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
    beforeRouteEnter(to, from, next) {
      // Vue history模式 微信分享IOS无效解决办法---最终章
      const { system } = getBrowserType();
      if (
        system == 'ios' &&
        `${process.env.VUE_APP_ROUTER_BASE_URL}${to.path}` != `${location.pathname}`
      ) {
        location.assign(`${process.env.VUE_APP_ROUTER_BASE_URL}${to.fullPath}`);
      } else {
        next();
      }
    },
    mounted() {
      this.initRoom();
      //消息监听
      useRoomBaseServer().$on('ROOM_SIGNLE_LOGIN', () => {
        this.state = 2;
        this.liveErrorTip = this.$t('message.message_1003');
      });
    },
    beforeDestroy() {
      window.vhallReport && window.vhallReport.report('LEAVE_WATCH', {}, false);
    },
    methods: {
      async initRoom() {
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

          //微信相关设置
          bindWeiXin();
          console.log('%c---初始化直播房间 完成', 'color:blue');

          const roomBaseState = roomBaseServer.state;
          document.title = roomBaseState.languages.curLang.subject;
          let lang = roomBaseServer.state.languages.lang;
          this.$i18n.locale = lang.type;

          // 如果往观看页跳转，需要清除暖场视频缓存
          window.sessionStorage.removeItem('warm_recordId');
          window.sessionStorage.removeItem('recordIds');
          // 初始化数据上报
          console.log('%c------服务初始化 initVhallReport 初始化完成', 'color:blue');
          // http://wiki.vhallops.com/pages/viewpage.action?pageId=23789619
          const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          domain.initVhallReport({
            bu: 0,
            user_id: roomBaseServer.state.watchInitData.join_info.join_id,
            webinar_id: this.$route.params.id,
            t_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            os: getVhallReportOs(),
            type: 2, //播放平台 2: wap
            entry_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            pf: 3, // wap
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test'
          });
          window.vhallReport.report('ENTER_WATCH');
          domain.initVhallReportForWatch({
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境，区分上报接口域名
            pf: 10 // 8：PC 10: wap
          });
          const commonReportForProductParams = generateWatchReportCommonParams(
            roomBaseServer.state.watchInitData,
            new useUserServer().state.userInfo,
            this.$route.query.shareId || this.$route.query.share_id
          );
          window.vhallReportForWatch?.injectCommonParams(commonReportForProductParams);
          window.vhallReportForWatch?.report(170017);
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
          },
          // 日志上报的参数
          devLogOptions: {
            namespace: 'saas', //业务线
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境
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
        if (err.code == 512522) {
          this.liveErrorTip = this.$t('message.message_1009');
        } else if (err.code == 512541) {
          this.liveErrorTip = this.$t('message.message_1008');
        } else if (
          err.code == 516324 ||
          err.code == 512562 ||
          err.code == 512571 ||
          err.code == 512002
        ) {
          this.liveErrorTip = this.$t('message.message_1004');
        } else if (err.code == 512503 || err.code == 512502) {
          if (this.embedObj?.embed || this.embedObj?.embedVideo) {
            let _embedQuery = location.search;
            _embedQuery =
              _embedQuery.indexOf('nickname=') != -1
                ? _embedQuery.replace('nickname=', 'name=')
                : _embedQuery;
            _embedQuery =
              _embedQuery.indexOf('record_id=') > -1
                ? _embedQuery.replace('record_id=', 'rid=')
                : _embedQuery;
            window.location.href = `${window.location.origin}/webinar/inituser/${this.$route.params.id}${_embedQuery}`;
          } else {
            window.location.href = `${window.location.origin}/${this.$route.params.id}`;
          }
        } else if (err.code == 512534) {
          // 第三方k值校验失败 跳转指定地址
          window.location.href = err.data.url;
        } else if (err.code == 611001) {
          this.liveErrorTip = '互动初始化失败，' + err.msg;
        } else if (err.code == 511006 || err.code == 511007) {
          if (this.$route.query?.token) {
            this.liveErrorTip = this.$tec(err.code) || err.msg;
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            this.initRoom();
          }
        } else {
          this.liveErrorTip = this.$tec(err.code) || err.msg;
        }
      },
      goSubscribePage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.replace(
          `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/subscribe/${this.$route.params.id}${window.location.search}`
        );
      }
    }
  };
</script>
