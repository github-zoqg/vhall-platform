<template>
  <div>
    <vmp-wap-sign-up-form></vmp-wap-sign-up-form>
  </div>
</template>

<script>
  export default {
    created() {
      if (localStorage.getItem('lang')) {
        this.$i18n.locale = parseInt(localStorage.getItem('lang')) == 1 ? 'zh' : 'en';
      } else {
        this.$i18n.locale = 'zh';
      }
    }
  };
</script>

<style lang="less" scoped></style>
