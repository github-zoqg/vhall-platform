<template>
  <div id="app">
    <router-view />
  </div>
</template>
<style lang="less">
  @import url(./assets/styles/main.less);
  html,
  body {
    height: 100%;
    width: 100%;
    margin: 0 !important;
    padding: 0 !important;
  }
  #app {
    font-family: Arial, Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
  }
</style>
