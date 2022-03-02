<template>
  <div class="vmp-aside-menu">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

  export default {
    name: 'VmpAsideMenu',
    data() {
      return {};
    },
    computed: {
      // 直播模式：1-音频直播、2-视频直播、3-互动直播 6-分组直播
      webinarMode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      }
    },
    mounted() {
      this.resetMenus();
    },
    watch: {
      ['$domainStore.state.roomBaseServer.watchInitData.webinar.type'](newval) {
        this.resetMenus();
      },
      ['$domainStore.state.groupServer.groupInitData.isInGroup'](newval) {
        this.resetMenus();
      }
    },
    methods: {
      // 重置菜单，根据场景设置菜单的隐藏和显示
      resetMenus() {
        // 场景 1：未直播， 2：直播但不在小组中 3：直播而且在小组中
        const scene =
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.type === 1
            ? this.$domainStore.state.groupServer.groupInitData?.isInGroup
              ? 3
              : 2
            : 1;
        // kind: document-文档，board-白板, desktopShare-桌面共享，insertMedia-插播文件，
        // interactTool-互动工具，group-分组讨论, share-分享, exitGroup-退出小组
        for (const vn of this.$children) {
          if (!vn.kind || !vn.setDisableState || !vn.setHiddenState) continue;

          if (this.webinarMode !== 6 && vn.kind === 'group') {
            // 不是分组直播，没分组讨论菜单
            vn.setHiddenState(true);
            continue;
          }

          if (scene === 1) {
            // 未直播场景下
            if (['exitGroup'].includes(vn.kind)) {
              // 隐藏
              vn.setHiddenState(true);
            } else if (
              ['document', 'board', 'insertMedia', 'interactTool', 'share'].includes(vn.kind)
            ) {
              // 显示并可用
              vn.setHiddenState(false);
              vn.setDisableState(false);
            } else if (['desktopShare', 'group'].includes(vn.kind)) {
              // 显示但禁用
              vn.setHiddenState(false);
              vn.setDisableState(true);
            }
          } else if (scene === 2) {
            // 直播中，但不在小组中
            if (['exitGroup'].includes(vn.kind)) {
              // 隐藏
              vn.setHiddenState(true);
            } else if (
              [
                'document',
                'board',
                'desktopShare',
                'insertMedia',
                'interactTool',
                'group',
                'share'
              ].includes(vn.kind)
            ) {
              // 显示并可用
              vn.setHiddenState(false);
              vn.setDisableState(false);
            } else {
              // 显示但禁用
              vn.setHiddenState(false);
              vn.setDisableState(true);
            }
          } else if (scene === 3) {
            if (['document', 'board', 'desktopShare'].includes(vn.kind)) {
              // 显示但禁用
              vn.setHiddenState(false);
              vn.setDisableState(true);
            } else if (['exitGroup'].includes(vn.kind)) {
              // 显示并可用
              vn.setHiddenState(false);
              vn.setDisableState(false);
            } else {
              // 隐藏
              vn.setHiddenState(true);
            }
          }
        }
      },
      switchTo(kind) {
        for (const vn of this.$children) {
          if (vn.setSelectedState) {
            vn.setSelectedState(vn.kind === kind);
          }
        }
      },
      goWatchShare() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitShareClick'));
      }
    }
  };
</script>
<style lang="less">
  .vmp-aside-menu {
    position: relative;
    height: 100%;

    .menu-footer {
      position: absolute;
      width: 100%;
      bottom: 10px;
    }
  }
</style>
