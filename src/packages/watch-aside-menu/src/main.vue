<template>
  <!-- 分组直播才有该组件 -->
  <div class="vmp-watch-aside-menu" v-if="webinarMode === 6">
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
  import { useDocServer, useGroupServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

  export default {
    name: 'VmpWatchAsideMenu',
    data() {
      return {
        isCollapse: false,
        selectedMenu: '',
        disableMenus: ['document', 'board', 'desktopShare', 'assistance']
      };
    },
    computed: {
      webinarMode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      }
    },
    beforeCreate() {
      this.docServer = useDocServer();
      this.groupServer = useGroupServer();
    },
    mounted() {
      this.initEvent();
      this.resetMenus();
    },
    methods: {
      initEvent() {
        // 开启分组讨论
        this.groupServer.$on('dispatch_group_switch_start', () => {
          if (this.groupServer.state.groupInitData.isInGroup) {
            this.resetMenus();
            this.gobackHome(1, this.groupServer.state.groupInitData.name);
          }
        });
        // 结束分组讨论
        this.groupServer.$on('dispatch_group_switch_end', () => {
          this.isCollapse = true;
          this.resetMenus();
          this.gobackHome(3, this.groupServer.state.groupInitData.name);
        });

        // 小组解散
        this.groupServer.$on('dispatch_group_disband', () => {
          this.isCollapse = true;
          this.resetMenus();
          this.gobackHome(4);
        });

        // 本人被踢出来
        this.groupServer.$on('dispatch_room_group_kickout', () => {
          this.isCollapse = true;
          this.resetMenus();
          this.gobackHome(5, this.groupServer.state.groupInitData.name);
        });

        // 组长变更
        this.groupServer.$on('dispatch_group_leader_change', () => {
          this.isCollapse = true;
          this.resetMenus();
          console.log('[group] 组长变更：', this.groupServer.state.groupInitData.join_role);
          if (this.groupServer.state.groupInitData.join_role === 20) {
            this.gobackHome(6);
          } else {
            this.gobackHome(7);
          }
        });
      },
      // 返回主房间提示
      gobackHome(index, name) {
        let title = '';
        switch (index) {
          case 1:
            title = '主持人开启了分组讨论，您将进入' + name + '组参与讨论';
            break;
          case 2:
            title = '主持人已将您分配至' + name + '组';
            break;
          case 3:
            title = '主持人结束了分组讨论，您将返回主直播间';
            break;
          case 4:
            title = '主持人解散了分组，您将返回主直播间';
            break;
          case 5:
            title = '您已被踢出该小组';
            break;
          case 6:
            title = '您被提升为组长!';
            break;
          case 7:
            title = '组长身份已变更';
            break;
        }
        this.$alert(title, '提示', {
          confirmButtonText: '我知道了',
          customClass: 'know-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {})
          .catch(() => {});
      },
      resetMenus() {
        // if 直播中，在小组中，并且开启讨论
        // （1）主讲人：全部菜单可用
        // （2）普通组员：只有请求协助按钮可用
        // else
        //  菜单都是禁用状态
        if (this.docServer.state.hasDocPermission) {
          this.disableMenus = [];
          this.selectedMenu = 'document';
        } else {
          this.disableMenus = ['document', 'board', 'desktopShare'];
        }
      },
      handleToggle() {
        this.isCollapse = !this.isCollapse;
      },
      handleClickItem(kind) {
        if (this.disableMenus.includes(kind)) return false;
        this.selectedMenu = kind;
        if (this.disable) return false;

        if (kind === 'document' || kind === 'board') {
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'handleClickDoc', [kind]));
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-watch-aside-menu {
    .menu-fold {
      position: absolute;
      z-index: 6;
      left: 0;
      bottom: 60%;
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
        span {
          user-select: none;
        }

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
