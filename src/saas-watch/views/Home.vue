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
  import { Domain, useRoomBaseServer, useMsgServer, useUserServer } from 'middle-domain';
  import roomState, { isMSECanUse } from '../headless/room-state.js';
  import { getQueryString } from '@/app-shared/utils/tool';
  import { imgPositionSizeMap } from '@/app-shared/utils/imgModeMap.js';
  import { logRoomInitFailed, generateWatchReportCommonParams } from '@/app-shared/utils/report';
  import authCheck from '../mixins/chechAuth';
  import ErrorPage from './ErrorPage';
  import skins from '@/app-shared/skins/watch';
  // import { updatePageNode } from '@/app-shared/utils/pageConfigUtil';

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
      await this.initRoom();
    },
    watch: {
      ['$domainStore.state.interactiveServer.mediaPermissionDenied']: {
        deep: true,
        immediate: true,
        handler(newVlaue) {
          if (newVlaue) {
            this.$message.warning(this.$t('interact.interact_1039'));
          }
        }
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
      async initRoom() {
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

          this.setPageConfig();

          // 是否跳转预约页
          if (
            roomBaseServer.state.watchInitData.live_type != 2 &&
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
          // 如果往观看页跳转，需要清除暖场视频缓存
          window.sessionStorage.removeItem('warm_recordId');
          window.sessionStorage.removeItem('recordIds');
          // 上报wiki: http://wiki.vhallops.com/pages/viewpage.action?pageId=290882260
          domain.initVhallReport({
            bu: 0,
            user_id: roomBaseServer.state.watchInitData.join_info.join_id,
            webinar_id: this.$route.params.id,
            t_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            os: 10,
            type: 4,
            entry_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            pf: 7,
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test'
          });

          // 产品侧数据埋点初始化
          domain.initVhallReportForProduct({
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test', // 环境，区分上报接口域名
            app_id: process.env.VUE_APP_SAAS_ENV === 'production' ? '15df4d3f' : 'fd8d3653', // 产品 app id
            t_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            pf: 8, // 客户端类型  web 网页端用 8
            user_id: roomBaseServer.state.watchInitData.join_info.join_id, // C端用户 id（如果是B端用当前用户id）
            webinar_id: this.$route.params.id // 活动 id
          });

          window.vhallReport.report('ENTER_WATCH');
          // 产品侧上报需求
          domain.initVhallReportForWatch({
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境，区分上报接口域名
            pf: 7
          });
          const commonReportForProductParams = generateWatchReportCommonParams(
            roomBaseServer.state.watchInitData,
            new useUserServer().state.userInfo,
            this.$route.query.shareId || this.$route.query.share_id
          );
          window.vhallReportForWatch?.injectCommonParams(commonReportForProductParams);
          window.vhallReportForWatch?.report(170017);
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
          //上报日志
          logRoomInitFailed({ error: err });
          console.error('---初始化直播房间出现异常--');
          console.error(err);
          if (![512534, 512502, 512503, 511007, 511006].includes(Number(err.code))) {
            this.state = 2;
          }
          this.handleErrorCode(err);
          // this.errMsg = err.msg;
        }
      },
      initReceiveLive(clientType) {
        const { id } = this.$route.params;
        const { rehearsal } = this.$route.query;
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
          requestHeaders: {
            token: clientType === 'embed' ? '' : localStorage.getItem('token') || ''
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: clientType, //客户端类型
            live_type: rehearsal == 1 ? 2 : 0, // 2 彩排   0 正式
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
        // 兼容客户端字段
        if (msg.context?.role_name == 1 || msg.context?.role == 1) {
          this.$message.warning({ message: this.$t('message.message_1027') });
        }
        // 7.7.4 优化后不再提示
        // if (msg.context?.role_name == 4 || msg.context?.role == 4) {
        //   this.$message.warning({
        //     message: this.$t('message.message_1029', {
        //       n: msg.context.nickname || msg.context.nick_name
        //     })
        //   });
        // }
      },
      handleErrorCode(err) {
        let origin =
          process.env.NODE_ENV === 'production'
            ? window.location.origin
            : 'https://t-webinar.e.vhall.com';
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

              window.location.href = `${origin}/webinar/inituser/${this.$route.params.id}${_embedQuery}`;
            } else {
              window.location.href = `${origin}/${this.$route.params.id}`;
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
          case 511006: // token 校验失败，清空token，刷新页面
          case 511007:
            if (this.$route.query?.token) {
              this.errorData.errorPageTitle = 'embed_verify';
              this.errorData.errorPageText = this.$tec(err.code) || err.msg;
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('userInfo');
              this.initRoom();
            }
            break;
          default:
            this.errorData.errorPageTitle = 'embed_verify';
            this.errorData.errorPageText = this.$tec(err.code) || err.msg;
        }
      },
      handleChangeNoticeState() {
        this.$emit('notice_panel_close', false);
      },
      setPageConfig() {
        /*
        {
            "backGroundColor": "1", //主题色 按照数字逻辑 前端枚举
            "pageStyle": "#FB3A32", // 页面风格
            "popStyle": "",// 原有字段 预留
            "background": "", //背景图
            "backgroundSize": "", //背景图大小字符串
            "blurryDegree": "0", // 模糊程度
            "lightDegree": "10",// 光亮程度
            "style": "1",// 风格 按照数字逻辑 前端枚举
            "inavLayout": "CANVAS_ADAPTIVE_LAYOUT_TILED_MODE", //连麦布局
            "inavDocumentLayout": "1", //连麦+演示布局 1 上下 2 左右
            "videoColor": "#1A1A1A",  //视频底色
            "videoBackGround": "", // 视频背景图
            "videoBlurryDegree": "0",  //视频模糊程度
            "videoLightDegree": "10",//视频亮度
            "videoBackGroundSize": "", //视频图片裁剪大小对象
            "chatLayout": "1" //聊天布局 1 上下 2 左右
          }
        */

        const themeMap = {
          1: 'black',
          2: 'white',
          3: 'red',
          4: 'golden',
          5: 'blue'
        };

        const styleMap = {
          1: 'default', // 传统风格
          2: 'simple', // 简洁风格
          3: 'fashion' // 时尚风格
        };
        let skin_json_pc = {
          style: 1,
          backGroundColor: 1,
          chatLayout: 1 // 聊天布局 1 上下 2 左右
        };

        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_pc && skinInfo.skin_json_pc != 'null') {
          skin_json_pc = skinInfo.skin_json_pc;
        }

        // if (skin_json_pc?.chatLayout == 2) {
        //   // 设置聊天组件为左右风格
        //   updatePageNode('comChat', 'component', 'VmpFashionChat');
        // }

        // 设置主题，如果没有就用传统风格白色
        const style = styleMap[skin_json_pc?.style || 1];
        const theme = themeMap[skin_json_pc?.backGroundColor || 1];

        console.log('------设置主题------', `theme_【${style}】_【${theme}】`, skin_json_pc);

        skins.setTheme(skins.themes[`theme_${style}_${theme}`]);
        this.drawBody(theme, skin_json_pc);
        // 挂载到window方便调试
        window.skins = skins;
      },
      drawBody(theme, skin) {
        if (skin?.pcBackground || skin?.background) {
          document.body.style.backgroundImage = `url(${skin?.pcBackground || skin?.background})`;
          const styleMap = imgPositionSizeMap[skin?.backgroundSize?.imageCropMode || 2];
          for (let key in styleMap) {
            document.body.style[key] = styleMap[key];
          }
        } else {
          if (theme == 'black') {
            document.body.style.background = `rgb(26, 26, 26)`;
          } else {
            document.body.style.backgroundImage = `url(${
              '//cnstatic01.e.vhall.com/common-static/middle/images/saas-watch/theme/skins/' +
              theme +
              '.png'
            })`;
            document.body.style.backgroundSize = 'cover';
          }
        }
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
