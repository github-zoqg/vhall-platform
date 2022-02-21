<template>
  <div class="vmp-basic-center">
    <!-- 流列表 -->
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>

<script>
  export default {
    name: 'VmpBasicCenterContainer',
    data() {
      return {};
    }
  };
</script>

<style lang="less">
  .vmp-basic-center {
    display: flex;
    background-size: cover;
    flex-direction: column;
    background-color: #2d2d2d;
    width: calc(100% - 380px);
    border-radius: 4px;
  }
  .vmp-basic-center__mainscreen-pos {
    width: 100%;
    padding-top: 56.25%;
  }
</style>
