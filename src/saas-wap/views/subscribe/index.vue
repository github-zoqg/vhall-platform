<template>
  <div
    class="vmp-basic-layout"
    :class="{
      'vmp-basic-layout__noHeader': !showHeader,
      'vmp-basic-layout__hasBottom': showBottom
    }"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="subcribeRoot"></vmp-air-container>
    </div>
    <msg-tip v-if="state == 2" :liveErrorTip="liveErrorTip"></msg-tip>
  </div>
</template>
<script>
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import subscribeState from '../../headless/subscribe-state.js';
  import { getQueryString } from '@/packages/app-shared/utils/tool';
  import { getBrowserType } from '@/packages/app-shared/utils/getBrowserType.js';
  import bindWeiXin from '../../headless/bindWeixin.js';
  import MsgTip from '../MsgTip.vue';
  export default {
    name: 'Subcribe',
    components: {
      MsgTip
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
          await this.initReceiveLive(clientType);
          // 是否跳转预约页
          if (this.$domainStore.state.roomBaseServer.watchInitData.status == 'live') {
            this.goWatchPage(clientType);
            return;
          }
          await subscribeState();
          bindWeiXin();
          console.log('%c---初始化直播房间 完成', 'color:blue');

          document.title = roomBaseServer.state.languages.curLang.subject;
          let lang = roomBaseServer.state.languages.lang;
          this.$i18n.locale = lang.type;
          this.setBottom();
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
          }
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
          window.location.href = `${window.location.origin}/webinar/inituser/${this.$route.params.id}${currentQuery}`; // 跳转到老 saas
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
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/watch/${this.$route.params.id}${window.location.search}`;
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
      }
    }
  };
</script>
