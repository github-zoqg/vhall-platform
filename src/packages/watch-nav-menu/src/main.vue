<template>
  <div class="vmp-watch-nav-menu">
    <div v-show="showNavStatus" class="vmp-watch-nav-menu-wrap">
      <i class="close-btn iconfont icona-icon_shouqi2x" @click.stop="showNavStatus = false">关闭</i>
      <template v-for="menu of menuList">
        <span
          :key="menu.type"
          :class="{
            disabled:
              !hasGroupPermission ||
              (currentNav == 'startShareScreen' && menu.type != 'startShareScreen'),
            active: currentNav === menu.type
          }"
          class="nav-menu-item"
          @click.stop="selectMenu(menu)"
        >
          <i :class="[menu.icon]" class="iconfont" />
          <p>{{ menu.name }}</p>
        </span>
      </template>
      <span v-if="isInGroup" class="nav-menu-item canUse" @click="needHelp">
        <i class="iconfont icona-icon_qingqiuxiezhu2x" />
        <p>请求协助</p>
      </span>
    </div>
    <span v-show="!showNavStatus" class="vmp-watch-nav-menu__open" @click="showNavStatus = true">
      <i class="iconfont icona-icon_zhankai2x">显示</i>
    </span>
  </div>
</template>

<script>
  // import { mapState } from 'vuex';
  // import { contextServer } from 'middle-domain';

  export default {
    name: 'VmpWatchNavMenu',
    props: {
      hasGroupPermission: {
        type: Boolean,
        defalut: false,
        require: true
      }
    },
    data() {
      // const roomBaseServer = contextServer.get('roomBaseServer');
      return {
        // roomBaseServer,
        currentNav: 'document',
        menuList: [
          {
            type: 'document',
            name: '文档',
            icon: 'icona-icon_wendang2x'
          },
          {
            type: 'whiteboard',
            name: '白板',
            icon: 'icona-icon_baiban2x'
          },
          {
            type: 'startShareScreen',
            name: '桌面共享',
            icon: 'icona-icon_zhuomiangongxiang2x',
            service: true // 功能按钮非切换视图
          }
        ],
        isInGroup: false,
        selectedMenuBeforeShareScreen: 'document',
        showNavStatus: false
      };
    },
    computed: {
      // ...mapState('watchBase', ['watchInitData']),
      roomId() {
        // return this.watchInitData.interact.room_id;
        return '';
      }
    },
    created() {
      this.groupInitData = this.roomBaseServer.state.groupInitData;
      this.isInGroup = this.groupInitData.isInGroup;
      // 切换chainal
      this.$VhallEventBus.$on(this.$VhallEventType.Group.GROUP_MSG_CREATED, msg => {
        console.log(msg, '切换chainal');
        this.groupInitData = this.roomBaseServer.state.groupInitData;
        this.isInGroup = true;
      });
      // 结束讨论
      this.$VhallEventBus.$on(this.$VhallEventType.Group.GROUP_SWITCH_END, msg => {
        console.log(msg, '结束讨论');
        this.isInGroup = false;
      });
      // 分组解散
      this.$VhallEventBus.$on(this.$VhallEventType.Group.GROUP_DISBAND, msg => {
        // TODO: 与结束讨论方法相同
        console.log(msg, '分组解散');
        this.isInGroup = false;
        this.$emit('changeSpeaker', false);
      });
      // 同意邀请成功 ——> 开始演示
      this.$VhallEventBus.$on(this.$VhallEventType.Group.VRTC_CONNECT_PRESENTATION_SUCCESS, msg => {
        if (this.watchInitData.join_info.third_party_user_id == msg.sender_id) {
          this.$emit('changeSpeaker', true);
        } else {
          this.$emit('changeSpeaker', false);
        }
      });
      // 踢出小组
      this.$VhallEventBus.$on(this.$VhallEventType.Group.ROOM_GROUP_KICKOUT, msg => {
        if (this.watchInitData.join_info.third_party_user_id == msg.target_id) {
          this.isInGroup = false;
        }
      });
      // 开启/关闭桌面共享
      this.$VhallEventBus.$on('changeNavItem', msg => {
        console.log(msg, '开启桌面共享');
        if (msg) {
          this.menuList[2].name = '关闭共享';
          // 开启桌面共享更改按钮状态的时候，需要记录选中的按钮，关闭桌面共享的时候还原
          this.selectedMenuBeforeShareScreen = this.currentNav;
          this.currentNav = 'startShareScreen';
        } else {
          this.menuList[2].name = '桌面共享';
          this.currentNav = this.selectedMenuBeforeShareScreen;
        }
      });
      /**
       * @description 同步文档/白板切换状态
       */
      this.$VhallEventBus.$on('docTypeChagne', type => {
        if (type === 'document') {
          this.currentNav = type;
        } else if (type === 'board') {
          this.currentNav = 'whiteboard';
        }
      });
    },
    methods: {
      closeNav() {
        this.$emit('closeLeftNav');
      },
      /**
       * @description 点击左侧导航按钮
       */
      selectMenu(menu) {
        if (!this.hasGroupPermission) return;
        if (menu.service) {
          // todo: 功能性按钮
          this.$emit(menu.type);
          if (menu.type == 'startShareScreen' && menu.name == '关闭共享') {
            this.$VhallEventBus.$emit('changeNavItem', false);
          }
        } else {
          // 视图性按钮
          const type = menu.type;
          if (type === this.currentNav) return;
          this.currentNav = type;
          this.$emit('changeNav', type);
        }
      },
      // FIXME: 联调后需要修改(最好抛出事件,不影响组件的原子功能)
      needHelp() {
        if (!this.groupInitData.group_id) return false;
        this.$vhallapi.leftNavMenu
          .needHelp({
            room_id: this.roomId,
            group_id: this.groupInitData.group_id
          })
          .then(res => {
            if (res.code == 200) {
              this.$message({
                message: '请求协助发送成功',
                showClose: true,
                type: 'success',
                customClass: 'zdy-info-box'
              });
            }
          })
          .catch(err => {
            console.info('请求协助发送异常', err);
          });
      }
    }
  };
</script>

<style lang="less">
  .vmp-watch-nav-menu {
    position: relative;
    display: none;
    .vmp-watch-nav-menu-wrap {
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 10000;
      height: 100%;
      display: inline-block;
      width: 60px;
      overflow: hidden;
      background: rgba(42, 42, 42, 0.9);
      border-radius: 4px 0 0 0;
      .item {
        display: inline-block;
        width: 100%;
        text-align: center;
        padding: 10px 0;
        cursor: pointer;
        color: #999;
      }

      .close-btn {
        .item;
      }

      .nav-menu-item {
        .item;

        i {
          display: inline-block;
        }

        p {
          font-size: 12px;
        }

        &.disabled,
        &.disabled:hover {
          pointer-events: none;
          opacity: 0.4;
          user-select: none;
          color: #999 !important;
        }

        &.active,
        &:hover {
          color: #fb3a32;
        }
      }
    }

    .vmp-watch-nav-menu__open {
      position: absolute;
      z-index: 6;
      top: 155px;
      right: 0;
      cursor: pointer;
      display: inline-block;
      width: 32px;
      height: 40px;
      border-radius: 0 100px 100px 0;
      color: #999;
      background: rgba(42, 42, 42, 0.7);
      text-align: center;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      padding-top: 10px;
    }
  }
</style>
