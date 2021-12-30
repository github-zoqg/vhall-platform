<template>
  <div id="app">
    <section class="vh-layout">
      <section class="vh-left">
        <VhDocMenu />
      </section>
      <section class="vh-page">
        <router-view />
      </section>
    </section>
  </div>
</template>

<script>
  import VhDocMenu from './components/menu.vue';

  export default {
    name: 'app',
    components: { VhDocMenu }
  };
</script>

<style lang="less" scoped>
  .vh-layout {
    display: flex;

    .vh-page {
      flex: 1;
      padding: 2em;
    }
  }
</style>
