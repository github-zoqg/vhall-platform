<template>
  <div class="vmp-basic-center" :class="`vmp-basic-center__mini-${miniElement}`">
    <!-- 流列表 -->
    <!-- <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container> -->
    <!-- 主区域占位 -->
    <!-- <div class="vmp-basic-center__mainscreen-pos"></div> -->
    <!-- 播放器 -->
    <!-- 文档 -->
    <!-- <vmp-air-container :cuid="childrenComp[1]" :oneself="true"></vmp-air-container> -->
    <!-- 桌面共享 -->
    <!-- 插播 -->
    <vmp-air-container :cuid="childrenComp[2]" :oneself="true"></vmp-air-container>
    <!-- 底部控制栏 -->
    <!-- <vmp-air-container :cuid="childrenComp[2]" :oneself="true"></vmp-air-container> -->
    <!-- 滚动的公告 -->
    <!-- <vmp-air-container :cuid="childrenComp[3]" :oneself="true"></vmp-air-container> -->
  </div>
</template>

<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpBasicCenterContainerLive',
    data() {
      return {
        childrenComp: []
      };
    },
    computed: {
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      }
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      const roomBaseServer = useRoomBaseServer();
      roomBaseServer.updateRoomVisibleModules(roomVisibleModules => {
        roomVisibleModules.push('doc');
        roomVisibleModules.push('remote-list');
        return roomVisibleModules;
      });
    },
    methods: {}
  };
</script>

<style lang="less">
  .vmp-basic-center {
    height: 100%;
    background-size: cover;
    background-color: #2d2d2d;
    display: flex;
    flex-direction: column;
    flex: 1;
    &__mini-doc {
      .vmp-doc-une {
        position: absolute !important;
        top: 0;
        right: 0;
        width: 309px;
        height: 240px;
        z-index: 1;
      }
    }
  }
  // .vmp-basic-center__mainscreen-pos {
  //   width: 100%;
  //   padding-top: 56.25%;
  // }
</style>
