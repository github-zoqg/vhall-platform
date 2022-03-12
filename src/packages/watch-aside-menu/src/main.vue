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
        :class="[disableMenus.includes('desktopShare') ? 'disable' : '']"
      >
        <i class="vh-saas-iconfont vh-saas-a-line-Desktopsharing"></i>
        <span>{{ isShareScreen ? '关闭共享' : '桌面共享' }}</span>
      </li>
      <li
        v-if="isInGroup"
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

    <!-- 邀请演示对话框 -->
    <GroupInvitaion
      :show.sync="dialogVisibleInvite"
      :senderId="senderId"
      :inviteName="inviteName"
    ></GroupInvitaion>
  </div>
</template>
<script>
  import { useRoomBaseServer, useDocServer, useGroupServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import GroupInvitaion from './group-invitation.vue';
  import { consoleSandbox } from '@sentry/utils';

  export default {
    name: 'VmpWatchAsideMenu',
    components: {
      GroupInvitaion
    },
    data() {
      return {
        isCollapse: true,
        selectedMenu: '',
        dialogVisibleInvite: false, //邀请演示对话框是否显示
        senderId: '', //邀请人id
        inviteName: '' //邀请人身份
      };
    },
    computed: {
      currentCid() {
        return this.docServer.state.currentCid;
      },
      disableMenus() {
        if (this.hasDocPermission) {
          if (this.isShareScreen) {
            return ['document', 'board'];
          }
          return [];
        }
        return ['document', 'board', 'desktopShare'];
      },
      webinarMode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      // 当前用户Id
      userId() {
        return this.roomBaseServer.state.watchInitData.join_info.third_party_user_id;
      },
      // 当前的演示者Id
      presenterId() {
        return this.isInGroup
          ? this.groupServer.state.groupInitData.presentation_screen
          : this.roomBaseServer.state.interactToolStatus.presentation_screen;
      },
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(this.roomBaseServer.state.clientType);
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      // 是否在小组中，请求协助菜单在小组中才显示
      isInGroup() {
        return !!this.groupServer.state.groupInitData?.isInGroup;
      },
      // 是否文档演示权限
      hasDocPermission() {
        if (this.isWatch && [4, 5].includes(this.webinarType)) {
          // 对于观看端 && 点播和回放，所有人都没有文档演示权限
          return false;
        }
        // 当前用户是否演示者
        return this.presenterId == this.userId;
      },
      // 是否在桌面共享
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      }
    },
    watch: {
      // 检测演示人变化
      ['groupServer.state.groupInitData.presentation_screen'](presenterId) {
        if (presenterId && presenterId == this.userId) {
          this.isCollapse = false;
        } else {
          this.isCollapse = true;
        }
      },
      ['docServer.state.currentCid'](newval) {
        if (newval) {
          const t = newval.split('-')[0];
          if (t) {
            this.selectedMenu = t;
          }
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.groupServer = useGroupServer();
    },
    mounted() {
      this.initEvent();

      if (this.presenterId == this.userId) {
        this.isCollapse = false;
        if (!this.selectedMenu) {
          // 默认选中文档文档
          this.selectedMenu = 'document';
        }
      }
    },
    methods: {
      initEvent() {
        // 开启分组讨论
        this.groupServer.$on('GROUP_SWITCH_START', () => {
          if (this.groupServer.state.groupInitData.isInGroup) {
            if (this.groupServer.state.groupInitData.join_role == 20) {
              // 如果是组长，默认展开菜单,选中文档
              this.isCollapse = false;
              this.selectedMenu = 'document';
            }
            this.gobackHome(1, this.groupServer.state.groupInitData.name);
          }
        });

        // 结束分组讨论
        this.groupServer.$on('GROUP_SWITCH_END', msg => {
          this.isCollapse = true;
          if (!msg.data.groupToast) {
            this.gobackHome(3, this.groupServer.state.groupInitData.name);
          }
        });

        // 小组解散
        this.groupServer.$on('GROUP_DISBAND', () => {
          this.isCollapse = true;
          this.gobackHome(4);
        });

        // 接收设为主讲人消息
        this.groupServer.$on('VRTC_BIG_SCREEN_SET', msg => {
          const str =
            this.roomBaseServer.state.watchInitData.webinar.mode == 6 ? '主画面' : '主讲人';
          this.$message.success(`${msg.data.nick_name}设置成为${str}`);
        });
        // 切换小组,小组人员变动
        this.groupServer.$on('GROUP_JOIN_CHANGE', msg => {
          if (this.isInGroup) {
            const { watchInitData } = useRoomBaseServer().state;
            const who = msg.sender_id == watchInitData.webinar.userinfo.user_id ? '主持人' : '助理';
            this.grouAlert(`${who}已将您分配至${this.groupServer.state.groupInitData.name}`);
          }
        });

        // 本人被踢出来
        this.groupServer.$on('ROOM_GROUP_KICKOUT', msg => {
          if (
            msg &&
            msg.data.target_id &&
            msg.data.target_id ===
              useRoomBaseServer().state.watchInitData.join_info.third_party_user_id
          ) {
            this.isCollapse = true;
            this.grouAlert('您已被踢出该小组');
          }
        });

        // 组长变更
        this.groupServer.$on('GROUP_LEADER_CHANGE', () => {
          if (this.isInGroup) {
            if (this.presenterId != this.userId) {
              //  如果演示者不是自己
              this.isCollapse = true;
            }
            if (this.presenterId == this.userId) {
              this.isCollapse = false;
              if (!this.selectedMenu) {
                // 默认选中文档文档
                this.selectedMenu = 'document';
              }
            }

            if (this.groupServer.state.groupInitData.join_role == 20) {
              this.gobackHome(6);
            } else {
              this.gobackHome(7);
            }
          }
        });

        // 观看端监听到邀请演示的消息处理
        // (主直播间主持人邀请其它成员演示，小组内组长邀请其它成员演示)
        this.groupServer.$on('VRTC_CONNECT_PRESENTATION', msg => {
          // 如果是自己被邀请
          if (this.userId == msg.data.target_id) {
            this.senderId = msg.sender_id; // 邀请人id
            // 邀请人身份
            this.inviteName = msg.data.room_role == 20 ? '组长' : '主持人';
            this.dialogVisibleInvite = true;
          }
        });

        // 观看端收到拒绝邀请演示，只能是小组内
        this.groupServer.$on('VRTC_CONNECT_PRESENTATION_REFUSED', msg => {
          const { join_role, isInGroup } = this.groupServer.state.groupInitData;
          // 如果是组长，并且在小组内
          if (join_role == 20 && isInGroup && msg.data.extra_params == this.userId) {
            this.$message({
              message: `观众${msg.data.nick_name}拒绝了你的演示邀请`,
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
        });

        // 演示者变更
        this.groupServer.$on(
          'VRTC_PRESENTATION_SCREEN_SET',
          (msg, { isOldPresenter, isOldLeader }) => {
            // console.log('VRTC_PRESENTATION_SCREEN_SET:', msg);
            // if (isOldPresenter || isOldLeader) {
            //   this.$message.success('演示权限已变更');
            // }
          }
        );

        // 观看端-同意演示成功
        this.groupServer.$on('VRTC_CONNECT_PRESENTATION_SUCCESS', msg => {
          console.log('VRTC_CONNECT_PRESENTATION_SUCCESS:', msg);
        });

        // 观看端-结束演示成功
        // 前置说明: 该组件只在观看端使用，角色只有观众和组长
        this.groupServer.$on('VRTC_DISCONNECT_PRESENTATION_SUCCESS', msg => {
          if (msg.data.room_role == 1 && msg.sender_id == msg.data.room_join_id) {
            // 主持人结束了主持人自己的演示
            this.$message({
              message: '主持人结束了演示',
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          } else if (
            msg.data.room_role == 2 &&
            msg.sender_id == this.roomBaseServer.state.watchInitData.webinar.userinfo.user_id
          ) {
            // 主持人结束了观众的演示
            if (msg.data.room_join_id == this.userId) {
              this.$message({
                message: '演示权限已变更',
                showClose: true,
                type: 'warning',
                customClass: 'zdy-info-box'
              });
            }
          } else if (msg.data.room_role == 2 && msg.sender_id == msg.data.room_join_id) {
            // 观众结束了观众自己的演示
            if (msg.data.room_join_id != this.userId) {
              this.$message({
                message: `观众${msg.data.nick_name}结束了演示`,
                showClose: true,
                type: 'warning',
                customClass: 'zdy-info-box'
              });
            }
          } else if (msg.data.room_role == 2) {
            // 组长结束了观众的演示
            if (msg.data.room_join_id == this.userId) {
              this.$message({
                message: '演示权限已变更',
                showClose: true,
                type: 'warning',
                customClass: 'zdy-info-box'
              });
            }
          }
        });
      },
      grouAlert(message) {
        this.$alert(message, '提示', {
          confirmButtonText: '我知道了',
          customClass: 'know-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {})
          .catch(() => {});
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
      handleToggle() {
        this.isCollapse = !this.isCollapse;
      },
      handleClickItem(kind) {
        if (this.disableMenus.includes(kind)) return false;
        if (kind === 'document' || kind === 'board') {
          this.selectedMenu = kind;
          // 点击文档或白板
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'handleClickDoc', [kind]));
        } else if (kind === 'assistance') {
          // 点击请求协助
          this.groupServer
            .needHelp()
            .then(res => {
              if (res.code == 200) {
                this.$message.success('请求协助发送成功');
              }
            })
            .catch(err => {
              console.info('请求协助发送异常', err);
            });
        } else if (kind === 'desktopShare') {
          // 点击桌面共享
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'handleClickDesktopScreen', [this.isShareScreen])
          );
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

        &:not(.disable):hover {
          color: #fb3a32;
          cursor: pointer;
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
