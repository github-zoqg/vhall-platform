<template>
  <div
    class="vmp-basic-layout"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
    </div>
    <MsgTip v-else-if="state === 2" :text="errMsg"></MsgTip>
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import roomState from '../headless/room-state.js';
  import MsgTip from './MsgTip';
  import Chrome from './Chrome';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { getBrowserType, browserSupport } from '@/app-shared/utils/getBrowserType.js';
  import { logRoomInitFailed } from '@/app-shared/utils/report';
  import { bu_appId } from '@/app-shared/global-data/businessData';

  import {
    Domain,
    useRoomBaseServer,
    useSplitScreenServer,
    useInteractiveServer,
    useMicServer
  } from 'middle-domain';
  import skins from '@/app-shared/skins/watch';
  export default {
    name: 'Home',
    components: {
      MsgTip,
      Chrome
    },
    data() {
      return {
        state: 0, // 当前状态： 0:loading; 1：直播房间初始化成功； 2：初始化失败；3：浏览器不支持
        errMsg: ''
      };
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 检查浏览器版本
        if (!browserSupport()) {
          this.state = 3;
          return;
        }
        // 初始化直播房间
        const domain = await this.initSendLive();
        const roomBaseServer = useRoomBaseServer();
        const watchInitData = roomBaseServer.state.watchInitData;
        // roomBaseServer.startGetDegradationInterval({
        //   staticDomain: process.env.VUE_APP_DEGRADE_STATIC_DOMAIN,
        //   environment: process.env.VUE_APP_SAAS_ENV != 'production' ? 'test' : 'product',
        //   systemKey: 2
        // });
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
          env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV) ? 'production' : 'test'
        });
        // 产品侧数据埋点初始化（只有发起端用）
        domain.initVhallReportForProduct({
          env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV) ? 'production' : 'test', // 环境，区分上报接口域名
          app_id: process.env.VUE_APP_SAAS_ENV_DESC
            ? bu_appId[process.env.VUE_APP_SAAS_ENV_DESC]
            : bu_appId[process.env.VUE_APP_SAAS_ENV], // 产品 app id
          pf: 7, // 客户端类型  web 网页端用 8
          business_uid: watchInitData.join_info.third_party_user_id, // B端客户 id
          user_id: watchInitData.join_info.third_party_user_id, // C端用户 id（如果是B端用当前用户id）
          webinar_id: watchInitData.webinar.id, // 活动 id
          webinar_type: watchInitData.webinar.mode, // 直播类型
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          role_name: watchInitData.join_info.role_name, //用户类型
          ua: getBrowserType() // 浏览器信息
        });
        window.vhallReport.report('ENTER_WATCH');
        await roomState();

        this.setPageConfig();
        // 使用活动的标题作为浏览器title显示, 由于发起端不用翻译所以直接用活动下的, 如果后期要翻译需要, 通过翻译里取
        document.title = watchInitData.webinar.subject;

        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
        this.addEventListener();
      } catch (err) {
        //上报日志
        logRoomInitFailed({ isSend: true, error: err });
        console.error('---初始化直播房间出现异常--');
        console.error(err);
        if (err.code == 510008) {
          // 未登录
          location.href = `${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_WEB_KEY}/login?${location.search}`;
        }
        this.state = 2;
        this.errMsg = err.msg;
      }
    },
    methods: {
      // 初始化直播房间
      initSendLive() {
        const { id } = this.$route.params;
        const { token, nickname = '', email = '', liveT = '', live_token = '' } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          requestBody: {
            live_token: liveT || live_token
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'send', //客户端类型
            nickname,
            email,
            check_online: 1, // 检查主持人是否在房间.
            visitor_id: sessionStorage.getItem('visitorId_home') || ''
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
      addEventListener() {
        const roomBaseServer = useRoomBaseServer();
        const splitScreenServer = useSplitScreenServer();
        const micServer = useMicServer();
        const interactiveServer = useInteractiveServer();
        roomBaseServer.$on('ROOM_KICKOUT', () => {
          this.handleKickout();
        });
        // 第三方推流改变背景图片
        roomBaseServer.$on('LIVE_START', () => {
          this.changePushImage();
        });
        // 关闭分屏模式
        splitScreenServer.$on('SPLIT_SHADOW_DISCONNECT', async () => {
          // 还原流信息
          micServer.state.speakerList = micServer.state.speakerList.map(element => ({
            ...element,
            streamId: ''
          }));
          await interactiveServer.init();
          window.$middleEventSdk?.event?.send(boxEventOpitons('layerRoot', 'checkStartPush'));
          this.$message('分屏已关闭');
        });
        // 分屏页面关闭
        splitScreenServer.$on('SPLIT_SHADOW_CLOSE', async () => {
          this.$message('正在与分屏页面建立连接，请稍等...');
        });
        splitScreenServer.$on('SPLIT_CUSTOM_MESSAGE', msg => {
          // 分屏停止推流完成的消息
          if (msg.data.body.type == 'split_unpublish_complete') {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons('comStreamLocal', 'emitClickUnpublishComplate')
            );
          }
        });
      },
      handleKickout() {
        this.state = 2;
        this.errMsg = this.$t('message.message_1007');
      },
      changePushImage() {
        const thirdBackground = document.querySelector('.vmp-basic-right__hd');
        thirdBackground.style.background = `url(${process.env.VUE_APP_STATIC_BASE}/common-static/images/thirdDefault.png) no-repeat`;
        thirdBackground.style.backgroundSize = '100% 100%';
        thirdBackground.style.backgroundPosition = 'center';
      },
      setPageConfig() {
        const style = 'default';
        const theme = 'black';

        console.log('------设置主题------', `theme_【${style}】_【${theme}】`);

        skins.setTheme(skins.themes[`theme_${style}_${theme}`]);
        this.drawBody(theme);
        // 挂载到window方便调试
        window.skins = skins;
      },
      drawBody(theme) {
        document.body.style.background = `rgb(26, 26, 26)`;
      }
    }
  };
</script>
