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
  import { Domain, useRoomBaseServer, useUserServer } from 'middle-domain';
  import subscribeState from '../../headless/subscribe-state.js';
  import { getQueryString } from '@/app-shared/utils/tool';
  import { imgPositionSizeMap } from '@/app-shared/utils/imgModeMap.js';
  import authCheck from '../../mixins/chechAuth';
  import ErrorPage from '../ErrorPage';
  import { logRoomInitFailed, generateWatchReportCommonParams } from '@/app-shared/utils/report';
  import skins from '@/app-shared/skins/watch';
  import { updatePageNode } from '@/app-shared/utils/pageConfigUtil';
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
    computed: {
      // 是否为嵌入页
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      }
    },
    components: {
      ErrorPage
    },
    mixins: [authCheck],
    async created() {
      await this.initRoom();
    },
    mounted() {
      const roomBaseServer = useRoomBaseServer();
      roomBaseServer.$on('VIEW_RESTRICTION_ERROR_PAGE', () => {
        this.state = 2;
        this.errorData.errorPageTitle = 'view_restriction';
      });
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
          await subscribeState();
          if (this.clientType != 'embed') {
            await this.initCheckAuth('subscribe'); // 必须先setToken (绑定qq,wechat)
          }
          document.title = roomBaseServer.state.languages.curLang.subject;
          let lang = roomBaseServer.state.languages.lang;
          this.$i18n.locale = lang.type;

          this.setPageConfig();

          console.log('%c---初始化直播房间 完成', 'color:blue');
          this.state = 1;
          // 是否跳转观看页
          if (
            this.$domainStore.state.roomBaseServer.watchInitData.status == 'live' ||
            (this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe' &&
              this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id)
          ) {
            // 如果往观看页跳转，需要清除暖场视频缓存
            window.sessionStorage.removeItem('warm_recordId');
            window.sessionStorage.removeItem('recordIds');
            this.goWatchPage(this.clientType);
          }
          // 观看端上报
          domain.initVhallReportForWatch({
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境，区分上报接口域名
            pf: 7 // 7：PC 10: wap
          });
          const commonReportForProductParams = generateWatchReportCommonParams(
            roomBaseServer.state.watchInitData,
            new useUserServer().state.userInfo,
            this.$route.query.shareId || this.$route.query.share_id
          );
          window.vhallReportForWatch?.injectCommonParams(commonReportForProductParams);
        } catch (err) {
          //上报日志
          logRoomInitFailed({ error: err });
          console.error('---初始化直播房间出现异常--', err);
          if (![512534, 512502, 512503, 511007, 511006].includes(Number(err.code))) {
            this.state = 2;
          }
          this.handleErrorCode(err);
        }
      },
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
      goWatchPage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/watch/${this.$route.params.id}${window.location.search}`;
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
      setPageConfig() {
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
          skin_json_pc = JSON.parse(skinInfo.skin_json_pc);
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
        if (skin?.pcBackground) {
          document.body.style.backgroundImage = `url(${skin?.pcBackground})`;
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
  .vmp-subscribe-container {
    height: 100vh;
    .vmp-basic-container {
      width: 100%;
      height: 100%;
      // background: #1a1a1a;
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
