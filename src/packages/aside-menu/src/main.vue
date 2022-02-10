<template>
  <div class="vmp-aside-menu">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
    <div class="vmp-aside-menu-share">
      <div @click="goWatchShare">
        <i class="vh-iconfont vh-line-share"></i>
        <p>分享</p>
      </div>
    </div>
  </div>
</template>
<script>
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

  export default {
    name: 'VmpAsideMenu',
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
          const vn = this.$children.find(item => item.kind === 'group');
          vn && vn.setDisableState(false);
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
