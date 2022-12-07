<template>
  <!-- 分组直播才有该组件 -->
  <div class="vmp-watch-aside-menu" v-if="webinarMode == 6 && webinarType != 5">
    <ul class="menu-list" v-show="!isCollapse">
      <!-- 展开/折叠按钮 -->
      <li class="menu-item" @click="handleToggle()">
        <i class="vh-iconfont vh-line-s-fold"></i>
      </li>
      <!-- 文档按钮 -->
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
      <!-- 白板按钮 -->
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
      <!-- 桌面共享按钮 -->
      <li
        @click="handleClickItem('desktopShare')"
        class="menu-item"
        :class="[
          disableMenus.includes('desktopShare') ? 'disable' : '',
          { highlight: isShareScreen }
        ]"
      >
        <i class="vh-saas-iconfont vh-saas-a-line-Desktopsharing"></i>
        <span>{{ isShareScreen ? '关闭共享' : '桌面共享' }}</span>
      </li>
      <!-- 请求协助按钮 -->
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
      ref="groupInvitaion"
      :show.sync="dialogVisibleInvite"
      :senderId="senderId"
      :inviteName="inviteName"
      :inviteGroupId="inviteGroupId"
    ></GroupInvitaion>
  </div>
</template>
<script>
  import { useRoomBaseServer, useDocServer, useChatServer, useGroupServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import GroupInvitaion from './group-invitation.vue';

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
        inviteName: '', //邀请人身份
        inviteGroupId: '' //被邀请时用户所在分组，默认在主直播间，为空
      };
    },
    computed: {
      // 当前容器id
      currentCid() {
        return this.docServer.state.currentCid;
      },
      // 禁用菜单数组
      disableMenus() {
        if (this.hasDocPermission) {
          if (this.isShareScreen) {
            return ['document', 'board'];
          }
          return [];
        }
        return ['document', 'board', 'desktopShare'];
      },
      // 直播模式：1-音频直播、2-视频直播、3-互动直播 6-分组直播 5 定时直播
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
      },
      // 主持人ID 分组期间使用
      userinfoId() {
        return this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.userinfo.user_id;
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
      // 主房间内检测演示人变化
      ['roomBaseServer.state.interactToolStatus.presentation_screen'](presenterId) {
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
            // t=document 或 board
            this.selectedMenu = t;
          }
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.docServer = useDocServer();
      this.chatServer = useChatServer();
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
      if (this.groupServer.state.groupInitData.isInGroup && this.webinarType == 1) {
        let report_data = this.roomBaseServer.state.watchInitData.report_data.vid;
        this.grouAlert(
          `${
            report_data == this.userinfoId ? this.$getRoleName(1) : this.$getRoleName
          }开启了分组讨论，您将进入${this.groupServer.state.groupInitData.name}组参与讨论`
        );
      }
    },
    methods: {
      initEvent() {
        // 监听禁言通知
        this.chatServer.$on('banned', () => {
          this.dialogVisibleInvite && (this.dialogVisibleInvite = false);
        });

        // 监听全体禁言通知
        this.chatServer.$on('allBanned', () => {
          this.dialogVisibleInvite && (this.dialogVisibleInvite = false);
        });

        // 开启分组讨论
        this.groupServer.$on('GROUP_SWITCH_START', msg => {
          if (this.groupServer.state.groupInitData.isInGroup) {
            if (this.groupServer.state.groupInitData.join_role == 20) {
              // 如果是组长，默认展开菜单,选中文档
              this.isCollapse = false;
              this.selectedMenu = 'document';
            }
            this.grouAlert(
              `${
                msg.sender_id == this.userinfoId ? this.$getRoleName(1) : this.$getRoleName(3)
              }开启了分组讨论，您将进入${this.groupServer.state.groupInitData.name}组参与讨论`
            );
          }
        });

        // 结束分组讨论
        this.groupServer.$on('GROUP_SWITCH_END', msg => {
          const isSwitchEnd = msg.data.type == 'group_switch_end';
          // 关闭邀请演示对话框
          this.dialogVisibleInvite && this.$refs.groupInvitaion.close();
          this.isCollapse = true;
          if (!msg.data.groupToast) {
            this.grouAlert(
              `${msg.sender_id == this.userinfoId ? this.$getRoleName(1) : this.$getRoleName(3)}${
                isSwitchEnd ? '结束' : '暂停'
              }了分组讨论，您将返回主直播间`
            );
          }
        });

        // 小组解散
        this.groupServer.$on('GROUP_DISBAND', msg => {
          // 关闭邀请演示对话框
          this.dialogVisibleInvite && this.$refs.groupInvitaion.close();
          this.isCollapse = true;
          this.grouAlert(
            `${
              msg.sender_id == this.userinfoId ? this.$getRoleName(1) : this.$getRoleName(3)
            }解散了分组，您将返回主直播间`
          );
        });

        // 接收设为主讲人消息
        this.groupServer.$on('VRTC_BIG_SCREEN_SET', msg => {
          const str =
            this.roomBaseServer.state.watchInitData.webinar.mode == 6
              ? '主画面'
              : this.$t('interact.interact_1034');
          this.roomBaseServer.state.watchInitData.join_info.role_name != 2 &&
            this.groupMessage(
              this.$t('interact.interact_1012', { n: msg.data.nick_name, m: str }),
              {
                type: 'success'
              }
            );
        });

        // 切换小组,小组人员变动
        this.groupServer.$on('GROUP_JOIN_CHANGE', (msg, groupJoinChangeInfo) => {
          if (this.isInGroup) {
            const { watchInitData } = useRoomBaseServer().state;
            if (groupJoinChangeInfo && groupJoinChangeInfo.isNeedCare === false) return;
            const who =
              msg.sender_id == watchInitData.webinar.userinfo.user_id
                ? this.$getRoleName(1)
                : this.$getRoleName(3);
            this.grouAlert(`${who}已将您分配至${this.groupServer.state.groupInitData.name}`);
          }
        });

        // 本人被踢出来
        this.groupServer.$on('ROOM_GROUP_KICKOUT', msg => {
          const { watchInitData } = useRoomBaseServer().state;
          // 如果已经开启了讨论，而且被踢出的人是自己
          if (
            this.groupServer.state.groupInitData.switch_status == 1 &&
            msg.data.target_id === watchInitData.join_info.third_party_user_id
          ) {
            // 关闭邀请演示对话框
            this.dialogVisibleInvite && this.$refs.groupInvitaion.close();
            // 折叠菜单并提示
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
              this.grouAlert('您被提升为组长');
            } else {
              this.grouAlert('组长身份已变更');
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
            this.inviteName =
              msg.data.room_role == 20 ? this.$getRoleName(20) : this.$getRoleName(1);
            // 被邀请人当时所在小组
            this.inviteGroupId = this.groupServer.state.groupInitData?.group_id;
            this.dialogVisibleInvite = true;
          }
        });

        // 观看端收到拒绝邀请演示，只能是小组内
        this.groupServer.$on('VRTC_CONNECT_PRESENTATION_REFUSED', msg => {
          const { join_role, isInGroup } = this.groupServer.state.groupInitData;
          // 如果是组长，并且在小组内
          if (join_role == 20 && isInGroup && msg.data.extra_params == this.userId) {
            this.groupMessage(`观众${msg.data.nick_name}拒绝了你的演示邀请`);
          }
        });

        // 同意演示/我要演示成功
        this.groupServer.$on('VRTC_PRESENTATION_SCREEN_SET', ({ isOldPresenter, isOldLeader }) => {
          // 主持人演示 上一个演示人提示
          if (
            this.isInGroup &&
            isOldPresenter &&
            this.presenterId !== this.userId &&
            this.presenterId == this.userinfoId
          ) {
            this.groupMessage('演示权限已变更');
          }
        });

        // 观看端-结束演示成功
        // 前置说明: 该组件只在观看端使用，角色只有观众和组长
        this.groupServer.$on('VRTC_DISCONNECT_PRESENTATION_SUCCESS', msg => {
          if (msg.data.room_role == 1 && msg.sender_id == msg.data.room_join_id) {
            // 主持人结束了主持人自己的演示
            this.groupMessage(`${this.$getRoleName(1)}结束了演示`);
          } else if (
            msg.data.room_role == 2 &&
            msg.sender_id == this.roomBaseServer.state.watchInitData.webinar.userinfo.user_id
          ) {
            // 主持人结束了观众的演示
            if (msg.data.room_join_id == this.userId) {
              this.groupMessage('演示权限已变更');
            }
          } else if (msg.data.room_role == 2 && msg.sender_id == msg.data.room_join_id) {
            // 观众结束了观众自己的演示
            if (msg.data.room_join_id != this.userId) {
              this.groupMessage(`观众${msg.data.nick_name}结束了演示`);
            }
          } else if (msg.data.room_role == 2) {
            // 组长结束了观众的演示
            if (msg.data.room_join_id == this.userId) {
              this.groupMessage('演示权限已变更');
            }
          }
          if (this.presenterId === this.userId) {
            // 如果结束后演示者是自己，说明是演示权限回收
            // 通知文档重设笔刷, 后面可以考虑当前笔刷放到文档server中
            window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitDocResetBrush'));
          }
        });
      },

      /**
       * 弹窗提示
       * @param {*} message
       */
      grouAlert(message) {
        this.$alert(message, '提示', {
          confirmButtonText: '我知道了',
          customClass: 'zdy-message-box',
          lockScroll: false,
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {})
          .catch(() => {});
      },

      /**
       * message提示
       * @param {String} message 提示文本
       */
      groupMessage(message, options) {
        this.$message(
          Object.assign(
            { message: message, showClose: true, type: 'warning', customClass: 'zdy-info-box' },
            options
          )
        );
      },

      /**
       * 展开/折叠菜单
       */
      handleToggle() {
        this.isCollapse = !this.isCollapse;
      },

      /**
       * 点击菜单事件
       * @param {String} kind 菜单类型
       * document - 文档
       * board - 白板
       * assistance - 请求协助
       * desktopShare - 桌面共享
       */
      handleClickItem(kind) {
        if (this.disableMenus.includes(kind)) return false;
        if (kind === 'document' || kind === 'board') {
          // 点击文档或白板
          this.selectedMenu = kind;
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'handleClickDoc', [kind]));
        } else if (kind === 'assistance') {
          // 点击请求协助
          this.groupServer
            .needHelp()
            .then(res => {
              if (res.code == 200) {
                this.groupMessage(this.$t('other.other_1005'), { type: 'success' });
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
      top: 102px;
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
      height: calc(100% - 56px);
      background: var(--menu-item-menu-color);
      overflow: hidden;
      border-radius: 4px 0 0 0;
      flex-direction: column;

      .menu-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: var(--menu-item-font-color);
        font-size: 12px;
        padding: 10px 0;
        span {
          user-select: none;
        }

        &:not(.disable):hover {
          color: var(--theme-color);
          cursor: pointer;
        }

        &.highlight {
          color: var(--theme-color);
          cursor: pointer;
        }

        &.selected {
          color: var(--theme-color);
          cursor: pointer;
        }

        &.selected.disable,
        &.disable {
          color: var(--menu-item-font-disable-color);
          cursor: not-allowed;
        }
      }
    }
  }
</style>
