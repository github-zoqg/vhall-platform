<template>
  <section class="vmp-custom-menu-desimg">
    <div v-html="info.content"></div>
  </section>
</template>

<script>
  export default {
    name: 'component-desimg',
    props: {
      info: {
        required: false
      },
      pagetype: {
        type: String,
        default: 'watch'
      }
    }
  };
</script>

<style lang="less">
  .vmp-custom-menu-desimg {
    min-height: 30px;
    font-size: 14px;
    font-weight: 400;
    color: @font-dark-normal;
    overflow: hidden;
    padding: 0 24px;
    box-sizing: border-box;
    text-align: left;
  }
</style>
