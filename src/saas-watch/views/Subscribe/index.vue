<template>
  <div class="vmp-subscribe">
    <header-watch-pc></header-watch-pc>
  </div>
</template>
<script>
  import headerWatchPc from '@/packages/header-watch-pc';
  export default {
    name: 'vmpSubscribe',
    components: {
      headerWatchPc
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
  }
</style>
