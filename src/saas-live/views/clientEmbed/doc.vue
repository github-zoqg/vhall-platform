<template>
  <div
    class="vmp-client-doc"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="docClientRoot"></vmp-air-container>
    </div>
    <tip v-else-if="state === 2" :text="errMsg"></tip>
    <Chrome v-else-if="state === 3"></Chrome>
  </div>
</template>

<script>
  import clientDocState from '../../headless/client/client-doc-state';
  import { browserSupport } from '@/app-shared/utils/getBrowserType.js';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import chrome from '../Chrome.vue';
  import tip from '../MsgTip.vue';
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import skins from '@/app-shared/skins/watch';
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
          env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV) ? 'production' : 'test'
        });
        console.log(domain);
        await clientDocState();
        this.setPageConfig();
        this.initAssistantMsg();
        this.state = 1;
      } catch (err) {
        this.state = 2;
        this.errMsg = err.msg;
        console.error(err);
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
          plugins: ['chat', 'player', 'doc'],
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
            env: ['production', 'pre'].includes(process.env.VUE_APP_SAAS_ENV)
              ? 'production'
              : 'test', // 环境
            method: 'post' // 上报方式
          }
        });
      },
      initAssistantMsg() {
        window.addEventListener('keydown', e => {
          if (e.keyCode == 27) {
            window.JsCallQtMsg(JSON.stringify({ type: 'esc', msg: true }));
          }
        });
        window.QtCallFunctionPage = _msg => {
          let msg = Number(_msg);
          console.error('展示当前点击的消息转换-------', _msg);
          // 判断执行对应方法
          this.handleAssitant(msg);
        };
        // 切换大小窗，显示/隐藏文档工具栏
        window.QtCallJsChangeDocTool = _msg => {
          const msg = Number(_msg);
          this.handleDoc(msg);
        };
        // 踢出用户回调
        window.QtCallJsKickOut = (msg, bool) => {
          // this.$refs.vhallClient.handleAssitantKickout(msg.msg, bool);
        };
        // 文档区域获取焦点
        window.QtCallDocFocus = msg => {
          // this.$refs.vhallClient.handleAssitantDocFocus(msg);
        };
      },
      handleAssitant(type) {
        console.log('客户端调用h5', type);
        switch (type) {
          case 1: // 文档
            window.$middleEventSdk?.event?.send(
              boxEventOpitons('docClientRoot', 'emiSwitchTo', ['document'])
            );
            break;
          case 2: // 白板
            window.$middleEventSdk?.event?.send(
              boxEventOpitons('docClientRoot', 'emiSwitchTo', ['board'])
            );
            break;
          case 9: // 文档最小化
            window.$middleEventSdk?.event?.send(
              boxEventOpitons('docClientRoot', 'emitFullScreen', ['normal'])
            );
            break;
          // case 13: // 退出全屏
          //   break;
          // case 14: // 全屏
          //   break;
        }
      },
      handleDoc(type) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons('docClientRoot', 'emitFullScreen', [type == 0 ? 'mini' : 'normal'])
        );
      },
      setPageConfig() {
        const style = 'default';
        const theme = 'black';
        skins.setTheme(skins.themes[`theme_${style}_${theme}`]);
        document.body.style.background = `rgb(26, 26, 26)`;
      }
    }
  };
</script>

<style lang="less">
  .vmp-client-doc {
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
