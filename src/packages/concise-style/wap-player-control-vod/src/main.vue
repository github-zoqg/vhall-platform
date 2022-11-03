<template>
  <div class="vmp-player-control-vod-wap"></div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';

  export default {
    name: 'VmpPlayerControlVodWap',
    components: {},
    data() {
      return {
        lang: {},
        languageList: []
      };
    },
    computed: {
      noDelayWebinar() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar === 1;
      }
    },
    watch: {},
    created() {},
    methods: {
      // 播放
      play() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitPlayerPlay'));
      }
    }
  };
</script>

<style lang="less">
  .vmp-player-control-vod-wap {
  }
</style>
