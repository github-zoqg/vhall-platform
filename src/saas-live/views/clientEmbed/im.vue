<template>
  <div
    class="vmp-client-im"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="imClientRoot"></vmp-air-container>
    </div>
    <tip v-else-if="state === 2" :text="errMsg"></tip>
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import clientImState from '../../headless/client/client-im-state';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { browserSupport } from '@/app-shared/utils/getBrowserType.js';
  import chrome from '../Chrome.vue';
  import tip from '../MsgTip.vue';
  import { Domain, useRoomBaseServer } from 'middle-domain';
  export default {
    components: {
      chrome,
      tip
    },
    data() {
      return {
        downloadChrome: !browserSupport(),
        errMsg: '', // info接口返回的错误信息
        state: 0
      };
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
          env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test'
        });
        console.log(domain);
        await clientImState();
        this.initAssistantMsg();
        this.state = 1;
      } catch (err) {
        this.state = 2;
        this.errMsg = err.msg;
        console.error(err);
      }
    },
    methods: {
      initAssistantMsg() {
        window.QtCallFunctionPage = _msg => {
          let msg = Number(_msg);
          console.error('展示当前点击的消息转换-------', _msg);
          // 判断执行对应方法
          this.handleAssitant(msg);
        };
        // 踢出用户回调
        window.QtCallJsKickOut = (data, type) => {
          console.log('客户端确认踢出回调', 'color:green');
          window.$middleEventSdk?.event?.send(
            boxEventOpitons('imClientRoot', 'emitKickout', { data: data.msg, type })
          );
        };
      },
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
          plugins: ['chat'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          requestBody: {
            live_token: liveT || live_token
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'clientEmbed',
            check_online: 0, // 不检查主持人是否在房间
            nickname,
            email
          },
          // 日志上报的参数
          devLogOptions: {
            namespace: 'saas', //业务线
            env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test', // 环境
            method: 'post' // 上报方式
          }
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-client-im {
    width: 100%;
    height: 100%;
    ::-webkit-scrollbar-thumb {
      /*滚动条里面小方块*/
      background: #666;
    }
    .vmp-basic-container {
      width: 100%;
      height: 100%;
    }
  }
</style>
