<template>
  <div :class="className">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>
<script>
  export default {
    name: 'VmpWapBodyCenter',
    computed: {
      className() {
        return /embed/.test(location.pathname) ? 'tab-content-embed' : 'tab-content';
      }
    }
  };
</script>
