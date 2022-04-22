<template>
  <!-- 分组讨论 -->

  <div class="vmp-group-discussion">
    <!-- 分组设置主操作面板 -->
    <div class="vmp-group-workspace" v-show="panelShow">
      <div class="vmp-group-split">
        <div class="vmp-group-split__hd">
          <span class="split-title">分组设置</span>
          <div class="split-op">
            <el-button
              type="default"
              size="small"
              :round="true"
              class="btn-group-op"
              :disabled="!groupedUserExists || way != 3 || isOpenSwitch == 1"
              @click="groupPresetImport"
            >
              重新导入
            </el-button>
            <el-button
              type="default"
              size="small"
              :round="true"
              class="btn-group-op"
              :disabled="isOpenSwitch != 1"
              @click="handleNotice"
            >
              小组公告
            </el-button>
            <el-button
              type="default"
              size="small"
              :round="true"
              class="btn-group-op"
              @click="handleAdd"
            >
              新增分组
            </el-button>
            <el-button
              v-if="isOpenSwitch == 1"
              type="default"
              size="small"
              :round="true"
              class="btn-group-op"
              @click="handleEndDiscussion"
            >
              结束讨论
            </el-button>
            <el-button
              v-else
              type="default"
              size="small"
              :round="true"
              class="btn-group-op"
              :disabled="!groupedUserExists"
              @click="handleStartDiscussion"
            >
              开始讨论
            </el-button>
          </div>
        </div>
        <div class="vmp-group-split__bd">
          <!-- 待分配card一定存在 -->
          <div class="split-card">
            <div class="split-card__inner">
              <div class="split-card__hd">
                <div class="split-card__title">待分配 ( {{ waitingUserList.length }} )</div>

                <div class="split-card__menus">
                  <el-button
                    v-if="!checkStatus"
                    class="btn-menu"
                    type="text"
                    :disabled="waitingUserList.length === 0"
                    @click="handleDispatch"
                  >
                    <i class="menu-icon vh-saas-iconfont vh-saas-a-line-batchdistribution"></i>
                    <span>批量分配</span>
                  </el-button>

                  <el-button
                    v-if="checkStatus"
                    type="text"
                    :disabled="waitingUserList.length == 0"
                    icon="menu-icon vh-saas-iconfont vh-saas-a-line-batchdistribution"
                    class="btn-menu btn-menu--cancel"
                    @click="handleCancelDispatch"
                  >
                    <span>取消</span>
                  </el-button>
                  <el-button
                    v-if="checkStatus"
                    type="text"
                    :disabled="waitingUserList.length == 0"
                    icon="menu-icon vh-saas-iconfont vh-saas-a-line-batchdistribution"
                    class="btn-menu"
                    @click="handleChangeGroup(1)"
                  >
                    <span>换组</span>
                  </el-button>
                </div>
              </div>
              <div class="split-card__bd wait-user-list">
                <template v-if="checkStatus">
                  <el-checkbox-group v-model="checkList">
                    <el-checkbox
                      v-for="item in waitingUserList"
                      :key="item.account_id"
                      :label="item.account_id"
                    >
                      <div class="user-name" style="padding: 0">
                        {{ item.nickname }}
                      </div>
                    </el-checkbox>
                  </el-checkbox-group>
                </template>
                <template v-else>
                  <span
                    class="user-name-tag user-name-tag--waiting"
                    v-for="item in waitingUserList"
                    :key="item.account_id"
                  >
                    <el-tooltip
                      placement="top-start"
                      :visible-arrow="false"
                      popper-class="transfer-box"
                    >
                      <div class="user-name">{{ item.nickname }}</div>
                      <div slot="content">
                        {{ item.nickname }}
                      </div>
                    </el-tooltip>
                  </span>
                </template>
              </div>
            </div>
          </div>

          <!-- 已分组列表 -->
          <div v-for="(item, index) in groupedUserList" :key="index" class="split-card">
            <div class="split-card__inner">
              <div class="split-card__hd">
                <div class="split-card__title">
                  {{ item.name }} ( {{ item.group_joins.length }} )
                  <span v-if="item.help && !isHave(item.group_joins)" class="colFA9A32">
                    请求协助…
                  </span>
                </div>
                <div class="split-card__menus">
                  <template v-if="!item.isChange">
                    <el-button
                      v-if="isOpenSwitch == 1"
                      class="btn-menu"
                      type="text"
                      @click="handleEnterGroup(item.id)"
                    >
                      <i class="menu-icon vh-saas-iconfont vh-saas-a-line-Intotheteam"></i>
                      <span>进入小组</span>
                    </el-button>
                    <el-button class="btn-menu" type="text" @click="handleDisband(item.id)">
                      <i class="menu-icon vh-saas-iconfont vh-saas-a-line-dissolutiongrouping"></i>
                      <span>解散</span>
                    </el-button>
                    <el-button
                      class="btn-menu"
                      type="text"
                      :disabled="item.group_joins.length === 0"
                      @click="handleChange(item)"
                    >
                      <i class="menu-icon vh-saas-iconfont vh-saas-a-line-batchChangegroup"></i>
                      <span>批量换组</span>
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button
                      class="btn-menu"
                      type="text"
                      icon="menu-icon vh-iconfont vh-line-close"
                      @click="handleCancelChange(item)"
                    >
                      <span>取消</span>
                    </el-button>
                    <el-button
                      class="btn-menu"
                      type="text"
                      icon="menu-icon vh-saas-iconfont vh-saas-a-line-Ingroup"
                      @click="handleChangeGroup(2)"
                    >
                      <span>换组</span>
                    </el-button>
                  </template>
                </div>
              </div>
              <div class="split-card__bd" @click="handleHideDropdown()">
                <template v-if="item.isChange">
                  <el-checkbox-group v-model="needChangeList">
                    <el-checkbox
                      v-for="i in item.group_joins"
                      :key="i.account_id"
                      :label="i.account_id"
                    >
                      <div class="user-name" style="padding: 0">
                        <span class="leader" v-if="i.join_role == 20">组长</span>
                        {{ i.nick_name }}
                      </div>
                    </el-checkbox>
                  </el-checkbox-group>
                </template>
                <template v-else>
                  <span
                    class="user-name-tag"
                    v-for="u in item.group_joins"
                    :key="u.account_id"
                    @click.stop.prevent="handleOneUser(u)"
                  >
                    <div class="user-name">
                      <span class="leader" v-if="u.join_role == 20">组长</span>
                      {{ u.nick_name || '空' }}
                    </div>
                    <div
                      class="user-dropdown"
                      v-if="showItem == u && !['1', '3'].includes(u.join_role)"
                    >
                      <div @click="handleKickOut(u)">踢出小组</div>
                      <div @click="handleChangeGroupOne(u)">换组</div>
                      <div
                        v-if="u.join_role != 20 && u.device_type == 2 && u.device_status != 2"
                        @click="setLeader(item.id, u.account_id)"
                      >
                        设为组长
                      </div>
                    </div>
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 对话框:准备设置分组 -->
    <vmp-group-setting
      :show.sync="settingDialogVisible"
      @settingCancel="settingCancel"
    ></vmp-group-setting>

    <!-- 对话框:新增分组 -->
    <vmp-group-add :show.sync="addDialogVisible"></vmp-group-add>

    <!-- 对话框:小组公告 -->
    <vmp-group-notice :show.sync="noticeDialogVisible"></vmp-group-notice>

    <!-- 对话框:选择小组（用户换组） -->
    <vmp-group-choose
      :show.sync="chooseDialogVisible"
      @chooseGroupComplete="chooseGroupComplete"
    ></vmp-group-choose>
  </div>
</template>
<script>
  import VmpGroupSetting from './group-setting.vue';
  import VmpGroupAdd from './group-add.vue';
  import VmpGroupNotice from './group-notice.vue';
  import VmpGroupChoose from './group-choose.vue';
  import {
    useRoomBaseServer,
    useMsgServer,
    useGroupServer,
    useChatServer,
    useDocServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';

  export default {
    name: 'VmpGroupDiscussion',
    components: {
      VmpGroupSetting,
      VmpGroupAdd,
      VmpGroupNotice,
      VmpGroupChoose
    },
    data() {
      return {
        settingDialogVisible: false,
        addDialogVisible: false,
        noticeDialogVisible: false,
        chooseDialogVisible: false,
        checkStatus: false, // 是否正在批量分配中
        checkList: [], //批量分配选择的待分配的人员
        changeGroupFlag: 1, //1-待分配的换组，2-某个组的换组
        needChangeList: [], // 某个组选择要换组人员
        showItem: null,
        way: 1, //分组方式
        isInvitedId: '' // 演示人id(受邀请人Id)
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.msgServer = useMsgServer();
      this.chatServer = useChatServer();
      this.docServer = useDocServer();
    },
    computed: {
      userId() {
        return this.roomBaseServer.state.watchInitData?.join_info?.third_party_user_id;
      },
      panelShow() {
        return this.groupServer.state.panelShow;
      },
      // 0 未分组 1开始讨论 2已存在分组
      isOpenSwitch() {
        return this.roomBaseServer.state.interactToolStatus.is_open_switch;
      },
      isInGroup() {
        // 在小组中
        return !!this.groupServer.state.groupInitData?.isInGroup;
      },
      // 待分配人员列表
      waitingUserList() {
        return this.groupServer.state.waitingUserList;
      },
      // 已分组列表
      groupedUserList() {
        return this.groupServer.state.groupedUserList;
      },
      // 已分组列表中是否存在人员
      groupedUserExists() {
        for (const item of this.groupedUserList) {
          if (item.group_joins.length) {
            return true;
          }
        }
        return false;
      },
      // 当前的演示者Id
      presenterId() {
        return this.isInGroup
          ? this.groupServer.state.groupInitData.presentation_screen
          : this.roomBaseServer.state.interactToolStatus.presentation_screen;
      }
    },
    watch: {
      ['groupServer.state.panelShow'](val) {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitToggle', [val]));
      }
    },
    mounted() {
      this.initEvent();
      this.initData();
    },
    methods: {
      // 初始化事件
      initEvent() {
        // 发起端收到同意邀约演示
        this.groupServer.$on('VRTC_CONNECT_PRESENTATION_AGREE', msg => {
          // https://www.tapd.cn/58046813/bugtrace/bugs/view?bug_id=1158046813001005425
          // 已和产品确认，接受邀请不提示
          // if (msg.data.extra_params == this.userId) {
          //   this.$message({
          //     message: '对方已接受邀请',
          //     showClose: true,
          //     type: 'success',
          //     customClass: 'zdy-info-box'
          //   });
          // }
        });

        // 发起端收到拒绝邀请演示
        this.groupServer.$on('VRTC_CONNECT_PRESENTATION_REFUSED', msg => {
          // 如果申请人是自己, 或者自己不是主持人
          if (
            msg.data.room_join_id == this.userId ||
            this.roomBaseServer.state.watchInitData.join_info.role_name != 1
          ) {
            return;
          }
          let role = '';
          if (msg.data.room_role == 2) {
            role = '观众';
          } else if (msg.data.room_role == 4) {
            role = '嘉宾';
          }
          if (msg.data.extra_params == this.userId) {
            console.log('拒绝邀请', msg);
            this.$message({
              message: `${role}${msg.data.nick_name}拒绝了你的演示邀请`,
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
        });

        // 发起端收到结束演示成功消息
        this.groupServer.$on('VRTC_DISCONNECT_PRESENTATION_SUCCESS', msg => {
          if (this.presenterId === this.userId) {
            // 如果结束后演示者是自己，说明是演示权限回收
            // 通知文档重设笔刷, 后面可以考虑当前笔刷放到文档server中
            window.$middleEventSdk.event.send(boxEventOpitons(this.cuid, 'emitDocResetBrush'));
          }
          if (msg.sender_id != this.userId) {
            this.$message({
              message: '观众结束了演示',
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
        });
      },
      hiddenAll() {
        this.settingDialogVisible = false;
        this.groupServer.state.panelShow = false;
        this.addDialogVisible = false;
        this.noticeDialogVisible = false;
        this.chooseDialogVisible = false;
      },
      // 切换显示隐藏
      toggle() {
        this.addDialogVisible = false;
        this.noticeDialogVisible = false;
        this.chooseDialogVisible = false;
        if (this.isOpenSwitch === 0) {
          // 显示设置对话框
          this.groupServer.state.panelShow = false;
          this.settingDialogVisible = true;
        } else {
          this.settingDialogVisible = false;
          // 切换
          this.groupServer.state.panelShow = !this.groupServer.state.panelShow;
        }
      },
      async initData() {
        await this.groupServer.getWaitingUserList();
        await this.groupServer.getGroupedUserList();
      },
      async groupPresetImport() {
        try {
          const result = await this.groupServer.groupPresetImport();
          if (result && result.code === 200) {
            // 重新导入成功
            this.$message.success('重新导入成功');
            this.initData();
          } else {
            this.$message.error(result.msg || '重新导入失败');
          }
        } catch (ex) {
          this.$message.error(ex.messge || '重新导入出现异常');
        }
      },
      handleNotice() {
        this.noticeDialogVisible = true;
      },
      handleAdd() {
        this.addDialogVisible = true;
      },
      // 点击批量分配
      handleDispatch() {
        this.checkStatus = true;
      },
      // 取消批量分配
      handleCancelDispatch() {
        this.checkStatus = false;
        this.checkList = [];
      },
      // 换组(包括批量分配和批量换组),弹出选择对话框
      handleChangeGroup(flag) {
        this.changeGroupFlag = flag;
        this.chooseDialogVisible = true;
      },
      // 点击批量换组
      handleChange(data) {
        const idx = this.groupServer.state.groupedUserList.findIndex(item => {
          return item.id === data.id;
        });
        if (idx > -1) {
          const newData = Object.assign({}, data, { isChange: true });
          this.groupServer.state.groupedUserList.splice(idx, 1, newData);
        }
      },
      // 取消批量换组
      handleCancelChange(data) {
        const idx = this.groupServer.state.groupedUserList.findIndex(item => {
          return item.id === data.id;
        });
        if (idx > -1) {
          const newData = Object.assign({}, data, { isChange: false });
          this.groupServer.state.groupedUserList.splice(idx, 1, newData);
        }
      },
      // 换组
      handleChangeGroupSubmit: async function (selectGroup) {
        let exAccountIds = [];
        if (this.changeGroupFlag === 1) {
          exAccountIds = this.checkList;
        } else if (this.changeGroupFlag === 2) {
          exAccountIds = this.needChangeList;
        }
        if (exAccountIds.length == 0) {
          this.$message.warning('请选择待分配人员');
          return false;
        }
        if (!selectGroup) {
          this.$message.warning('请选择小组');
          return false;
        }
        try {
          const result = await this.groupServer.groupExchange(exAccountIds, selectGroup);
          if (result && result.code === 200) {
            // 换组成功
            if (this.changeGroupFlag === 1) {
              // 待分配换组
              this.checkList = [];
            } else {
              // 已有组换组
              this.needChangeList = [];
            }
            this.chooseDialogVisible = false;
          } else {
            this.$message.error(result.msg || '换组失败');
          }
        } catch (ex) {
          this.$message.error(ex.messge || '换组出现异常');
        }
      },
      // 点击某个用户，展开/折叠dropdown菜单
      handleOneUser(data) {
        if (data == this.showItem) {
          this.showItem = null;
        } else {
          this.showItem = data;
        }
      },
      // 踢出小组
      handleKickOut(u) {
        this.$confirm('踢出组员后，组员将回到待分配中，是否将此组员踢出小组?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
          //   type: 'warning'
        }).then(() => {
          this.chatServer
            .setKicked({
              room_id: this.roomBaseServer.state.watchInitData.interact.room_id,
              receive_account_id: u.account_id,
              status: 1,
              type: 1
            })
            .then(res => {
              this.groupServer.getWaitingUserList();
              this.groupServer.getGroupedUserList();
              console.log(res, 'groupEnd');
            })
            .catch(err => console.log(err));
        });
      },
      // 换组某一个人
      handleChangeGroupOne(u) {
        this.needChangeList = [u.account_id];
        this.handleChangeGroup(2);
      },
      // 隐藏观众的 dropdown菜单
      handleHideDropdown() {
        console.log('-------handleHideDropdown----');
        this.showItem = null;
      },
      // 设为组长
      setLeader(groupId, accountId) {
        this.$confirm('是否将此组员设为组长?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {
          this.groupServer.setLeader(groupId, accountId);
        });
      },
      // 进入小组
      handleEnterGroup: async function (groupId) {
        this.groupServer
          .groupEnter(groupId)
          .then(() => {
            this.groupServer.state.panelShow = false;
            console.log('[doc] 进入小组文档重置');
            // this.docServer.reset();
            //调用该接口后台会发送房间消息，后续处理逻辑在收到房间消息后处理
          })
          .catch(ex => {
            console.error(ex);
          });
      },
      // 退出小组
      exitGroup() {
        this.$confirm('退出小组后，您将返回主直播间，是否确定退出小组?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {
          this.groupServer.groupQuit().catch(ex => {
            console.error(ex);
          });
        });
      },
      // 解散
      handleDisband(id) {
        // TODO 国际化
        this.$confirm('解散后小组成员将全部回到主直播间，确定是否要解散小组?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(async () => {
            await this.groupServer.groupDisband(id);
            await this.roomBaseServer.getInavToolStatus();
          })
          .catch(() => {});
      },
      // 开始讨论
      handleStartDiscussion() {
        this.$confirm('开始讨论后，观众将进入小组直播间开始讨论，是否开始讨论?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
          //   type: 'warning'
        }).then(async () => {
          const { code, msg } = await this.groupServer.startDiscussion();
          if (code !== 200) {
            this.$message.error(msg);
          }
        });
      },
      // 结束讨论
      handleEndDiscussion() {
        this.$confirm('结束讨论后，所有小组成员将全部回到主直播间，确定结束讨论？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
          //   type: 'warning'
        }).then(() => {
          // 结束讨论
          this.groupServer.endDiscussion().then(() => {
            // 设置开始为未讨论状态
            useRoomBaseServer().setInavToolStatus('is_open_switch', 0);
            console.warn('结束讨论成功');
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitToggle', [false]));
          });
        });
      },
      // 是否含有主持人||助理
      isHave(arr) {
        const obj = arr.find(item => [1, 3, '1', '3'].includes(item.join_role));
        return !!obj;
      },
      // 分配设置主动取消回调
      settingCancel(way) {
        this.groupServer.state.panelShow = false;
        this.way = way;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitToggle', [false]));
      },
      // 结束讨论回调
      endDiscussion() {},
      // 选择小组后确定
      chooseGroupComplete(selectGroup) {
        this.handleChangeGroupSubmit(selectGroup);
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-discussion {
    height: 0;
    width: 0;
  }
  .vmp-group-workspace {
    position: absolute;
    top: 0;
    left: 60px;
    right: 309px;
    bottom: 0;
    width: calc(100% - 370px);
    box-sizing: border-box;
    color: #f4f4f4;
    display: flex;
  }

  .vmp-group-split {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    background-color: #2d2d2d;
    z-index: 10;
    .vmp-group-split__hd {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 24px 24px 0 24px;

      .split-op {
        flex: 1;
        text-align: right;

        .btn-group-op {
          background: transparent;
          border: 1px solid #ccc;
          color: #f4f4f4;
        }

        button.is-disabled {
          color: #666;
          border-color: #666;
        }
        button:not(.is-disabled):hover {
          border: 1px solid #fb3a32;
          color: #fb3a32;
        }
      }
    }
    .vmp-group-split__bd {
      flex: 1;
      overflow-y: auto;
      margin: 25px 17px 0;

      &::-webkit-scrollbar {
        /*滚动条*/
        width: 6px;
        background: transparent !important;
      }
      &::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        height: 50px;
        border-radius: 10px;
        background: #666 !important;
      }
      &::-webkit-scrollbar-track {
        background: transparent !important;
      }

      .split-card {
        width: 50%;
        vertical-align: top;
        padding: 0 7px;
        display: inline-block;
        box-sizing: border-box;

        .split-card__inner {
          height: 200px;
          background: #434343;
          border-radius: 4px;
          margin-bottom: 14px;

          .split-card__hd {
            padding: 9px 16px;
            border-radius: 4px 4px 0 0;
            border-bottom: 1px solid #525252;
            background: #434343;
            display: flex;
            flex-direction: row;
          }

          .split-card__title {
            font-size: 14px;
            font-weight: 400;
            color: #f4f4f4;
            line-height: 22px;

            .colFA9A32 {
              font-size: 14px;
              font-weight: 400;
              color: #fa9a32;
              line-height: 22px;
            }
          }
          .split-card__menus {
            flex: 1;
            text-align: right;
            font-size: 12px;

            .btn-menu {
              font-size: 12px;
              font-weight: 400;
              color: #f4f4f4;
              line-height: 22px;
              border: 0;

              .i {
                position: relative;
                top: 1px;
                padding-right: 2px;
              }
              &:hover {
                color: #fb3a32;
              }
            }
            .btn-menu--cancel {
              color: #fb3a32;
            }
            .btn-menu.is-disabled {
              color: #666;
            }
            .menu-icon {
              font-size: 12px;
              margin-right: 3px;
            }
          }

          .split-card__bd {
            padding: 10px 16px 10px;

            .el-checkbox {
              background: #525252 !important;
              border-radius: 4px;
              padding: 4px 8px;
              margin: 0 8px 8px 0;
              display: -webkit-inline-box;
              display: -ms-inline-flexbox;
              display: inline-flex;
              -webkit-box-pack: start;
              -ms-flex-pack: start;
              justify-content: flex-start;
              -webkit-box-align: self-start;
              -ms-flex-align: self-start;
              align-items: self-start;
              .el-checkbox__inner {
                width: 14px;
                height: 14px;
                border-radius: 2px;
                border: 1px solid #f4f4f4;
                background-color: transparent;
                margin-top: 2px;
              }
              .el-checkbox__input {
                display: inline-block;
                vertical-align: middle;
                line-height: 17px;
                height: 17px;
              }
              .el-checkbox__label {
                display: inline-block;
                vertical-align: middle;
                padding-left: 4px;
                font-size: 14px;
                line-height: 17px;
                height: 17px;
              }
            }

            .user-name-tag {
              display: inline-block;
              position: relative;

              .user-dropdown {
                position: absolute;
                border-radius: 4px;
                margin-top: 3px;
                padding: 5px 0;
                display: inline-block;
                left: 0;
                top: 20px;
                color: #666;
                font-size: 12px;
                z-index: 2;
                width: 96px;
                background: #ffffff;
                box-shadow: 0px 1px 9px 0px rgba(0, 0, 0, 0.2);
                border-radius: 4px;
                div {
                  padding: 6px 24px;
                }
                div:hover {
                  cursor: pointer;
                  background: #fb3a32;
                  color: white;
                }
              }
            }
            .user-name-tag--waiting {
            }
            .user-name {
              max-width: 106px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              font-size: 12px;
              color: #f4f4f4;
              cursor: pointer;
              background-color: #525252;
              padding: 4px 8px;
              border-radius: 4px;
              margin-right: 5px;

              .leader {
                width: 30px;
                height: 16px;
                background: #3562fa;
                border-radius: 0 5px;
                padding: 0 3px;
              }
            }
          }
        }
      }
    }
  }
</style>
