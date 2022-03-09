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
    font-size: 14px;
    font-weight: 400;
    color: #1a1a1a;
    line-height: 22px;
    overflow-x: hidden;
    img {
      width: 100%;
    }
  }
</style>
