<template>
  <section class="vmp-custom-menu-title">
    <div class="vmp-custom-menu-title__content">{{ info.title }}</div>
  </section>
</template>

<script>
  export default {
    name: 'component-title',
    props: {
      info: {
        require: false
      }
    }
  };
</script>

<style lang="less">
  .vmp-custom-menu-title {
    margin-bottom: 16px;

    &__content {
      margin: 20px 0px;
      font-size: 14px;
      font-weight: 400;
      color: var(--theme-tab-content-title-font);
      line-height: 22px;
      text-align: center;
      padding: 0px 24px;
    }
  }
</style>
