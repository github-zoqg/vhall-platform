<template>
  <div class="vmp-yun-stream">
    <vmp-air-container cuid="liveStreamYunRoot" v-if="initComplete"></vmp-air-container>
  </div>
</template>

<script>
  import { Domain, useInteractiveServer } from 'middle-domain';
  import grayInit from '@/packages/app-shared/gray-init';
  export default {
    data() {
      return {
        initComplete: false
      };
    },
    async created() {
      const interactiveServer = useInteractiveServer();
      console.log(this.$route, 'this.$route.params');

      // await grayInit(this.$route);
      const domain = await this.init();
      !/embed/.test(location.search) && (await interactiveServer.baseInit());
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
        const { id } = this.$route.params;
        console.log(this.$route, 'this.$route.params');
        const {
          token,
          nickname = '',
          email = '',
          liveT = '',
          seat_id,
          assistant_token,
          token_type
        } = this.$route.query;
        if (token) {
          localStorage.setItem('token', token);
        }
        if (location.search.includes('assistant_token=')) {
          sessionStorage.setItem('vhall_client_token', assistant_token);
        }
        return new Domain({
          plugins: [/embed/.test(location.search) ? 'player' : 'interaction'],
          requestHeaders: {
            token:
              // 嵌入页主持人
              /embed/.test(location.search) && token_type == 0
                ? assistant_token
                : localStorage.getItem('token')
          },
          requestBody: {
            live_token: /embed/.test(location.search) && token_type != 0 ? assistant_token : liveT
          },
          initRoom: {
            webinar_id: id, //活动id
            seat_id: seat_id,
            clientType: /embed/.test(location.search) ? 'send' : 'sendYun', //客户端类型
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
