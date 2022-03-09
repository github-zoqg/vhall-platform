<!-- 发起端左侧菜单 -->
<template>
  <div class="vmp-aside-menu">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>
<script>
  import { useRoomBaseServer, useGroupServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

  export default {
    name: 'VmpAsideMenu',
    data() {
      return {};
    },
    computed: {
      // 直播模式：1-音频直播、2-视频直播、3-互动直播 6-分组直播
      webinarMode() {
        return this.roomBaseServer.state.watchInitData.webinar.mode;
      },
      // 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾？）
      role() {
        return this.roomBaseServer.state.watchInitData.join_info.role_name;
      },
      // 活动状态（2-预约 1-直播 3-结束 4-点播 5-回放）
      webinarType() {
        return Number(this.roomBaseServer.state.watchInitData.webinar.type);
      },
      // 是否在小组中
      isInGroup() {
        return !!this.groupServer.state.groupInitData?.isInGroup;
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
      //互动工具状态
      doc_permission() {
        if (this.isInGroup) {
          return this.groupServer.state.groupInitData.doc_permission;
        } else {
          return this.roomBaseServer.state.interactToolStatus.doc_permission;
        }
      },
      // 是否开启了桌面共享
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.isShareScreen;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    mounted() {
      this.resetMenus();
    },
    watch: {
      ['roomBaseServer.state.watchInitData.webinar.type']() {
        this.resetMenus();
      },
      ['groupServer.state.groupInitData.isInGroup']() {
        this.resetMenus();
      },
      ['presenterId']() {
        this.resetMenus();
      },
      ['isShareScreen']() {
        this.resetMenus();
      },
      ['roomBaseServer.state.configList']: {
        deep: true,
        immediate: true,
        handler() {
          this.resetMenus();
        }
      },
      // // 演示者发生变化
      // presenterId() {
      //   this.resetMenus();
      // },
      // 主讲人发生变化
      doc_permission() {
        this.resetMenus();
      }
    },
    methods: {
      // 重置菜单，根据场景设置菜单的隐藏和显示
      resetMenus() {
        const { configList } = this.roomBaseServer.state;
        // kind: document-文档，board-白板, desktopShare-桌面共享，insertMedia-插播文件，
        // interactTool-互动工具，group-分组讨论, share-分享, exitGroup-退出小组
        for (const vn of this.$children) {
          if (!vn.kind || !vn.setDisableState || !vn.setHiddenState) continue;
          if (vn.kind === 'document') {
            if (this.isShareScreen) {
              vn.setDisableState(true);
              continue;
            }
            // 文档菜单
            if (this.role == 4) {
              // 嘉宾
              if (this.doc_permission == this.userId) {
                vn.setDisableState(false);
              } else {
                vn.setDisableState(true);
              }
            } else {
              if (this.presenterId == this.userId) {
                vn.setHiddenState(false);
                vn.setDisableState(false);
              } else {
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            }
          } else if (vn.kind === 'board') {
            // 白板菜单
            if (this.isShareScreen) {
              vn.setDisableState(true);
              continue;
            }
            if (this.role == 4) {
              // 嘉宾
              if (this.doc_permission == this.userId) {
                vn.setDisableState(false);
              } else {
                vn.setDisableState(true);
              }
            } else {
              if (this.presenterId == this.userId) {
                vn.setHiddenState(false);
                vn.setDisableState(false);
              } else {
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            }
          } else if (vn.kind === 'desktopShare') {
            // 桌面共享菜单
            if (this.isShareScreen) {
              vn.setDisableState(false);
              vn.setText('关闭共享');
              vn.setSelectedState(true);
              continue;
            }
            vn.setText('桌面共享');
            vn.setSelectedState(false);
            if (this.role === 1) {
              // 主持人
              if (this.webinarType === 1) {
                vn.setHiddenState(false);
                vn.setDisableState(false);
              } else {
                // 显示但禁用
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            } else if (this.role == 4) {
              if (this.doc_permission == this.userId) {
                vn.setDisableState(false);
              } else {
                // 嘉宾显示但禁用
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            } else {
              vn.setHiddenState(true); //隐藏
            }
          } else if (vn.kind === 'insertMedia') {
            if (this.isShareScreen) {
              vn.setDisableState(true);
              continue;
            }
            // 插播文件菜单
            if (!configList['waiting.video.file']) {
              vn.setHiddenState(true);
            } else if (this.role == 4) {
              if (this.doc_permission == this.userId) {
                vn.setDisableState(false);
              } else {
                // 嘉宾显示但禁用
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            } else {
              if (this.isInGroup) {
                vn.setHiddenState(true);
              } else {
                vn.setHiddenState(false);
                vn.setDisableState(false);
              }
            }
          } else if (vn.kind === 'interactTool') {
            // 互动工具菜单
            if (this.role == 4) {
              if (this.doc_permission == this.userId) {
                // 如果嘉宾为主讲人: 设置为可用
                vn.setDisableState(false);
              } else {
                // 嘉宾显示但禁用
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            } else {
              if (this.isInGroup) {
                vn.setHiddenState(true);
              } else {
                vn.setHiddenState(false);
                vn.setDisableState(false);
              }
            }
          } else if (vn.kind === 'group') {
            // 分组讨论菜单
            if (this.webinarMode !== 6) {
              vn.setHiddenState(true);
            } else {
              if (this.webinarType == 1 && this.isInGroup) {
                vn.setHiddenState(true);
              } else if (this.webinarType == 1) {
                vn.setHiddenState(false);
                vn.setDisableState(false);
              } else {
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            }
          } else if (vn.kind === 'share') {
            // 分享菜单
            if (this.isInGroup) {
              vn.setHiddenState(true);
            } else {
              vn.setHiddenState(false);
              vn.setDisableState(false);
            }
          } else if (vn.kind === 'exitGroup') {
            if (this.isInGroup) {
              vn.setHiddenState(false);
              vn.setDisableState(false);
            } else {
              vn.setHiddenState(true);
            }
          }
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
    position: relative;
    height: 100%;

    .menu-footer {
      position: absolute;
      width: 100%;
      bottom: 10px;
    }
  }
</style>
