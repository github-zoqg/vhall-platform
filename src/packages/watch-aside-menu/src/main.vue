<template>
  <!-- 分组直播才有该组件 -->
  <div class="vmp-watch-aside-menu">
    <ul class="menu-list" v-show="!isCollapse">
      <li class="menu-item" @click="handleToggle()">
        <i class="vh-iconfont vh-line-s-fold"></i>
      </li>
      <vmp-air-container :cuid="cuid"></vmp-air-container>
      <li
        @click="handleClickItem('document')"
        class="menu-item"
        :class="[
          selectedMenu === 'document' ? 'selected' : '',
          disableMenus.includes('document') ? 'disable' : ''
        ]"
      >
        <i class="vh-iconfont vh-line-document"></i>
        <span>文档</span>
      </li>
      <li
        @click="handleClickItem('board')"
        class="menu-item"
        :class="[
          selectedMenu === 'board' ? 'selected' : '',
          disableMenus.includes('board') ? 'disable' : ''
        ]"
      >
        <i class="vh-saas-iconfont vh-saas-line-whiteboard"></i>
        <span>白板</span>
      </li>
      <li
        @click="handleClickItem('desktopShare')"
        class="menu-item"
        :class="[
          selectedMenu === 'desktopShare' ? 'selected' : '',
          disableMenus.includes('desktopShare') ? 'disable' : ''
        ]"
      >
        <i class="vh-saas-iconfont vh-saas-a-line-Desktopsharing"></i>
        <span>桌面共享</span>
      </li>
      <li
        @click="handleClickItem('assistance')"
        class="menu-item"
        :class="[
          selectedMenu === 'assistance' ? 'selected' : '',
          disableMenus.includes('assistance') ? 'disable' : ''
        ]"
      >
        <i class="vh-saas-iconfont vh-saas-a-line-Requestassistance"></i>
        <span>请求协助</span>
      </li>
    </ul>
    <span class="menu-fold" v-show="isCollapse" @click="handleToggle()">
      <i class="vh-iconfont vh-line-s-unfold"></i>
    </span>
  </div>
</template>
<script>
  export default {
    name: 'VmpWatchAsideMenu',
    data() {
      return {
        isCollapse: true,
        selectedMenu: '',
        disableMenus: ['document', 'board', 'desktopShare', 'assistance']
      };
    },
    watch: {
      ['$domainStore.state.roomBaseServer.watchInitData.webinar.type'](newval) {
        this.resetMenus();
      },
      ['$domainStore.state.roomBaseServer.interactToolStatus.is_open_switch'](newval) {
        this.resetMenus();
      },
      ['$domainStore.state.groupServer.groupInitData.isInGroup'](newval) {
        this.resetMenus();
      }
    },
    mounted() {
      this.resetMenus();
    },
    methods: {
      resetMenus() {
        // if 直播中，在小组中，并且开启讨论
        // （1）主讲人：全部菜单可用
        // （2）普通组员：只有请求协助按钮可用
        // else
        //  菜单都是禁用状态
        if (
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.type === 1 &&
          this.$domainStore.state.groupServer?.groupInitData?.isInGroup &&
          this.$domainStore.state.roomBaseServer.interactToolStatus.is_open_switch == 1
        ) {
          // 主讲人
          if (this.$domainStore.state.groupServer?.groupInitData?.join_role == 20) {
            this.disableMenus = [];
          } else {
            this.disableMenus = ['document', 'board', 'desktopShare'];
          }
        }
      },
      handleToggle() {
        this.isCollapse = !this.isCollapse;
      },
      handleClickItem(kind) {
        if (this.disableMenus.includes(kind)) return false;
        this.selectedMenu = kind;
      }
    }
  };
</script>
<style lang="less">
  .vmp-watch-aside-menu {
    .menu-fold {
      position: absolute;
      z-index: 6;
      top: 21px;
      cursor: pointer;
      display: inline-block;
      width: 32px;
      height: 40px;
      border-radius: 0 100px 100px 0;
      color: #999;
      background: rgba(42, 42, 42, 0.7);
      text-align: center;
      box-sizing: border-box;
      padding-top: 10px;
      i {
        margin-left: -5px;
      }
    }

    .menu-list {
      position: absolute;
      z-index: 6;
      top: 0px;
      bottom: 0;
      display: flex;
      width: 60px;
      background: rgba(42, 42, 42, 0.9);
      overflow: hidden;
      border-radius: 4px 0 0 0;
      flex-direction: column;

      .menu-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #999;
        font-size: 12px;
        padding: 10px 0;

        &.selected {
          color: #fb3a32;
          cursor: pointer;
        }

        &.selected.disable,
        &.disable {
          color: #777777;
          cursor: not-allowed;
        }
      }
    }
  }
</style>
