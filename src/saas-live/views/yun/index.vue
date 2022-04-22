<template>
  <div class="vmp-yun-stream">
    <vmp-air-container cuid="liveStreamYunRoot" v-if="initComplete"></vmp-air-container>
  </div>
</template>

<script>
  import { Domain, useInteractiveServer, useRoomBaseServer, useMicServer } from 'middle-domain';
  export default {
    data() {
      return {
        initComplete: false
      };
    },
    async created() {
      const interactiveServer = useInteractiveServer();
      const domain = await this.init();
      await useMicServer().init();
      await interactiveServer.baseInit();
      domain.initVhallReport(
        {
          bu: 0,
          user_id: this.$domainStore.state.roomBaseServer.watchInitData.join_info.join_id,
          webinar_id: this.$route.params.id,
          t_start: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          os: 10,
          type: 4,
          entry_time: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          pf: 7,
          env: ['production', 'pre'].includes(process.env.NODE_ENV) ? 'production' : 'test'
        },
        {
          namespace: 'saas', //业务线
          env: 'test', // 环境
          method: 'post' // 上报方式
        }
      );
      this.initComplete = true;
      console.log('初始化');
    },
    methods: {
      init() {
        // 初始化直播房间
        const { il_id } = this.$route.params;
        console.log(this.$route.params, 'this.$route.params');
        const { token, nickname = '', email = '', liveT = '' } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        return new Domain({
          plugins: [/embed/.test(location.search) ? 'player' : 'interaction'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          requestBody: {
            live_token: liveT
          },
          initRoom: {
            webinar_id: il_id, //活动id
            seat_id: this.$route.query.seat_id,
            clientType: 'sendYun', //客户端类型
            nickname,
            email,
            check_online: 0 // 不检查主持人是否在房间
          }
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-yun-stream {
    height: 100%;
  }
</style>
