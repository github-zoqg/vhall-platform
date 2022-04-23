<template>
  <div class="vmp-subscribe-container">
    <div
      :class="clientType == 'embed' ? 'vmp-container-embed' : 'vmp-basic-container'"
      v-if="state === 1"
    >
      <vmp-air-container cuid="layerSubscribeRoot"></vmp-air-container>
    </div>
    <errorPage v-if="state === 2" :prop-type="errorData.errorPageTitle">
      <template v-if="errorData.errorPageText" slot="body">
        <p>{{ errorData.errorPageText }}</p>
      </template>
    </errorPage>
  </div>
</template>
<script>
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import subscribeState from '../../headless/subscribe-state.js';
  import { getQueryString } from '@/packages/app-shared/utils/tool';
  import authCheck from '../../mixins/chechAuth';
  import ErrorPage from '../ErrorPage';
  export default {
    name: 'vmpSubscribe',
    data() {
      return {
        state: 0,
        clientType: 'standard',
        errorData: {
          errorPageTitle: '',
          errorPageText: ''
        }
      };
    },
    components: {
      ErrorPage
    },
    mixins: [authCheck],
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
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
            this.clientType = 'embed';
          }
          if (getQueryString('embed') == 'video') {
            _param.isEmbedVideo = true;
          }
          roomBaseServer.setEmbedObj(_param);
        } catch (e) {
          console.log('嵌入', e);
        }
        await this.initReceiveLive(this.clientType);
        await subscribeState();
        if (this.clientType != 'embed') {
          await this.initCheckAuth('subscribe'); // 必须先setToken (绑定qq,wechat)
        }
        document.title = roomBaseServer.state.languages.curLang.subject;
        let lang = roomBaseServer.state.languages.lang;
        this.$i18n.locale = lang.type;
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
        // 是否跳转观看页
        if (
          this.$domainStore.state.roomBaseServer.watchInitData.status == 'live' ||
          (this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe' &&
            this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id)
        ) {
          this.goWatchPage(this.clientType);
        }
      } catch (err) {
        console.error('---初始化直播房间出现异常--', err);
        this.state = 2;
        this.handleErrorCode(err);
      }
    },
    mounted() {
      const roomBaseServer = useRoomBaseServer();
      roomBaseServer.$on('VIEW_RESTRICTION_ERROR_PAGE', () => {
        this.state = 2;
        this.errorData.errorPageTitle = 'view_restriction';
      });
    },
    methods: {
      initReceiveLive(clientType) {
        const { id } = this.$route.params;
        return new Domain({
          plugins: ['chat', 'player'],
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
      goWatchPage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/watch/${this.$route.params.id}${window.location.search}`;
      },
      handleErrorCode(err) {
        switch (err.code) {
          case 512002:
            this.errorData.errorPageTitle = 'active_lost'; // 此视频暂时下线了
            break;
          case 512542: // 访客数据信息不全
          case 516324:
          case 512562: // 无极版流量已达上限
          case 512543:
            this.errorData.errorPageTitle = 'video_null'; // 此视频暂时下线了
            break;
          case 512571:
            this.errorData.errorPageTitle = 'video_null'; // 流量用户欠费超过100G，暂不能进入
            break;
          case 512541:
            this.errorData.errorPageTitle = 'surpass_limit'; // 活动现场太火爆，已超过人数上限
            break;
          case 512522:
            this.errorData.errorPageTitle = 'clear_cookie'; // 主持人、嘉宾或助理直播时不能进入观看端
            break;
          case 512514:
            this.errorData.errorPageTitle = 'un_auth'; // 您已被禁止访问当前活动，被踢出直播间
            break;
          case 512588:
            this.errorData.errorPageTitle = 'embed_verify';
            this.errorData.errorPageText = this.$tec(err.code) || err.msg;
            break;
          case 512539:
            this.errorData.errorPageTitle = 'embed_verify'; // 观看页为嵌入页，设置观看限制为付费、邀请码、白名单、付费or邀请码、设置了报名报单时，访问观看页时，页面提示
            break;
          default:
            this.errorData.errorPageTitle = 'embed_verify';
            this.errorData.errorPageText = this.$tec(err.code) || err.msg;
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-subscribe-container {
    height: 100vh;
    .vmp-basic-container {
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      overflow-y: auto;
      font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
        '微软雅黑', Arial, sans-serif;
      .vmp-basic-bd {
        width: 100%;
        // height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        position: relative;
        flex: 1;
        overflow: hidden;
        margin: 0 auto;
        margin-top: 20px;
      }
    }
    .vmp-container-embed {
      width: 100%;
      height: 100vh;
      background: #1a1a1a;
      overflow: hidden;
      font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
        '微软雅黑', Arial, sans-serif;
      .vmp-basic-bd {
        max-width: unset;
        height: 100%;
      }
    }
    // 媒体查询分辨率下效果
    @media screen and (min-width: 1920px) {
      .vmp-basic-bd {
        max-width: 1658px;
      }
    }

    @media screen and (min-width: 1706px) {
      .vmp-basic-bd {
        max-width: 1658px;
      }
    }

    @media screen and (min-width: 1388px) and (max-width: 1705px) {
      .vmp-basic-bd {
        max-width: 1339px;
      }
    }

    @media screen and (max-width: 1387px) {
      .vmp-basic-bd {
        max-width: 1339px;
      }
    }

    @media screen and (max-width: 1440px) {
      .vmp-basic-bd {
        max-width: 1339px;
      }
    }

    @media screen and (max-width: 1366px) {
      .vmp-basic-bd {
        max-width: 1103px;
      }
    }

    @media screen and (max-width: 1151px) {
      // 浏览器中部最小间距，低于此分辨率1151px滚动条
      .vmp-basic-bd {
        max-width: 1103px;
      }
    }
  }
</style>
