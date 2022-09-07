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
      font-size: 28px;
      font-weight: 400;
      text-align: left;
      padding: 0px 24px;
      padding-left: 20px;
      line-height: 1.2;
      border-left: 2px solid #fb3a32;
      color: var(--theme-tab-content-title-font);
      font-weight: 500;
    }
  }
</style>
