<template>
  <div class="vmp-cash-wap" v-if="visible"></div>
</template>

<script>
  export default {
    name: 'VmpCashWap',
    data() {
      return {
        visible: false
      };
    },
    methods: {
      openCashWap() {
        this.visible = true;
      }
    }
  };
</script>

//
<style lang="less">
  .vmp-cash-wap {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: red;
    z-index: 9999;
  }
</style>
