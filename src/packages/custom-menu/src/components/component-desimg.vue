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
    min-height: 30px;
    font-size: 14px;
    font-weight: 400;
    color: var(--theme-tab-content-word-font);
    overflow: hidden;
    padding: 0 24px;
    box-sizing: border-box;
    text-align: left;

    img {
      display: block;
      max-width: 100%;
      margin: 0px auto;
      /* pointer-events: none; */
    }

    p {
      margin: 4px 0px;
      word-break: break-all;
      span {
        display: block;
        width: 100%;
        word-break: break-all;
      }
    }
  }
</style>
