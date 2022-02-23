<template>
  <div class="vmp-subscribe" v-if="state">
    <vmp-air-container cuid="layerSubscribeRoot"></vmp-air-container>
  </div>
</template>
<script>
  import { Domain } from 'middle-domain';
  import subscribeState from '../../headless/subscribe-state.js';
  export default {
    name: 'vmpSubscribe',
    data() {
      return {
        state: 0
      };
    },
    async created() {
      try {
        console.log('%c---初始化直播房间 开始', 'color:blue');
        // 初始化直播房间
        await this.initReceiveLive();
        await subscribeState();
        console.log('%c---初始化直播房间 完成', 'color:blue');
        this.state = 1;
        // 是否跳转观看页
        if (this.$domainStore.state.roomBaseServer.watchInitData.status == 'live') {
          this.goWatchPage();
        }
      } catch (ex) {
        console.error('---初始化直播房间出现异常--');
        console.error(ex);
      }
    },
    methods: {
      initReceiveLive() {
        const { id } = this.$route.params;
        return new Domain({
          plugins: ['chat', 'player', 'doc', 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          initRoom: {
            webinar_id: id, //活动id
            clientType: 'standard' //客户端类型
          }
        });
      },
      goWatchPage() {
        window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.$route.params.id}${window.location.search}`;
      }
    }
  };
</script>
<style lang="less">
  .vmp-subscribe {
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
      '微软雅黑', Arial, sans-serif;
    .vmp-basic-bd {
      width: 100%;
      height: 100%;
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
