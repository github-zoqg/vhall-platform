<template>
  <div
    class="vmp-basic-layout"
    v-loading="state === 0"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <div class="vmp-basic-container" v-if="state === 1">
      <vmp-air-container cuid="layerRoot"></vmp-air-container>
      <!-- <div>wap观看端</div> -->
    </div>
  </div>
</template>

<script>
  import { Domain, useRoomBaseServer } from 'middle-domain';
  import roomState from '../headless/room-state.js';
  import { getVhallReportOs } from '@/packages/app-shared/utils/tool';

  export default {
    name: 'Home',
    data() {
      return {
        state: 0
      };
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        const domain = await this.initReceiveLive();
        await roomState();
        console.log('%c---初始化直播房间 完成', 'color:blue');

        const roomBaseServer = useRoomBaseServer();

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
      } catch (ex) {
        console.error('---初始化直播房间出现异常--');
        console.error(ex);
        // this.state = 2;
        // this.errMsg = ex.msg;
      }
    },
    mounted() {
      // 派发推流事件
      // setTimeout(() => {
      //   window.$middleEventSdk?.event?.send({
      //     cuid: 'comStreamLocal',
      //     method: 'startPush'
      //   });
      // }, 3000);
    },
    methods: {
      initReceiveLive() {
        const { id } = this.$route.params;
        const { token } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction', 'report'],
          requestHeaders: {
            token: token || localStorage.getItem('token')
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'standard' //客户端类型
          }
        });
      }
    }
  };
</script>
<style lang="less">
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
