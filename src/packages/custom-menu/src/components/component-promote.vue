<template>
  <section class="vmp-custom-menu-promote">
    <promote-list></promote-list>
  </section>
</template>

<script>
  import PromoteList from './promote-list.vue';
  export default {
    name: 'component-promote',
    components: { PromoteList },
    created() {}
  };
</script>

<style lang="less">
  .vmp-custom-menu-promote {
    .promote-list {
      padding: 20px 16px;
      height: 100%;
      width: 100%;
      overflow: auto;
      .promote-item {
        display: block;
        width: 100%;
        margin-bottom: 24px;
        font-size: 0;
        .cover-img {
          display: inline-block;
          width: 168px;
          height: 96px;
          font-size: 12px;
          border-radius: 4px;
          vertical-align: top;
          // border: solid 1px ;
        }
        .tip-info {
          display: inline-block;
          width: calc(100% - 168px);
          margin-top: 0;
          padding-left: 10px;
          font-size: 14px;
          vertical-align: top;
          .tip-title {
            overflow-wrap: break-word;
            max-height: 66px;
            line-height: 22px;
            display: block;
          }
          .tip-time {
            display: block;
            margin-top: 10px;
            color: #888;
          }
        }
      }
    }
  }
</style>
