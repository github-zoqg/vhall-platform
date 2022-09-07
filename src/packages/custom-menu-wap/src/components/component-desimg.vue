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
    color: var(--theme-tab-content-word-font);
    overflow-x: hidden;
    img {
      width: 100%;
      /* pointer-events: none; */
    }
    strong {
      font-weight: bold !important;
    }
  }
</style>
