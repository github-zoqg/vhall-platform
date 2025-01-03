<template>
  <div
    class="vmp-video-polling-wrap"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <vmp-air-container v-if="state === 1" cuid="videoPollingRoot"></vmp-air-container>
    <MsgTip v-else-if="state === 2" :text="errMsg"></MsgTip>
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import videoPollingState from '../../headless/video-polling-state';
  import { logRoomInitFailed } from '@/app-shared/utils/report';
  import MsgTip from '../MsgTip';
  import Chrome from '../Chrome';
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import { bu_appId } from '@/app-shared/global-data/businessData';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  export default {
    data() {
      return {
        state: 0,
        errMsg: ''
      };
    },
    components: {
      MsgTip,
      Chrome
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        const domain = await this.initSendLive();
        const roomBaseServer = useRoomBaseServer();
        const watchInitData = roomBaseServer.state.watchInitData;

        domain.initVhallReport({
          bu: 0,
          user_id: watchInitData.join_info.join_id,
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
        // 使用活动的标题作为浏览器title显示, 由于发起端不用翻译所以直接用活动下的, 如果后期要翻译需要, 通过翻译里取
        document.title = watchInitData.webinar.subject;

        const res = await videoPollingState();
        // 如果浏览器不支持
        if (res === 'isBrowserNotSupport') {
          this.state = 3;
          return;
        }
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
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
        let {
          token,
          nickname = '',
          email = '',
          liveT = '',
          live_token = '',
          token_type = '',
          assistant_token = ''
        } = this.$route.query;
        if (token_type === '1' && !liveT && assistant_token) {
          liveT = assistant_token;
        }
        if (token_type === '0' && !token && assistant_token) {
          token = assistant_token;
        }
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          requestBody: {
            live_token: liveT || live_token
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'send',
            check_online: 0, // 不检查主持人是否在房间
            nickname,
            email
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
      }
    }
  };
</script>

<style lang="less">
  .vmp-video-polling-wrap {
    width: 100%;
    height: 100%;
    ::-webkit-scrollbar-thumb {
      /*滚动条里面小方块*/
      background: #666;
    }
  }
</style>
