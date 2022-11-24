<template>
  <header class="rank-title">
    {{ title }}
  </header>
</template>
<script>
  export default {
    name: 'RankTitleWap',
    props: {
      title: {
        type: String,
        default() {
          return '';
        }
      }
    }
  };
</script>
<style lang="less">
  .rank-title {
    display: block;
    height: 116px;
    box-sizing: border-box;
    padding: 36px 32px 40px 32px;
    font-weight: 500;
    font-size: 28px;
    line-height: 40px;
    color: #262626;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: inline-block;
  }
</style>
