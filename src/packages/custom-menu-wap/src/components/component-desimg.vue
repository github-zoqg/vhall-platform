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
      }
    }
  };
</script>

<style lang="less">
  .vmp-custom-menu-desimg {
    font-size: 28px;
    line-height: 40px;
    font-weight: 400;
    color: #1a1a1a;
    overflow-x: hidden;
    img {
      width: 100%;
      // pointer-events: none;
    }
  }
</style>
