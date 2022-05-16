<template>
  <div
    class="vmp-basic-layout"
    v-loading="state === 0"
    :element-loading-text="$t('common.common_1001')"
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div
      class="common-notice-light-mask"
      v-if="isNoticeMaskShow"
      @click.stop.prevent="handleChangeNoticeState"
    ></div>
    <div
      class="vmp-basic-container"
      :class="clientType == 'embed' ? 'vmp-basic-container-embed' : 'vmp-basic-container-normarl'"
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
  import { Domain, useRoomBaseServer, useMsgServer } from 'middle-domain';
  import roomState, { isMSECanUse } from '../headless/room-state.js';
  import { getQueryString } from '@/packages/app-shared/utils/tool';
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
        },
        isNoticeMaskShow: false
      };
    },
    computed: {
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      }
    },
    async created() {
      this.$on('notice_panel_status', result => {
        this.isNoticeMaskShow = result;
      });
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
        const domain = await this.initReceiveLive(this.clientType);
        await roomState();
        // 是否跳转预约页
        if (
          this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe' &&
          !this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id
        ) {
          this.goSubscribePage(this.clientType);
          return false;
        }
        await this.initCheckAuth('watch'); // 必须先setToken (绑定qq,wechat)
        document.title = roomBaseServer.state.languages.curLang.subject;
        let lang = roomBaseServer.state.languages.lang;
        this.$i18n.locale = lang.type;
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
        console.log('%c---初始化直播房间 完成', 'color:blue');
        // 如果加密状态为 1 或者 2
        // 并且是点播或者回放
        // 需要判断当前浏览器是否支持 MSE
        if (
          roomBaseServer.state.watchInitData.webinar &&
          (roomBaseServer.state.watchInitData.webinar.type == 4 ||
            roomBaseServer.state.watchInitData.webinar.type == 5) &&
          roomBaseServer.state.watchInitData.record.encrypt_status == 2
        ) {
          if (!isMSECanUse()) {
            this.state = 2;
            this.errorData.errorPageTitle = 'encrypt_error';
            this.errorData.errorPageText =
              '主办方设置了视频加密功能，建议使用最新版Chrome浏览器观看';
            return false;
          }
        }
        this.state = 1;
        this.addEventListener();
      } catch (err) {
        console.error('---初始化直播房间出现异常--');
        console.error(err);
        if (![512534, 512502, 512503].includes(Number(err.code))) {
          this.state = 2;
        }
        this.handleErrorCode(err);
        // this.errMsg = err.msg;
      }
    },
    mounted() {
      useRoomBaseServer().$on('ROOM_SIGNLE_LOGIN', () => {
        this.state = 2;
        this.errorData.errorPageTitle = 'it_end';
      });
    },
    beforeDestroy() {
      window.vhallReport && window.vhallReport.report('LEAVE_WATCH', {}, false);
    },
    methods: {
      initReceiveLive(clientType) {
        const { id } = this.$route.params;
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
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
      goSubscribePage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/subscribe/${this.$route.params.id}${window.location.search}`;
      },
      addEventListener() {
        const roomBaseServer = useRoomBaseServer();
        //主持人、嘉宾离开房间的提示消息处理
        useMsgServer().$onMsg('LEFT', msg => {
          this.handleLeaveRoom(msg);
        });

        roomBaseServer.$on('ROOM_KICKOUT', () => {
          this.handleKickout();
        });
        // 浏览器或者页面关闭时上报
        window.addEventListener('beforeunload', function (e) {
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
      //主持人、嘉宾等离开房间的提示处理
      handleLeaveRoom(msg) {
        if (msg.context.role_name == 1) {
          this.$message.warning({ message: this.$t('message.message_1027') });
        }
        if (msg.context.role_name == 4) {
          this.$message.warning({
            message: this.$t('message.message_1029', {
              n: msg.context.nickname || msg.context.nick_name
            })
          });
        }
      },
      handleErrorCode(err) {
        switch (err.code) {
          case 512534:
            window.location.href = err.data.url; // 第三方k值校验失败 跳转指定地址
            break;
          case 512502: // 不支持的活动类型（flash）
          case 512503: // 不支持的活动类型（旧H5）
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
              window.location.href = `${window.location.origin}/webinar/inituser/${this.$route.params.il_id}${_embedQuery}`;
            } else {
              window.location.href = `${window.location.origin}/${this.$route.params.il_id}`;
            }
            break;
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
          case 611001:
            this.errorData.errorPageTitle = '互动初始化失败，' + err.msg;
            break;
          default:
            this.errorData.errorPageTitle = 'embed_verify';
            this.errorData.errorPageText = this.$tec(err.code) || err.msg;
        }
      },
      handleChangeNoticeState() {
        this.$emit('notice_panel_close', false);
      }
    }
  };
</script>
<style lang="less">
  .vmp-basic-container-embed {
    .vmp-basic-bd {
      max-width: unset;
      height: 100%;
    }
  }
  .vmp-basic-container-normarl {
    overflow: auto;
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
