<template>
  <div class="vmp-wap-menu-dialog">
    <img class="menu_icon-concise" src="./images/icon_gift.png" @click="openMenusPanel" />
    <van-popup
      class="wap-menu-van-popup"
      v-model="menuDialogVisible"
      get-container="#app"
      round
      position="bottom"
    >
      <span class="filter_one"></span>
      <span class="filter_two"></span>
      <span class="filter_three"></span>
      <!-- 菜单 -->
      <vmp-air-container
        :cuid="childrenComp[0]"
        :oneself="true"
        v-if="menuDialogVisible"
      ></vmp-air-container>
    </van-popup>
  </div>
</template>

<script>
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
    computed: {},
    beforeCreate() {},
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {},
    beforeDestroy() {},
    methods: {
      openMenusPanel() {
        this.menuDialogVisible = true;
      }
    }
  };
</script>

<style lang="less">
  .vmp-wap-menu-dialog {
    .menu_icon-concise {
      width: 50px;
      height: 50px;
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
