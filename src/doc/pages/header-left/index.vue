<template>
  <section>
    <h1>HEADER-LEFT</h1>
    <component :is="curComponent" />
  </section>
</template>

<script>
  import PageMixin from '../../mixins/page-mixin';

  export default {
    name: 'icon-text-page',
    mixins: [PageMixin]
  };
</script>

<style></style>
