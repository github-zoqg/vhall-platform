<template>
  <div class="vmp-wap-body">
    <!-- 播放器 -->
    <vmp-air-container
      :cuid="childrenComp[0]"
      :oneself="true"
      v-if="!isShowContainer"
    ></vmp-air-container>
    <!-- 流列表 -->
    <vmp-air-container
      :cuid="childrenComp[1]"
      :oneself="true"
      v-if="isShowContainer"
    ></vmp-air-container>
  </div>
</template>
<script>
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
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode == 6 ||
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar == 1
        );
      }
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    methods: {}
  };
</script>
