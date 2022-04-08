<template>
  <!-- <div></div> -->
  <VmpPcPlayerLiveYun v-if="initComplete"></VmpPcPlayerLiveYun>
</template>

<script>
  import roomState from '../../headless/room-state.js';
  import { Domain } from 'middle-domain';
  export default {
    data() {
      return {
        initComplete: false
      };
    },
    async created() {
      await this.init();
      await roomState();
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
          plugins: ['chat', 'player', 'doc', 'interaction', 'questionnaire'],
          requestHeaders: {
            token: localStorage.getItem('token') || ''
          },
          requestBody: {
            live_token: liveT
          },
          initRoom: {
            webinar_id: il_id, //活动id
            clientType: 'send', //客户端类型
            nickname,
            email,
            check_online: 0 // 不检查主持人是否在房间
          }
        });
      }
    }
  };
</script>

<style lang="scss"></style>
