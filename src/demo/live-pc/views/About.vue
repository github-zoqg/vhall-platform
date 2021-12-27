<template>
  <div class="about">
    <h1>This is an about page</h1>
    <el-input></el-input>
    {{ date }}
  </div>
</template>

<script>
  export default {
    computed: {
      date() {
        return this.$moment().format('MMMM Do YYYY, h:mm:ss a');
      }
    }
  };
</script>

<style lang="less">
  @import url(../assets/styles/main.less);
  h1 {
    font-size: @font_size_30;
  }
</style>
