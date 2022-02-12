<template>
  <div id="app" :class="skinName">
    <router-view />
  </div>
</template>
<script>
  export default {
    name: 'App',
    computed: {
      skinName() {
        return window.$globalConfig.currentSkin;
      }
    }
  };
</script>
