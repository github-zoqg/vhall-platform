<template>
  <section class="vmp-custom-menu-line">
    <div class="line"></div>
  </section>
</template>

<script>
  export default {
    name: 'component-line'
  };
</script>

<style lang="less">
  .vmp-custom-menu-line {
    width: 100%;
    height: 2px;
    margin-bottom: 16px;
    padding: 0 24px;
    box-sizing: border-box;
    .line {
      width: 100%;
      border: 1px dashed var(--theme-tab-content-split-bg);
    }
  }
</style>
