<template>
  <h1>pc端播放器组件</h1>
</template>
<script>
  import { usePlayerServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpPcPlayer',
    data() {
      return {};
    },
    beforeCreate() {
      this.playerServer = usePlayerServer();
    },
    created() {
      this.playerServer.getPlayerConfig();
    },
    mounted() {
      this.initConfig();
    },
    methods: {
      // 初始化配置
      initConfig() {}
    }
  };
</script>
<style lang="less"></style>
