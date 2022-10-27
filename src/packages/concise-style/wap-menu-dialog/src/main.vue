<template>
  <div class="vmp-wap-menu-dialog">
    <img class="menu_icon-concise" src="./images/icon_menu.png" @click="openMenusPanel" />
    <!-- <span class="menu_icon-pointer"></span> -->
    <van-popup
      class="wap-menu-van-popup"
      v-model="menuDialogVisible"
      :lazy-render="false"
      round
      position="bottom"
      :style="{ height: `${popHeight}px` }"
    >
      <!-- <div class="bg-colors-one"></div>
      <div class="bg-colors-two"></div>
      <div class="bg-colors-three"></div> -->
      <!-- 菜单 -->
      <vmp-air-container :cuid="childrenComp[0]" :oneself="true"></vmp-air-container>
    </van-popup>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpWapMenuDialog',
    components: {},
    data() {
      return {
        menuDialogVisible: false,
        childrenComp: [],
        popHeight: 708
      };
    },
    watch: {},
    computed: {
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {},
    beforeDestroy() {},
    methods: {
      async openMenusPanel() {
        this.menuDialogVisible = true;
        await this.$nextTick(() => {});
        this.computeDialogHeight();
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitComputedMenuWidth'));
      },
      computeDialogHeight() {
        const blockIsOffsetTop = document.getElementsByClassName('vmp-block');
        const baseDomHeight = document.body.clientHeight;
        const offsetTop = blockIsOffsetTop ? blockIsOffsetTop[0].offsetTop : 0;
        if (offsetTop && offsetTop > 0) {
          this.popHeight = Number(baseDomHeight - offsetTop);
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-menu-dialog {
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    position: relative;
    text-align: left;
    /* 极简模式下弹出来的样式，很多都需要重置 */
    .menu_icon-concise {
      width: 50px;
      height: 50px;
    }
    .menu_icon-pointer {
      width: 14px;
      height: 14px;
      right: -7px;
      top: -4px;
      position: absolute;
      border-radius: 100%;
      display: block;
      background: #fb3a32;
    }
    .vmp-interact-tools-wap .vh-saas-iconfont,
    .vmp-interact-tools-wap .vh-iconfont {
      font-size: 12px;
    }
    .bg-colors-one {
      position: absolute;
      width: 470px;
      height: 470px;
      left: -124px;
      top: -303px;
      background: #c6d2ff;
      filter: blur(200px);
    }
    .bg-colors-two {
      position: absolute;
      width: 470px;
      height: 470px;
      left: 89px;
      top: -280px;
      background: #a8faff;
      filter: blur(200px);
    }
    .bg-colors-three {
      position: absolute;
      width: 470px;
      height: 470px;
      left: 184px;
      top: -273px;
      background: #f7d6ff;
      filter: blur(200px);
    }
    .wap-menu-van-popup {
      width: 100%;
      // min-height: 708px;
      left: 0px;
      bottom: 0;
      // background: linear-gradient(174.42deg, #ffffff 7.78%, #ffffff 57.2%);
      background: url('./images/gradient_bg.png') repeat-x;
      background-size: cover;
    }
  }
</style>
