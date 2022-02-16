<template>
  <div class="vmp-wap-modal-input" ref="wapModalInput" contentditable="true" @keyup="doInput"></div>
</template>
<script>
  export default {
    name: 'VmpWapModalInput',
    data() {
      return {};
    },
    mounted() {
      this.$refs.wapModalInput.click();
    },

    methods: {
      doInput(e) {
        console.log(e.target);
      }
    }
  };
</script>
<style lang="less">
  .vmp-wap-modal-input {
    width: 100%;
    height: 100%;
    user-select: text;
    -webkit-user-select: text;
    -webkit-touch-callout: none;
  }
</style>
