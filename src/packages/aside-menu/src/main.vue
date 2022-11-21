<!-- 发起端左侧菜单 -->
<template>
  <div class="vmp-aside-menu">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>
<script>
  import { useRoomBaseServer, useGroupServer } from 'middle-domain';
  // import { boxEventOpitons } from '@/app-shared/utils/tool.js';

  export default {
    name: 'VmpAsideMenu',
    data() {
      return {};
    },
    computed: {
      // 直播模式：1-音频直播、2-视频直播、3-互动直播 6-分组直播 5 定时直播
      webinarMode() {
        return this.roomBaseServer.state.watchInitData.webinar.mode;
      },
      // 当前用户角色 1-主持人 2-观众(发起端没有观众) 3-助理；4-嘉宾（互动直播才有嘉宾）
      roleName() {
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
      // 主讲人权限
      doc_permission() {
        if (this.isInGroup) {
          return this.groupServer.state.groupInitData.doc_permission;
        } else {
          return this.roomBaseServer.state.interactToolStatus.doc_permission;
        }
      },
      // 是否开启了桌面共享
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      // 是否为云导播活动
      streamYun() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.is_director == 1 &&
          this.$domainStore.state.roomBaseServer.watchInitData.permissionKey['webinar.director'] ==
            1
        );
      },
      // 是否开启了插播
      isInsertFilePushing() {
        return this.$domainStore.state.insertFileServer.isInsertFilePushing;
      },
      // 是否开启分屏
      isOpenSplitScreen() {
        return this.$domainStore.state.splitScreenServer.isOpenSplitScreen;
      },
      // 是否开启第三方推流
      isThirdStream() {
        return this.$domainStore.state.roomBaseServer.isThirdStream;
      },
      // 桌面共享推流用户信息
      desktopShareInfo() {
        return this.$domainStore.state.desktopShareServer.desktopShareInfo;
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
      ['roomBaseServer.state.watchInitData.rebroadcast']: {
        deep: true,
        immediate: true,
        handler() {
          this.resetMenus();
        }
      },
      ['roomBaseServer.state.configList']: {
        deep: true,
        immediate: true,
        handler() {
          this.resetMenus();
        }
      },
      ['isInsertFilePushing']() {
        this.resetMenus();
      },
      // // 演示者发生变化
      // presenterId() {
      //   this.resetMenus();
      // },
      // 主讲人发生变化
      doc_permission() {
        this.resetMenus();
      },
      // 是否开启分屏
      isOpenSplitScreen() {
        this.resetMenus();
      },
      // 是否开启第三方推流
      isThirdStream() {
        this.resetMenus();
      },
      // 文档和白板切换是菜单变化
      ['$domainStore.state.docServer.currentCid'](val) {
        if (!val) return;
        if (val.startsWith('document')) {
          this.switchTo('document');
        } else {
          this.switchTo('board');
        }
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

            // 转播中
            if (this.roomBaseServer.state.watchInitData.rebroadcast?.isRebroadcasting) {
              vn.setHiddenState(true);
              continue;
            } else {
              vn.setHiddenState(false);
            }

            // 文档菜单
            if (this.roleName == 4) {
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
            // 转播中
            if (this.roomBaseServer.state.watchInitData.rebroadcast?.isRebroadcasting) {
              vn.setHiddenState(true);
              continue;
            } else {
              vn.setHiddenState(false);
            }

            // 白板菜单
            if (this.isShareScreen) {
              vn.setDisableState(true);
              continue;
            }
            if (this.roleName == 4) {
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
            if (this.isThirdStream && this.webinarType === 1) {
              vn.setDisableState(true);
              continue;
            }
            // 转播中
            if (this.roomBaseServer.state.watchInitData.rebroadcast?.isRebroadcasting) {
              vn.setDisableState(true);
              continue;
            } else {
              vn.setDisableState(false);
            }

            if (this.roleName == 3) {
              vn.setHiddenState(true);
              continue;
            }
            // 桌面共享菜单
            if (this.webinarType != 1) {
              vn.setDisableState(true);
              continue;
            }
            // 如果自己是推送桌面共享
            if (this.isShareScreen && this.desktopShareInfo.accountId == this.userId) {
              vn.setDisableState(false);
              vn.setText('关闭共享');
              vn.setSelectedState(true);
              continue;
            }
            vn.setText('桌面共享');
            vn.setSelectedState(false);
            if (this.roleName === 1) {
              // 主持人
              if (this.webinarType === 1 && !this.isInGroup) {
                vn.setHiddenState(false);
                // 云导播/音频直播隐藏桌面共享icon
                if (this.streamYun || this.webinarMode == 1) {
                  vn.setHiddenState(true);
                }
                vn.setDisableState(false);
                // 如果主持人把别人设为了主讲人，或者有人正在演示，桌面共享禁用
                if (
                  this.doc_permission != this.userId ||
                  this.presenterId != this.userId ||
                  this.isThirdStream
                ) {
                  vn.setHiddenState(false);
                  vn.setDisableState(true);
                }
              } else {
                if (this.doc_permission == this.userId || this.presenterId == this.userId) {
                  vn.setDisableState(false);
                } else {
                  // 显示但禁用
                  vn.setHiddenState(false);
                  vn.setDisableState(true);
                }
              }
            } else if (this.roleName == 4) {
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
            // 如果在插播或者分屏就禁用
            if (this.isInsertFilePushing || this.isOpenSplitScreen) {
              vn.setDisableState(true);
              continue;
            }
          } else if (vn.kind === 'insertMedia') {
            // 第三方推流开播
            if (this.isThirdStream && this.webinarType === 1) {
              vn.setDisableState(true);
              continue;
            }
            // 转播中
            if (this.roomBaseServer.state.watchInitData.rebroadcast?.isRebroadcasting) {
              vn.setDisableState(true);
              continue;
            } else {
              vn.setDisableState(false);
            }

            // 插播文件菜单
            if (!configList['waiting.video.file']) {
              vn.setHiddenState(true);
            } else if (this.roleName == 4) {
              // 是主讲人并且没有开启分屏的时候并且没有开启第三方推流，插播可用
              if (
                this.doc_permission == this.userId &&
                !this.isOpenSplitScreen &&
                !this.isThirdStream
              ) {
                vn.setDisableState(false);
              } else {
                // 嘉宾显示但禁用
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            } else if (this.roleName == 1) {
              if (this.isInGroup) {
                vn.setHiddenState(true);
              } else {
                // 如果不在小组中
                /* // this.doc_permission != this.userId ||
                  this.presenterId != this.userId ||  如果主持人把别人设为了主讲人，或者有人正在演示，或者开启分屏，或者开启第三方推流,插播文件禁用
                */
                if (this.isOpenSplitScreen || this.isThirdStream) {
                  vn.setHiddenState(false);
                  vn.setDisableState(true);
                } else {
                  vn.setHiddenState(false);
                  vn.setDisableState(false);
                }
              }
            } else {
              if (this.isInGroup) {
                vn.setHiddenState(true);
              } else if (this.presenterId != this.doc_permission || this.isThirdStream) {
                // 主讲人和演示人，不是同一个人，说面有人在演示，就禁用助理的插播
                vn.setHiddenState(false);
                vn.setDisableState(true);
              } else {
                vn.setHiddenState(false);
                vn.setDisableState(false);
              }
            }
            // 如果在桌面共享就禁用
            if (this.isShareScreen) {
              vn.setDisableState(true);
              continue;
            }
          } else if (vn.kind === 'interactTool') {
            // 互动工具菜单
            // 如果当前人所有的互动工具都没有权限，就将互动工具icon隐藏
            if (this.isAllInteractToolsDisabled()) {
              vn.setHiddenState(true);
              continue;
            }
            if (this.roleName == 4) {
              if (this.doc_permission == this.userId) {
                // 如果嘉宾为主讲人: 设置为可用
                vn.setDisableState(false);
              } else {
                // 嘉宾显示但禁用
                vn.setHiddenState(false);
                vn.setDisableState(true);
              }
            } else {
              // 如果问答权限没有，隐藏互动工具栏
              // if (
              //   this.roleName == 3 &&
              //   this.webinarMode == 5 &&
              //   !configList['ui.is_hide_qa_button']
              // ) {
              //   vn.setHiddenState(true);
              //   continue;
              // }
              // 定时直播未开播时，互动工具置灰
              // if (this.roleName == 3 && this.webinarMode == 5 && this.webinarType == 2) {
              //   vn.setDisableState(true);
              //   continue;
              // }
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
          } else if (vn.kind === 'videoPolling') {
            if (this.webinarType == 1) {
              vn.setDisableState(false);
              vn.setHiddenState(false);
            }
            if (this.webinarType != 1) {
              vn.setDisableState(true);
              continue;
            }
          }
        }
      },
      /**
       * 选择某个菜单
       * @param {String} kind 菜单类型
       *  document-文档，board-白板, desktopShare-桌面共享，insertMedia-插播文件，
       *  interactTool-互动工具，group-分组讨论, share-分享, exitGroup-退出小组
       */
      switchTo(kind) {
        for (const vn of this.$children) {
          if (vn.setSelectedState) {
            vn.setSelectedState(vn.kind === kind);
          }
        }
      },
      // 判断是否是所有的互动工具都被禁用，如果全部被禁用，互动工具icon不显示
      isAllInteractToolsDisabled() {
        const configList = this.roomBaseServer.state.configList;
        const isNoDelay = this.roomBaseServer.state.watchInitData.webinar.no_delay_webinar === 1;
        return (
          !configList['ui.hide_lottery'] && // 抽奖
          !configList['ui.hide_sign_in'] && // 签到
          !configList['ui.hide_survey'] && // 问卷
          !configList['ui.is_hide_qa_button'] && // 问答
          !configList['ui.show_redpacket'] && // 红包
          !configList['webinar.timer'] && // 计时器
          (isNoDelay || !configList['rebroadcast']) // 转播
        );
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
