<template>
  <div class="vmp-wap-body">
    <!-- 播放器 -->
    <vmp-air-container
      :cuid="childrenComp[0]"
      :oneself="true"
      v-if="!isShowContainer"
    ></vmp-air-container>
    <!-- 流列表 -->
    <vmp-air-container :cuid="childrenComp[1]" :oneself="true"></vmp-air-container>
  </div>
</template>
<script>
  import { Dialog } from 'vant';
  export default {
    name: 'VmpWapBody',
    data() {
      return {
        childrenComp: []
      };
    },
    computed: {
      isShowContainer() {
        return (
          (this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar == 1 ||
            this.$domainStore.state.micServer.isSpeakOn) &&
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1
        );
      }
    },
    async created() {
      if (
        [3, 6].includes(this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode) &&
        this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1
      ) {
        await Dialog.alert({
          title: '提示',
          message: '本场直播支持视频连线，建议您允许系统启用相应设备以使用该功能。'
        });
      }
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    methods: {}
  };
</script>
