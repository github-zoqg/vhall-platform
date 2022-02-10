<template>
  <div class="vmp-aside-menu">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
    <div class="vmp-aside-menu-share">
      <div @click="goWatchShare">
        <i class="vh-saas-iconfont vh-saas-line-choose"></i>
        <p>分享</p>
      </div>
    </div>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpAsideMenu',
    methods: {
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
    &-share {
      position: fixed;
      bottom: 20px;
      left: 20px;
      div {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;
        color: #ececec;
        padding: 10px 0px;
        cursor: pointer;
        i {
          user-select: none;
          display: block;
          width: 23px;
          height: 23px;
          margin: 0 auto;
          padding-bottom: 6px;
          font-size: 22px;
        }
        p {
          font-size: 12px;
        }
      }
    }
  }
</style>
