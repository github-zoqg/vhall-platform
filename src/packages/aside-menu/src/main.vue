<template>
  <div class="vmp-aside-menu">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>
<script>
  export default {
    name: 'VmpAsideMenu',
    methods: {
      switchTo(kind) {
        for (const vn of this.$children) {
          vn.setSelectedState(vn.kind === kind);
        }
      }
    }
  };
</script>
