<template>
  <!-- :class="{
      'vmp-basic-layout__noHeader': !showHeader,
      'vmp-basic-layout__hasBottom': showBottom
    }" -->
  <div class="vmp-basic-layout" style="position: fixed; top: 0; bottom: 0; left: 0; right: 0">
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="subcribeRoot"></vmp-air-container>
    </div>
    <msg-tip v-if="state == 2" :liveErrorTip="liveErrorTip"></msg-tip>
    <WeixinAuth ref="weixin_auth" />
  </div>
</template>
<script>
  import { Domain, useRoomBaseServer, useUserServer } from 'middle-domain';
  import subscribeState from '../../headless/subscribe-state.js';
  import { getQueryString } from '@/app-shared/utils/tool';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  import bindWeiXin from '../../headless/bindWeixin.js';
  import MsgTip from '../MsgTip.vue';
  import { logRoomInitFailed, generateWatchReportCommonParams } from '@/app-shared/utils/report';
  import skins from '@/app-shared/skins/wap';

  import WeixinAuth from '../weixinAuth.vue';
  export default {
    name: 'Subcribe',
    components: {
      MsgTip,
      WeixinAuth
    },
    data() {
      return {
        state: 0,
        liveErrorTip: '',
        showBottom: false // 是否显示顶部按钮
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
      },
      // 活动状态 直播/预约
      webinarStatus() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status;
      },
      // 预约按钮
      hide_subscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.hide_subscribe;
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
    async mounted() {
      this.initRoom();
    },
    methods: {
      async initRoom() {
        try {
          console.log('%c---初始化直播房间 开始', 'color:blue');
          // 初始化直播房间
          let clientType = 'standard';
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
          // 是否跳转预约页
          if (this.$domainStore.state.roomBaseServer.watchInitData.status == 'live') {
            // 如果往观看页跳转，需要清除暖场视频缓存
            window.sessionStorage.removeItem('warm_recordId');
            window.sessionStorage.removeItem('recordIds');
            this.goWatchPage(clientType);
            return;
          }
          await subscribeState();

          this.setPageConfig();

          bindWeiXin();
          console.log('%c---初始化直播房间 完成', 'color:blue');
          if (
            this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe' &&
            this.$domainStore.state.roomBaseServer.watchInitData.record.preview_paas_record_id
          ) {
            await roomBaseServer.getUnionConfig();
          }

          document.title = roomBaseServer.state.languages.curLang.subject;
          let lang = roomBaseServer.state.languages.lang;
          this.$i18n.locale = lang.type;
          // this.setBottom();
          // 初始化数据上报
          console.log('%c------服务初始化 initVhallReport 初始化完成', 'color:blue');
          // http://wiki.vhallops.com/pages/viewpage.action?pageId=23789619
          this.state = 1;
          // 获取缓存 判断是否需要进行授权
          this.$refs['weixin_auth'].getUnionid();
          // 观看端上报
          domain.initVhallReportForWatch({
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境，区分上报接口域名
            pf: 10 // 7：PC 10: wap
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
          console.error('---初始化直播房间出现异常2222222--');
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
      handleErrorCode(err) {
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
        } else if (err.code == 512534) {
          // 第三方k值校验失败 跳转指定地址
          window.location.href = err.data.url;
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
      goWatchPage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        location.replace(
          `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/watch/${this.$route.params.id}${window.location.search}`
        );
      },
      setBottom() {
        /**
         * 显示底部操作按钮 非嵌入方式并且 (预约状态下开启了显示预约按钮 或 直接结束)
         */
        if (
          !this.embedObj.embedVideo &&
          this.webinarStatus == 'subscribe' &&
          this.hide_subscribe == 1
        ) {
          this.showBottom = true;
        } else {
          this.showBottom = false;
        }
      },
      setPageConfig() {
        const styleMap = {
          1: 'main', // 传统风格
          2: 'fashion', // 时尚风格
          3: 'fashion' // 极简风格预约页使用时尚风格背景
        };

        const themeMap = {
          1: 'black',
          2: 'white',
          3: 'red',
          4: 'golden',
          5: 'blue'
        };

        let skin_json_wap = {
          style: 1,
          backGroundColor: 2
        };

        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }

        // 设置主题，如果没有就用传统风格白色
        const style = styleMap[skin_json_wap?.style || 1];
        const theme = themeMap[skin_json_wap?.backGroundColor || 2];

        console.log('----设置主题为----', `theme_${style}_${theme}`);

        skins.setTheme(skins.themes[`theme_main_${theme}`]);
        this.drawBody(style, theme);

        // 挂载到window方便调试
        window.skins = skins;
      },
      drawBody(style, theme) {
        if (style == 'main' && (theme == 'black' || theme == 'white')) {
          if (theme == 'black') {
            document.body.style.background = `#262626`;
          }
          if (theme == 'white') {
            document.body.style.background = `rgba(0, 0, 0, 0.06)`;
          }
        } else {
          document.body.style.backgroundImage = `url(${
            '//cnstatic01.e.vhall.com/common-static/middle/images/saas-wap/theme/skins/' +
            style +
            '_' +
            theme +
            '.png'
          })`;
          document.body.style.backgroundSize = 'cover';
        }
      }
    }
  };
</script>
