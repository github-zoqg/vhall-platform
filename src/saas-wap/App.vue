<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style lang="less">
  .el-scrollbar .el-scrollbar__bar {
    // 为了解决ios兼容性问题，下拉框选择时，需要点击两次才能选中
    opacity: 1 !important;
  }
</style>
