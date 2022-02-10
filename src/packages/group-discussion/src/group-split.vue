<template>
  <div class="vmp-group-split">
    <div class="vmp-group-split__hd">
      <span class="split-title">分组设置</span>
      <div class="split-op">
        <el-button
          type="default"
          size="small"
          :round="true"
          :disabled="isOpenSwitch != 1"
          @click="handleNotice"
        >
          小组公告
        </el-button>
        <el-button type="default" size="small" :round="true" @click="handleAdd">新增分组</el-button>
        <el-button
          v-if="isOpenSwitch == 2"
          type="default"
          size="small"
          :round="true"
          :disabled="!groupedUserExists"
          @click="handleStartDiscussion"
        >
          开始讨论
        </el-button>
        <el-button
          v-if="isOpenSwitch == 1"
          type="default"
          size="small"
          :round="true"
          @click="handleEndDiscussion"
        >
          结束讨论
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
              <span v-if="item.help && !isHave(item.group_joins)" class="colFA9A32">请求协助…</span>
            </div>
            <div class="split-card__menus">
              <template v-if="!item.isChange">
                <el-button v-if="isOpenSwitch == 1" class="btn-menu" type="text">
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
          <div class="split-card__bd" @click.stop="handleHideDropdown()">
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
</template>
<script>
  import { useRoomBaseServer, useMsgServer, useGroupServer, useChatServer } from 'middle-domain';

  export default {
    name: 'VmpGroupSplit',
    data() {
      return {
        checkStatus: false, // 是否正在批量分配中
        checkList: [], //批量分配选择的待分配的人员
        changeGroupFlag: 1, //1-待分配的换组，2-某个组的换组
        needChangeList: [], // 某个组选择要换组人员
        showItem: null
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
      this.msgServer = useMsgServer();
      this.chatServer = useChatServer();
      this.userId = this.roomBaseServer.state.watchInitData.join_info.third_party_user_id;
    },
    computed: {
      // 0 未分组 1开始讨论 2已存在分组
      isOpenSwitch() {
        return this.roomBaseServer.state.interactToolStatus.is_open_switch;
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
      }
    },
    mounted() {
      this.initEvents();
      this.initData();
    },
    methods: {
      async initData() {
        await this.groupServer.getWaitingUserList();
        await this.groupServer.getGroupedUserList();
      },
      initEvents() {
        // 监听文档消息
        this.msgServer.$onMsg('ROOM_MSG', this.listenRoomMsg);
      },
      // 使用具名消息，后面offMsg的时候使用
      // TODO 暂时没有offMsg事件，后面有的时候加上
      listenRoomMsg(msg) {
        console.log('[group] ------ROOM_MSG-----房间消息：', msg);
        try {
          if (typeof msg === 'string') {
            msg = JSON.parse(msg);
          }
          if (typeof msg.context === 'string') {
            msg.context = JSON.parse(msg.context);
          }
          if (typeof msg.data === 'string') {
            msg.data = JSON.parse(msg.data);
          }
        } catch (ex) {
          console.log('消息转换错误：', ex);
          return;
        }
        if (msg.data.event_type === 'group_room_create') {
          // 分组创建完成消息
          if (msg.sender_id === this.userId) {
            // 0 新增   1 初始化
            if (msg.data.is_append === 1) {
              // this.groupServer.state.status = 'grouping';
              // this.getWaitUserList();
            }
            // this.getUserList();
          }
          // this.getGroupList();
        }
      },
      handleNotice() {
        this.$parent.noticeDialogVisible = true;
      },
      handleAdd() {
        this.$parent.addDialogVisible = true;
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
        this.$parent.chooseDialogVisible = true;
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
              this.checkList = [];
            } else {
              this.needChangeList = [];
            }
            this.$parent.chooseDialogVisible = false;
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
        this.showItem = null;
      },
      // 设为组长
      setLeader(groupId, accountId) {
        this.groupServer.setLeader(groupId, accountId);
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
          .then(() => {
            this.groupServer.groupDisband(id);
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
        }).then(() => {
          this.groupServer.startDiscussion();
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
          this.groupServer.endDiscussion().then(() => {
            this.$emit('endDiscussion');
          });
        });
      },
      // 是否含有主持人||助理
      isHave(arr) {
        const obj = arr.find(item => [1, 3, '1', '3'].includes(item.join_role));
        return !!obj;
      }
    }
  };
</script>
<style lang="less">
  .vmp-group-split {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    background-color: #2d2d2d;
    z-index: 100;
  }

  .vmp-group-split__hd {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 24px 24px 0 24px;

    .split-op {
      flex: 1;
      text-align: right;

      button.is-disabled {
        color: #666;
        border-color: #666;
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
                background: #fc5659;
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
</style>
