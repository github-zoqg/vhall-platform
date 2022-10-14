<template>
  <div :class="['vmp-wap-menu-dialog', isInGroup ? 'last-position' : '']">
    <img class="menu_icon-concise" src="./images/icon_menu.png" @click="openMenusPanel" />
    <!-- <span class="menu_icon-pointer"></span> -->
    <van-popup
      class="wap-menu-van-popup"
      v-model="menuDialogVisible"
      :lazy-render="false"
      round
      position="bottom"
    >
      <span class="filter_one"></span>
      <span class="filter_two"></span>
      <span class="filter_three"></span>
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
        childrenComp: []
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
      openMenusPanel() {
        this.menuDialogVisible = true;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitComputedMenuWidth'));
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
    &.last-position {
      margin-left: 24px;
    }
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
  }
  .wap-menu-van-popup {
    width: 100%;
    height: 708px;
    left: 0px;
    bottom: 0;
    background: linear-gradient(174.42deg, #ffffff 7.78%, #ffffff 57.2%);
    .filter_one {
      position: absolute;
      width: 470px;
      height: 470px;
      left: -124px;
      top: -303px;
      background: #c6d2ff;
      filter: blur(200px);
    }
    .filter_two {
      position: absolute;
      width: 470px;
      height: 470px;
      left: 89px;
      top: -280px;
      background: #a8faff;
      filter: blur(200px);
    }
    .filter_three {
      position: absolute;
      width: 470px;
      height: 470px;
      left: 184px;
      top: -273px;
      background: #f7d6ff;
      filter: blur(200px);
    }
  }
</style>
