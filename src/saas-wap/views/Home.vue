<template>
  <div class="vmp-basic-layout" :class="{ 'vmp-basic-layout__noHeader': !showHeader }">
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
  import { Domain, useRoomBaseServer, useInviteServer } from 'middle-domain';
  import roomState from '../headless/room-state.js';
  import { getVhallReportOs, browserType, replaceHtml } from '@/packages/app-shared/utils/tool';
  import { initWeChatSdk, initHideChatSdk } from '@/packages/app-shared/utils/wechat';
  import MsgTip from './MsgTip.vue';

  export default {
    name: 'Home',
    components: {
      MsgTip
    },
    data() {
      return {
        state: 0,
        // 分享信息
        shareInfo: {
          title: '',
          img_url: '',
          introduction: ''
        },
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
    beforeCreate() {
      this.inviteServer = useInviteServer();
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        let clientType = 'standard';
        if (location.pathname.indexOf('embedclient') != -1) {
          clientType = 'embed';
        }
        const domain = await this.initReceiveLive(clientType);
        await roomState();
        console.log('%c---初始化直播房间 完成', 'color:blue');

        const roomBaseServer = useRoomBaseServer();
        const roomBaseState = roomBaseServer.state;
        document.title = roomBaseState.languages.curLang.subject;
        let lang = roomBaseServer.state.languages.lang;
        this.$i18n.locale = lang.type;

        // 是否绑定邀请卡信息
        const open_id = sessionStorage.getItem('open_id');
        const isWechatBrowser = browserType();
        const isEmbed = clientType === 'embed';
        const hasInviteCode = this.$route.query.invite;
        if (isWechatBrowser && !isEmbed && open_id && roomBaseState.watchInitData.join_info) {
          if (hasInviteCode) {
            await this.bindInvite(this.$route.query.invite);
          } else {
            await this.getShareSettingInfo();
          }
        }

        if (this.$domainStore.state.roomBaseServer.watchInitData.status == 'subscribe') {
          // 是否跳转预约页
          this.goSubscribePage(clientType);
          return;
        }
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
            token: localStorage.getItem('token') || '',
            'gray-id': sessionStorage.getItem('initGrayId')
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: clientType //客户端类型
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
          this.liveErrorTip = this.$tec(err.code) || err.msg || err.message;
        }
      },
      goSubscribePage(clientType) {
        let pageUrl = '';
        if (clientType === 'embed') {
          pageUrl = '/embedclient';
        }
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives${pageUrl}/subscribe/${this.$route.params.id}${window.location.search}`;
      },
      /**
       * 绑定邀请卡关系(上报邀请成功数据)
       * @param {String} code 邀请码
       */
      async bindInvite(code = '') {
        return this.inviteServer.bindInvite({
          webinar_id: this.$route.params.id,
          invite: code
        });
      },
      /**
       * 微信分享信息
       */
      getShareSettingInfo() {
        const roomBaseServer = useRoomBaseServer();
        return roomBaseServer.getShareSettingInfo().then(res => {
          if (res.code === 200) {
            let title = res.data.title;
            title = title.length - 30 > 0 ? title.substring(0, 30) : title;
            this.shareInfo = {
              title: title,
              img_url: res.data.img_url,
              introduction: replaceHtml(res.data.introduction)
            };
            this.wxShareInfo();
          }
        });
      },
      wxShareInfo() {
        const roomBaseServer = useRoomBaseServer();
        const configList = roomBaseServer.state.configList;
        const address = location.href.split('#')[0];
        return roomBaseServer.wechatShare({ wx_url: address }).then(res => {
          if (res.code == 200 && res.data) {
            const hideShare = configList ? configList['ui.watch_hide_share'] : 0;
            const params = {
              appId: res.data.appId,
              timestamp: res.data.timestamp,
              nonceStr: res.data.nonceStr,
              signature: res.data.signature
            };
            const defaultImg =
              'https://t-alistatic01.e.vhall.com/upload/sys/img_url/11/a9/11a95389258d3eed866fa4c0f189b199.jpg';
            if (hideShare == 1) {
              initHideChatSdk({ ...params });
            } else {
              initWeChatSdk(
                { ...params },
                {
                  title: this.shareInfo.title,
                  desc: this.shareInfo.introduction,
                  link: address,
                  imgUrl: this.shareInfo.img_url || defaultImg
                }
              );
            }
          }
        });
      }
    }
  };
</script>
