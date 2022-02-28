<template>
  <div
    class="vmp-basic-layout"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div
      class="vmp-basic-container"
      :class="clientType == 'embed' ? 'vmp-basic-container-embed' : ''"
      v-if="state === 1"
    >
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
    </div>
    <errorPage v-if="state === 2" :prop-type="errorData.errorPageTitle">
      <template v-if="errorData.errorPageText" slot="body">
        <p>{{ errorData.errorPageText }}</p>
      </template>
    </errorPage>
  </div>
</template>

<script>
  import { Domain } from 'middle-domain';
  import roomState from '../headless/room-state.js';
  import authCheck from '../mixins/chechAuth';
  import ErrorPage from './ErrorPage';
  export default {
    name: 'Home',
    components: {
      ErrorPage
    },
    mixins: [authCheck],
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
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        if (location.pathname.indexOf('embedclient') != -1) {
          this.clientType = 'embed';
        }
        await this.initReceiveLive(this.clientType);
        await this.initCheckAuth(); // 必须先setToken (绑定qq,wechat)
        await roomState();
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
        // 是否跳转预约页
        if (
          this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe' &&
          !this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id &&
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.type != 3
        ) {
          this.goSubscribePage(this.clientType);
        }
      } catch (err) {
        console.error('---初始化直播房间出现异常--');
        console.error(err);
        this.state = 2;
        this.handleErrorCode(err);
        // this.errMsg = err.msg;
      }
    },
    methods: {
      initReceiveLive(clientType) {
        const { id } = this.$route.params;
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
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
      goSubscribePage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/subscribe/${this.$route.params.id}${window.location.search}`;
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
          case 512539:
            this.errorData.errorPageTitle = 'embed_verify'; // 观看页为嵌入页，设置观看限制为付费、邀请码、白名单、付费or邀请码、设置了报名报单时，访问观看页时，页面提示
            break;
          default:
            this.errorData.errorPageTitle = 'embed_verify';
            this.errorData.errorPageText = err.msg;
        }
      }
    }
  };
</script>
<style lang="less">
  body {
    overflow: hidden;
  }
  .vmp-basic-container-embed {
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
</style>
