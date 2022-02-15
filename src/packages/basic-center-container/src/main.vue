<template>
  <div class="vmp-basic-center">
    <!-- 流列表 -->
    <!-- <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container> -->
    <!-- 主区域占位 -->
    <div class="vmp-basic-center__mainscreen-pos"></div>
    <!-- 播放器 -->
    <!-- <vmp-air-container :cuid="childrenComp[1]" :oneself="true"></vmp-air-container> -->
    <!-- 文档 -->
    <vmp-air-container :cuid="childrenComp[4]" :oneself="true"></vmp-air-container>
    <!-- 侧边菜单 -->
    <vmp-air-container :cuid="childrenComp[5]" :oneself="true"></vmp-air-container>
    <!-- 桌面共享 -->
    <!-- 插播 -->
    <!-- 底部控制栏 -->
    <vmp-air-container :cuid="childrenComp[2]" :oneself="true"></vmp-air-container>
    <!-- 滚动的公告 -->
    <!-- <vmp-air-container :cuid="childrenComp[3]" :oneself="true"></vmp-air-container> -->
  </div>
</template>

<script>
  export default {
    name: 'VmpBasicCenterContainer',
    data() {
      return {
        childrenComp: []
      };
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {},
    methods: {}
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
