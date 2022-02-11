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
    mounted() {
      this.initData();
    },
    watch: {
      ['$domainStore.state.roomBaseServer.watchInitData.webinar.type'](newval) {
        const vn = this.$children.find(item => item.kind === 'group');
        if (!vn) return;
        //直播状态： type=1 直播中 ，type=3 直播结束
        if (newval === 1) {
          vn.setDisableState(false);
        } else {
          vn.setSelectedState(false);
          vn.setDisableState(true);
        }
      }
    },
    methods: {
      initData() {
        if (this.$domainStore.state.roomBaseServer.watchInitData.webinar.type === 1) {
          // 如果当前状态是直播中
          if (this.$domainStore.state.roomBaseServer.groupInitData.isInGroup) {
            // 如果当前用户正在小组中
            console.log('vn:', this.$children);
            for (const vn of this.$children) {
              console.log('vn:', vn.kind);
              // 文档、白板、桌面共享不可用
              if (['document', 'board', 'deskshare'].includes(vn.kind)) {
                vn.setSelectedState(false);
                vn.setDisableState(true);
              } else if (vn.kind === 'exitGroup') {
                vn.setDisableState(false);
                vn.setHiddenState(false);
              } else {
                // 其它菜单不可见
                vn.setHiddenState && vn.setHiddenState(true);
              }
            }
          } else {
            // 不在小组中
            for (const vn of this.$children) {
              console.log('vn:', vn.kind);
              // 分组讨论不可用
              if (['group'].includes(vn.kind)) {
                vn.setDisableState(true);
              } else if (vn.kind === 'exitGroup') {
                vn.setDisableState(false);
                vn.setHiddenState(false);
              }
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
    .menu-footer {
      position: fixed;
      bottom: 20px;
      left: 7px;
    }
  }
</style>
