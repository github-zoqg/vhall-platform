<template>
  <div class="vmp-member-list">
    <!--分组名称-->
    <div class="vmp-member-list__group-name" v-if="isInGroup">
      <i class="iconfont icona-icon_fenzutaolun1x"></i>
      <span class="pr_top">{{ roomBaseServer.state.groupInitData.name }}</span>
    </div>
    <!--成员区域-->
    <div class="vmp-member-list__container">
      <div class="vmp-member-list__container__scroll" ref="scroll">
        <!--全部成员-->
        <template v-if="tabIndex === 1">
          <div class="member-list__all-tab">
            <div
              v-if="searchEmpty"
              class="empty-container"
              :style="{ 'padding-top': `${this.emptyContainerPaddingTop}px` }"
            >
              <span class="iconzanwusousuo iconfont"></span>
              <p>很抱歉，没有搜索到您要找的人</p>
            </div>
            <template v-else v-infinite-scroll="loadMore" style="overflow: auto">
              <template v-for="user in onlineUsers">
                <member-item
                  :key="user.account_id"
                  v-if="![1, '1'].includes(user.is_kicked)"
                  @operateUser="handleOperateUser"
                  @interactiveOperate="handleInteractiveOperate"
                  :user-info="user"
                  :role-name="roleName"
                  :is-in-group="isInGroup"
                  :mode="mode"
                  :member-options="memberOptions"
                  :current-speaker-id="docPermissionId"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
        <!--举手的成员-->
        <template v-if="tabIndex === 2">
          <div class="member-list__apply-tab">
            <div
              v-if="!applyUsers.length"
              class="empty-container"
              :style="{ 'padding-top': `${this.emptyContainerPaddingTop}px` }"
            >
              <span class="iconzanwujushou iconfont"></span>
              <p>暂无人举手</p>
            </div>
            <template v-else>
              <template v-for="user in applyUsers">
                <member-item
                  :key="user.account_id"
                  v-if="![1, '1'].includes(user.is_kicked)"
                  @operateUser="handleOperateUser"
                  @interactiveOperate="handleInteractiveOperate"
                  :user-info="user"
                  :role-name="roleName"
                  :is-in-group="isInGroup"
                  :mode="mode"
                  :member-options="memberOptions"
                  :current-speaker-id="docPermissionId"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
        <!--受限制的成员-->
        <template v-if="tabIndex === 3">
          <div class="member-list__limit-tab">
            <div
              v-if="!limitedUsers.length"
              class="empty-container"
              :style="{ 'padding-top': `${this.emptyContainerPaddingTop}px` }"
            >
              <span class="iconzanwuchengyuan iconfont"></span>
              <p>没有禁言或者踢出的成员</p>
            </div>
            <template v-else>
              <template v-for="user in limitedUsers">
                <member-item
                  :key="user.account_id"
                  @operateUser="handleOperateUser"
                  @interactiveOperate="handleInteractiveOperate"
                  :user-info="user"
                  :role-name="roleName"
                  :is-in-group="isInGroup"
                  :mode="mode"
                  :member-options="memberOptions"
                  :current-speaker-id="docPermissionId"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
      </div>
    </div>
    <!--底部操作区域-->
    <div class="vmp-member-list__operate-container">
      <!--信息面板-->
      <div class="vmp-member-list__operate-container__info-panel">
        <i class="iconfont iconzaixianrenshu"></i>
        <span class="info-panel__online-num">{{ totalNum | numberCompression }}人在线</span>
        <span class="info-panel__refresh-btn" @click="refreshList">刷新</span>
        <div class="info-panel__allow-raise-hand" v-if="mode !== 6">
          <span class="info-panel__allow-raise-hand__switch-title">允许举手</span>
          <el-switch
            v-model="allowRaiseHand"
            :width="32"
            @change="onSwitchAllowRaiseHand"
            active-color="#fc5659"
          ></el-switch>
        </div>
      </div>
      <!--按钮面板-->
      <div class="vmp-member-list__operate-container__button-panel">
        <div class="button-panel__btn-box">
          <ul>
            <li
              @click="switchToTab(1)"
              class="button-panel__btn-box__tab-item"
              :class="tabIndex === 1 ? 'active' : ''"
            >
              全部
            </li>
            <li
              @click="switchToTab(2)"
              :class="[
                'button-panel__btn-box__tab-item',
                raiseHandTip ? 'raise-hand' : '',
                tabIndex === 2 ? 'active' : ''
              ]"
            >
              举手
            </li>
            <li
              @click="switchToTab(3)"
              class="button-panel__btn-box__tab-item"
              :class="tabIndex === 3 ? 'active' : ''"
            >
              受限
            </li>
          </ul>
          <div
            v-show="tabIndex === 1"
            @click="toggleSearchTab"
            class="button-panel__btn-box__tab-item search-btn"
          >
            找人
          </div>
        </div>
      </div>
      <div
        v-show="tabIndex === 1 && searchShow"
        class="vmp-member-list__operate-container__search-panel"
      >
        <input
          type="text"
          v-model.trim="searchUserInput"
          class="search-panel__input"
          placeholder="输入成员名称…"
        />
        <a href="javascript:;" @click="clearSearchInput" class="search-panel__clear-btn"></a>
        <span class="search-panel__confirm" @click="doSearch">确定</span>
      </div>
    </div>
  </div>
</template>

<script>
  import memberItem from './components/member-item';
  import * as _ from 'lodash';
  import {
    useMicServer,
    useRoomBaseServer,
    useMemberServer,
    useInteractiveServer,
    useMsgServer
  } from 'middle-domain';
  export default {
    name: 'VmpMemberList',
    components: {
      memberItem
    },
    filters: {
      //数值压缩
      numberCompression(num) {
        if (num < 10000) {
          return num;
        } else {
          const n = Math.floor(num / 10000);
          let l = Math.floor((num % 10000) / 1000);
          l = l === 0 ? '' : '.' + l;
          return n + l + '万';
        }
      }
    },
    data() {
      return {
        //成员列表组件配置
        memberOptions: {},
        //当前角色
        roleName: '',
        //当前登录的用户
        userId: '',
        onlineUsers: [],
        //申请人数
        applyUsers: [],
        //受限人数
        limitedUsers: [],
        //上麦人员列表 todo 这个需要从server取，没法从props获取
        speakerList: [],
        //房间号
        roomId: '',
        //mod 6代表分组活动
        mode: 3,
        /** 搜索输入框相关 */
        //是否显示搜索输入框
        searchShow: false,
        //未能找到搜索的人
        searchEmpty: false,
        // 输入的成员名称
        searchUserInput: '',
        //
        /** 搜索输入框结束 */
        // 容器内边距
        emptyContainerPaddingTop: 10,
        //todo domain里取 当前主讲人的id
        currentSpeakerId: '',
        //当前的激活的tab
        tabIndex: 1,
        //总人数
        totalNum: 0,
        //todo 是否允许举手
        allowRaiseHand: false,
        // 举手提示
        raiseHandTip: false,
        //分页配置
        pageConfig: {
          page: 0,
          limit: 10
        },
        //当前的分组活动id todo 待求证，未在房间信息中找到
        groupId: '',
        // 举手列表定时器列表
        handsUpTimerList: {}
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
      this.micServer = useMicServer();
      this.memberServer = useMemberServer();
      this.interactiveServer = useInteractiveServer();
    },
    beforeDestroy() {},
    mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据
      this.initViewData();
      //开始初始化流程
      this.init();
      this.listenEvent();
    },
    computed: {
      //是否在分组里
      isInGroup() {
        const { state = {} } = this.roomBaseServer;
        const { groupInitData = {} } = state;
        return groupInitData.isInGroup;
      },
      //主讲人ID
      docPermissionId() {
        const { state = {} } = this.roomBaseServer;
        const { groupInitData = {} } = state;
        return groupInitData.doc_permission;
      },
      //活动状态(直播未开始，已开始，已结束)
      liveStatus() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { webinar = {} } = watchInitData;
        return webinar.type;
      }
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.memberOptions = widget.options;
        }
      },
      //初始化视图数据
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        console.log(this.roomBaseServer.state);
        this.mode = webinar.mode;
        this.roleName = join_info.role_name;
        this.userId = join_info.user_id;
        this.roomId = interact.room_id;
        this.allowRaiseHand = this.micServer.state.isAllowhandup;
      },
      //统一初始化方法
      init() {
        this.getOnlineUserList();
      },
      listenEvent() {
        this.msgServer.$on('endLive', () => {
          this.allowRaiseHand = false;
        });
        // 用户申请上麦
        this.micServer.$on('vrtc_connect_apply', msg => {
          if (this.tabIndex !== 2) {
            this.raiseHandTip = true;
          }
          // 如果申请人是自己
          if (msg.room_join_id == this.userId) {
            return;
          }
          const user = {
            account_id: msg.room_join_id,
            avatar: msg.avatar,
            device_status: msg.device_status,
            device_type: msg.device_type,
            nickname: msg.nick_name,
            role_name: msg.room_role
          };
          this.applyUsers.unshift(user);

          this.applyUsers = _.uniqBy(this.applyUsers, 'account_id'); // 去重
          this.changeUserStatus(user.account_id, this.onlineUsers, {
            isApply: true
          });
          // 申请30秒后从列表去掉
          clearTimeout(this.handsUpTimerList[user.account_id]);
          delete this.handsUpTimerList[user.account_id];
          this.handsUpTimerList[user.account_id] = window.setTimeout(() => {
            clearTimeout(this.handsUpTimerList[user.account_id]);
            delete this.handsUpTimerList[user.account_id];
            this.changeUserStatus(user.account_id, this.onlineUsers, {
              isApply: false
            });
            this.applyUsers = this.applyUsers.filter(u => u.account_id != user.account_id);
            if (!this.applyUsers.length) {
              this.raiseHandTip = false;
            }
          }, 30000);
          //todo 信令通知其他组件
          this.$emit('memberUpdata');
        });

        // 用户取消申请上麦
        this.micServer.$on('vrtc_connect_apply_cancel', msg => {
          this.raiseHandTip = false;
          this._deleteUser(msg.room_join_id, this.applyUsers);
          this.changeUserStatus(msg.room_join_id, this.onlineUsers, {
            isApply: false
          });
          clearTimeout(this.handsUpTimerList[msg.room_join_id]); // 取消下麦清除定时器
          delete this.handsUpTimerList[msg.room_join_id];
        });
        // 同意用户申请上麦
        this.micServer.$on('vrtc_connect_agree', msg => {
          this.raiseHandTip = false;
        });

        // 用户拒绝上麦邀请
        this.micServer.$on('vrtc_connect_invite_refused', msg => {
          // 如果申请人是自己
          if (msg.room_join_id == this.userId || this.roleName != 1) {
            return;
          }
          let role = '';
          if (msg.room_role == 2) {
            role = '观众';
          } else if (msg.room_role == 4) {
            role = '嘉宾';
          }
          if (msg.extra_params == this.userId) {
            this.$message.warning({
              message: `${role}${msg.nick_name}拒绝了你的上麦邀请`
            });
          }
        });
        // // 互动连麦成功
        this.micServer.$on('vrtc_connect_success', msg => {
          this.changeUserStatus(msg.room_join_id, this.onlineUsers, {
            isApply: false,
            is_speak: 1
          });
          if (msg.room_join_id == this.userId && msg.room_role == 2) {
            return;
          }
          if (this.isInteract !== 1 && msg.room_role == 1) {
            this.$message.success({ message: '直播发起成功' });
            return;
          }
          if (msg.room_join_id == this.userId) {
            this.$message.success({ message: '您已上麦' });
          } else {
            msg.room_role != 2 && this.$message.success({ message: `${msg.nick_name}已上麦` });
          }
          clearTimeout(this.handsUpTimerList[msg.room_join_id]); // 取消下麦清楚定时器
          delete this.handsUpTimerList[msg.room_join_id];
          //
        });
        // 互动连麦断开成功
        this.micServer.$on('vrtc_disconnect_success', msg => {
          this.changeUserStatus(msg.target_id, this.onlineUsers, {
            is_speak: 0,
            isApply: false
          });
          console.log('>>>>>333332', msg, this.onlineUsers, this.applyUsers);
          if (msg.target_id == this.userId) {
            this.$message.success({ message: '您已下麦' });
            return;
          }
          // 当前用户ID,解决俩次触发vrtc_connect_success会提示两次下麦消息
          if (this.LocalCatchTarget_id != msg.target_id) {
            this.LocalCatchTarget_id = msg.target_id;
            if (msg.room_role != 2) {
              this.$message.success({ message: `${msg.nick_name}已下麦` });
            }
            setTimeout(() => {
              this.LocalCatchTarget_id = null;
            }, 3000);
          }
          if (this.applyUsers.length > 0) {
            const deleteIndex = this.applyUsers.findIndex(item => item.account_id == msg.target_id);
            console.log(
              '>>>aaa10',
              this.applyUsers,
              this.applyUsers[0].account_id == msg.target_id,
              deleteIndex
            );

            if (deleteIndex >= 0) {
              this.applyUsers.splice(deleteIndex, 1);
            }
            console.log('>>>aaa1', this.applyUsers);
          }
        });
        // 互动设置主讲人
        this.micServer.$on('vrtc_speaker_switch', msg => {
          this.currentSpeakerId = msg.room_join_id;
        });

        // 加入房间
        this.msgServer.$on('Join', msg => {
          // 上线的人是自己，不做操作
          if (msg.sender_id == this.userId) {
            return;
          }

          let index = this._getUserIndex(msg.sender_id, this.onlineUsers);
          //todo 这里暂时没有$store,需要确认
          this.totalNum = this.isInGroup
            ? msg.uv
            : msg.uv -
              (this.roomBaseServer.state.groupInitData.discussState
                ? this.$store.getters.getAllState('groupUsersNumber')
                : 0);

          if (index >= 0) {
            return;
          }
          // 在线人数大于200不再添加到列表里，只能加载更多
          if (this.totalNum > 200) {
            return;
          }
          // 隐身模式登录
          if (msg.data.hide) {
            return;
          }
          // 从上麦人员列表中获取加入房间着是否上麦
          const speakIndex = this._getUserIndex(msg.sender_id, this.speakerList);
          const { context } = msg;
          // 是分组直播 主持人/助理在主房间,小组内观众上线
          if (this.mode === 6) {
            if (!this.isInGroup && context.groupInitData.isInGroup) {
              return false;
            }
          }
          const user = {
            account_id: msg.sender_id,
            avatar: context.avatar,
            device_status: context.device_status,
            device_type: context.device_type,
            is_banned: Number(context.is_banned),
            nickname: context.nick_name,
            role_name: context.role_name,
            is_speak: speakIndex >= 0 ? 1 : 0
          };
          this.onlineUsers.push(user);
          this.onlineUsers = this.memberServer._sortUsers(this.onlineUsers);
          setTimeout(() => {
            this.$refs.scroll.refresh();
          }, 100);
          if (msg.context.role_name == 4) {
            if (msg.sender_id == this.userId) {
              return;
            }
            this.$message.success({ message: `${msg.context.nick_name}加入房间` });
          }
        });
        // 分组成员上线身份添加
        this.msgServer.$on('group_join_info', msg => {
          // 是自己 && 不在分组中
          if (msg.sender_id == this.userId && !this.groupInitData.isInGroup) return false;
          this.onlineUsers.forEach(item => {
            if (item.account_id == msg.sender_id) {
              Object.assign(item, {
                account_id: msg.sender_id,
                is_banned: msg.is_banned,
                role_name: msg.join_role
                // is_speak: speakIndex >= 0 ? 1 : 0,
              });
            }
          });
        });
        // 离开房间
        this.msgServer.$on('Leave', msg => {
          if (msg.context.isAuthChat) return; // 如果是聊天审核页面不做任何操作
          this.totalNum = this.isInGroup
            ? msg.uv
            : msg.uv -
              (this.roomBaseServer.state.groupInitData.discussState
                ? this.$store.getters.getAllState('groupUsersNumber')
                : 0);
          this.totalNum < 0 && (this.totalNum = 0);
          this._deleteUser(msg.sender_id, this.onlineUsers, 'leave');
          this._deleteUser(msg.sender_id, this.applyUsers); // 14273
          setTimeout(() => {
            this.$refs.scroll.refresh();
          }, 50);
          if (msg.context.role_name == 1 && this.roleName != 1) {
            this.$message.warning({ message: '主持人暂时离开了页面，请稍等...' });
          }
          if (msg.context.role_name == 4) {
            this.$message.warning({ message: `${msg.context.nick_name}离开房间` });
          }
        });
        // 设备检测
        this.micServer.$on('vrtc_connect_device_check', msg => {
          if (msg.device_type != 2) {
            this.changeUserStatus(msg.room_join_id, this.onlineUsers, {
              device_type: msg.device_type
            });
          }
          if (msg.device_status != 0) {
            this.changeUserStatus(msg.room_join_id, this.onlineUsers, {
              device_status: msg.device_status
            });
          }
        });
        // 结束直播
        this.msgServer.$on('live_over', () => {
          setTimeout(() => {
            this.refreshList();
          }, 1000);
        });
        // 禁言某个用户
        this.msgServer.$on('disable', msg => {
          this.changeUserStatus(msg.data.target_id, this.onlineUsers, {
            is_banned: 1
          });
          this.changeUserStatus(msg.data.target_id, this.limitedUsers, {
            is_banned: 1
          });
          this.changeUserStatus(msg.data.target_id, this.applyUsers, {
            is_banned: 1
          });
          // 禁言并且是举手列表
          if (this.tabIndex === 2) {
            this._deleteUser(msg.data.target_id, this.applyUsers);
          }
        });
        // 取消禁言某个用户
        this.msgServer.$on('permit', msg => {
          this.changeUserStatus(msg.data.target_id, this.onlineUsers, {
            is_banned: 0
          });
          this.changeUserStatus(msg.data.target_id, this.limitedUsers, {
            is_banned: 0
          });
          this.changeUserStatus(msg.data.target_id, this.applyUsers, {
            is_banned: 0
          });
          this.limitedUsers.forEach((item, index) => {
            if (item.account_id == msg.data.target_id) {
              this.limitedUsers.splice(index, 1);
            }
          });
        });
        // 在聊天列表里提出
        this.msgServer.$on('kicked_in_chat', msg => {
          if (msg.nextStatus) {
            this._deleteUser(msg.accountId, this.onlineUsers);
            this._deleteUser(msg.accountId, this.applyUsers);
          } else {
            // 取消踢出只能在受限列表操作
            this.getLimitUserList();
          }
          this.refreshList();
        });
        // 主持人|助理进入小组
        this.msgServer.$on('group_join_change', async e => {
          if (e.sender_id == this.userId && [1, 3, '1', '3'].includes(this.roleName)) {
            // 进入小组
            if (e.group_ids[0] == 0) {
              setTimeout(() => {
                this.onlineUsers = [];
                this.getOnlineUserList();
              }, 1000);
            }
            // 返回主房间
            if (e.group_ids[1] == 0) {
              if (sessionStorage.getItem('host_uid').includes(e.sender_id)) {
                this.onlineUsers = [];
                this.getOnlineUserList();
              }
            }
          }
        });
        // 分组-开始讨论
        this.msgServer.$on('group_switch_start', e => {
          this.onlineUsers = [];
          this.getOnlineUserList();
        });
        // 分组-开始讨论
        this.msgServer.$on('group_msg_created', e => {
          this.onlineUsers = [];
          this.getOnlineUserList();
        });
        // 分组-结束讨论
        this.msgServer.$on('group_switch_end', e => {
          this.onlineUsers = [];
          this.getOnlineUserList();
        });
        // 用户拒绝邀请演示
        this.micServer.$on('vrtc_connect_presentation_refused', msg => {
          // 如果申请人是自己
          if (msg.room_join_id == this.userId || this.roleName != 1) {
            return;
          }
          let role = '';
          if (msg.room_role == 2) {
            role = '观众';
          } else if (msg.room_role == 4) {
            role = '嘉宾';
          }
          if (msg.extra_params == this.userId) {
            this.$message.warning({
              message: `${role}${msg.nick_name}拒绝了你的演示邀请`
            });
          }
        });
        // 用户主动结束演示
        this.micServer.$on('vrtc_disconnect_presentation_success', e => {
          if (e.sender_id != this.userId) {
            this.$message.warning('观众结束了演示');
          }
        });
        // 重新获取最新groupInitData
        this.msgServer.$on('changeGroupInitData', e => {
          this.groupInitData = e;
          console.log(e, '进入小组>>>>>>>>>>>>>>>>>>>>>>>>>>');
        });
        // 踢出小组
        this.msgServer.$on('room_group_kickout', e => {
          this.onlineUsers = [];
          this.getOnlineUserList();
        });
        // 主房间人员变动
        this.msgServer.$on('main_room_join_change', async msg => {
          // 必须在主房间
          if (!this.roomBaseServer.state.groupInitData.isInGroup) {
            //todo 需要替换这里，中台没有$store
            this.totalNum = msg.uv - this.$store.getters.getAllState('groupUsersNumber');
            // 如果sender_id==自己
            if (msg.sender_id == this.userId) {
              this.totalNum++;
            }
            if (msg.data.isJoinMainRoom) {
              const flag = this.onlineUsers.find(item => item.account_id == msg.sender_id);
              if (flag) return false;
              this.onlineUsers.push({
                nickname: msg.nickname,
                is_banned: msg.isBanned,
                account_id: msg.accountId,
                role_name: msg.role_name == 20 ? 2 : msg.role_name,
                device_type: msg.device_type
              });
            } else {
              this.onlineUsers.forEach((item, index) => {
                if (item.account_id === msg.accountId) {
                  this.onlineUsers.splice(index, 1);
                }
              });
            }
            console.log(msg, 'MAIN_ROOM_JOIN_CHANGE');
          }
        });
      },
      //获取在线人员列表
      getOnlineUserList(pos) {
        const { getOnlineUserList } = this.memberServer;
        const data = {
          room_id: this.roomId,
          pos: pos || (this.pageConfig.page <= 0 ? 0 : 10 * this.pageConfig.page),
          limit: this.pageConfig.limit
        };

        //如果存在输入搜索人员的值
        if (this.searchUserInput) {
          Object.assign(data, { nickname: this.searchUserInput });
        }
        getOnlineUserList(data).then(res => {
          if (res.code === 200) {
            this.onlineUsers = this.memberServer.state.onlineUsers || [];
            //在线总人数
            this.totalNum = this.memberServer.state.totalNum;
          }
        });
      },
      /**
       * 改变在线人员列表的状态
       */
      changeUserStatus(accountId, list, obj) {
        console.log('更改上麦状态', accountId, list, obj);
        const item = list.find(item => item.account_id === accountId);
        if (!item) {
          return;
        }
        const index = list.findIndex(item => item.account_id === accountId);
        if (index !== -1) {
          Object.assign(item, obj);
          this.$set(list, index, item);
        }
      },
      //获取受限人员列表
      async getLimitUserList() {
        const { getMutedUserList, getKickedUserList } = this.memberServer;
        const data = {
          room_id: this.roomId,
          pos: 0,
          limit: 100
        };
        try {
          const bannedList = await getMutedUserList(data);
          const kickedList = this.isInGroup
            ? { data: { list: [] } }
            : await getKickedUserList(data);
          const list = bannedList.data.list.concat(kickedList.data.list);
          const hash = {};
          this.limitedUsers = list.reduce((preVal, curVal) => {
            !hash[curVal.account_id] && (hash[curVal.account_id] = true && preVal.push(curVal));
            return preVal;
          }, []);
        } catch (error) {
          console.error('获取受限人员列表接口错误', error);
        }
      },
      //刷新在线人数
      refreshList() {
        if (this.tabIndex === 3) {
          this.switchToTab(3);
        }
        this.pageConfig.page = 0;
        this.searchUserInput = '';
        this.getOnlineUserList();
      },
      //切换允许举手状态
      onSwitchAllowRaiseHand(status) {
        if (this.liveStatus !== 1) {
          this.allowRaiseHand = false;
          this.$message.error('活动尚未开始');
          return;
        }
        const params = {
          room_id: this.roomId,
          status: status ? 1 : 0
        };

        //todo 待micServer这边完善方法
        this.micServer
          .setHandsUp(params)
          .then(res => {
            console.log(res);
            //todo 上报埋点
            this.$message.success({ message: '设置成功' });
          })
          .catch(err => {
            this.allowRaiseHand = false;
            console.log('举手状态变更失败', err);
          });
      },
      //切换聊天搜索框显示状态
      toggleSearchTab() {
        this.searchShow = !this.searchShow;
      },
      //切换至某个tab
      switchToTab(index) {
        this.tabIndex = index;
        //清空输入的人员筛选
        this.searchUserInput = '';
        if (index === 2) {
          this.raiseHandTip = false;
        } else if (index === 3) {
          this.getLimitUserList();
        }
        //todo scroll调整
      },
      //清空人员搜索
      clearSearchInput() {
        this.searchUserInput = '';
        this.searchShow = false;
        this.pageConfig.page = 0;
        this.getOnlineUserList();
      },
      //按条件进行搜索
      doSearch() {
        if (['', null, void 0].includes(this.searchUserInput)) {
          return;
        }
        //todo 埋点上报
        this.pageConfig.page = 0;
        this.getOnlineUserList();
      },
      //响应人员操作
      handleOperateUser({ type = '', params = {} }) {
        console.log(type, params);
        const { account_id = '', is_kicked, is_banned } = params;
        switch (type) {
          case 'setBanned':
            this.setBanned(account_id, is_banned);
            break;
          case 'setKicked':
            this.setKicked(account_id, is_kicked);
            break;
          case 'setSpeaker':
            this.setSpeaker(account_id);
            break;
          case 'setLeader':
            this.setLeader(account_id);
            break;
          case 'inviteMic':
            this.inviteMic(account_id);
            break;
          default:
            break;
        }
      },
      //响应互动操作
      handleInteractiveOperate({ type = '', params = {} }) {
        const { isApply = false, account_id = '' } = params;
        switch (type) {
          case 'upMic':
            this.upMic(isApply, account_id);
            break;
          case 'downMic':
            this.downMic(account_id);
            break;
          case 'myPresentation':
            this.myPresentation(account_id);
            break;
          case 'agreeUpMic':
            this.agreeUpMic(account_id);
            break;
          default:
            break;
        }
      },
      /**
       * @description: 同意上麦
       * @param accountId {String} 用户ID
       * @return:
       */
      agreeUpMic(accountId) {
        const params = {
          room_id: this.roomId,
          receive_account_id: accountId
        };
        //todo 待联调，domain的可能暂时不可用
        this.micServer
          .hostAgreeApply(params)
          .then(res => {
            console.log(res);
            this._deleteUser(accountId, this.applyUsers);
          })
          .catch(err => {
            console.log('allow speak fail ::', err);
          });
      },
      /**
       * 邀请上麦 / 同意上麦
       */
      upMic(isApply, accountId) {
        if (this.liveStatus !== 1) {
          this.$message.error('活动还未开始');
          return;
        }

        if (isApply) {
          this.agreeUpMic(accountId);
        } else {
          if (this.userId === accountId) {
            // 主持人自己上麦 todo 可能是信令或者直接移除
            // EventBus.$emit('applyByHost');
          } else {
            //todo 待domain micServer完善这部分
            this.micServer
              .inviteMic({
                receive_account_id: accountId
              })
              .then(res => {
                console.warn(res, '邀请上麦');
                if (res.code == 200) {
                  //todo 这里需要上报埋点
                  this.$message.success({ message: '邀请发送成功' });
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(err => {
                this.$message.error(err.msg);
              });
          }
        }
      },
      //用户下麦
      downMic(accountId) {
        const data = {
          room_id: this.roomId,
          receive_account_id: accountId
        };
        const request = this.micServer
          .userSpeakOff(data)
          .then(res => {
            //todo 埋点上报
            return res;
          })
          .catch(error => {
            this.$message.error(error.msg);
          });
        if (this.isInGroup) {
          this.$confirm('下麦后，演示将自动结束，是否下麦？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
            // type: 'info',
            // center: true
          }).then(() => {
            request();
          });
        } else {
          request();
        }
      },
      // 我要演示
      myPresentation(accountId) {
        if (this.currentSpeakerId === accountId) {
          this.$message.warning('正在演示中');
          return false;
        }
        // 设置主讲人
        this.$confirm('演示后，您可使用小组中的白板、文档、桌面共享功能，是否要演示？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        }).then(() => {
          this.$fetch('presentation', {
            room_id: this.roomBaseServer.state.watchInitData.interact.room_id
          })
            .then(res => {
              console.log(res, 'presentation');
            })
            .catch(err => {
              this.$message.warning(err.msg);
            });
        });
      },
      //获取插播和桌面共享流信息
      /**
       *  获取插播和桌面共享的流信息
       *  @returns { object } [{streaming: Boolean, streamId: streamId, accountId: accountId, streamType: streamType, remoteUsers: [], localUser: {}  }]
       */
      getDesktopAndInStreamInfo() {
        const info = {
          streaming: false,
          streamId: '',
          streamType: '',
          accountId: '',
          remoteUsers: [],
          localUser: {}
        };
        const inavInfo = this.interactiveServer.getRoomInfo();
        console.log('wwwwwwwww', inavInfo);
        const users = inavInfo.remote.users.concat(inavInfo.local.user || {});
        users.forEach(u => {
          // 判断一下有没有人用插播或桌面
          u.streams.forEach(stream => {
            const obj = stream.attributes ? JSON.parse(stream.attributes) : {}; // 插播再2个地方存储
            if (stream.streamType == 3 || stream.streamType == 4 || obj.stream_type == 4) {
              info.streaming = true;
              info.streamId = stream.streamId;
              info.streamType = obj.stream_type || stream.streamType;
              info.accountId = u.accountId;
              if (obj.stream_type == 4 || stream.streamType == 4) {
                info.isInsterStream = true;
              }
            }
          });
        });
        info.remoteUsers = inavInfo.remote.users;
        info.localUser = inavInfo.local.user;
        return info;
      },
      /**
       * 设置主讲人
       * @param {Number | String} accountId 用户ID
       * @Function void()
       */
      setSpeaker(accountId, setMainScreen = true) {
        if (accountId) {
          const streamInfo = this.getDesktopAndInStreamInfo();
          const users = streamInfo.remoteUsers.concat(streamInfo.localUser);
          const mainScreenUser = users.find(u => u.accountId === accountId) || { streams: [] };
          const mainScreenStream =
            mainScreenUser.streams.find(s => [2, '2'].includes(s.streamType)) || {};
          if (!mainScreenStream.streamId) {
            this.$message.error('设置主讲人失败，请刷新后重试');
            return;
          }
        }
        if (setMainScreen) {
          this.interactiveServer
            .setMainScreen({
              receive_account_id: accountId || this.accountId
            })
            .then(res => {
              console.log('setmainscreen success ::', res);
            })
            .catch(err => {
              console.log('setmainscreen failed ::', err);
            });
        }
        return this.interactiveServer
          .setSpeaker({
            receive_account_id: accountId
          })
          .then(res => {
            console.log('setSpeaker success ::', res);
          })
          .catch(err => {
            console.log('setSpeaker failed ::', err);
          });
      },
      //邀请上麦
      inviteMic(accountId = '') {
        if (accountId === this.currentSpeakerId) {
          return;
        }
        const params = { room_id: this.roomId, receive_account_id: accountId, type: 1 };
        return this.memberServer
          .inviteUserToInteract(params)
          .then(res => {
            console.log(res, 'v3InviteMic');
            if (res.code == 200) {
              if (!['', null, void 0].includes(accountId) && accountId === this.userId) {
                // this.$message.success('邀请演示发送成功')
              } else {
                this.$message.success('邀请演示发送成功');
              }
            }
          })
          .catch(err => {
            this.$message.warning(err.msg);
          });
      },
      //设为组长 todo 这里接口有点问题，需要协调完善一下分组讨论server
      setLeader(accountId = '') {
        const params = {
          room_id: this.roomId,
          leader_account_id: accountId,
          group_id: this.groupId
        };
        this.memberServer
          .setGroupLeader(params)
          .then(res => {
            this.onlineUsers.forEach(item => {
              if ([20, '20'].includes(item.role_name)) {
                item.role_name = 2;
              }
              if (item.account_id === accountId) {
                item.role_name = 20;
              }
            });
            console.log(res, 'setLeader');
          })
          .catch(err => console.log(err));
      },
      /**
       * 禁言/取消禁言
       * todo 需检查，这里似乎没有更改列表人员状态
       */
      setBanned(accountId, isBanned) {
        const { mutedUser } = this.memberServer;
        const nextStatus = [1, '1'].includes(isBanned) ? 0 : 1;
        const params = {
          receive_account_id: accountId,
          status: nextStatus,
          room_id: this.roomId
        };
        mutedUser(params)
          .then(res => {
            //todo 事件上报
            console.warn('禁言---res', res);
          })
          .catch(err => {
            console.warn('禁言---res', err);
          });
      },
      /**
       * 踢出/取消踢出
       */
      setKicked(accountId, isKicked) {
        const { kickedUser } = this.memberServer;
        const nextStatus = [1, '1'].includes(isKicked) ? 0 : 1;
        const confirmText = nextStatus ? '您确定要执行踢出操作？' : '您确定要执行取消踢出操作？';
        this.$confirm(confirmText, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
          // type: 'info',
          // center: true
        })
          .then(() => {
            const params = {
              receive_account_id: accountId,
              status: nextStatus,
              room_id: this.roomId,
              type: this.isInGroup ? 1 : 0
            };
            kickedUser(params).then(() => {
              // 踢出只能在在线和举手列表操作
              //todo 上报事件
              if (nextStatus) {
                this._deleteUser(accountId, this.onlineUsers);
                this._deleteUser(accountId, this.applyUsers);
              } else {
                // 取消踢出只能在受限列表操作
                this.getLimitUserList();
              }
            });
          })
          .catch(() => {});
      },
      //删除用户
      _deleteUser(accountId, list = []) {
        const index = list.findIndex(
          item => ![null, void 0, ''].includes(accountId) && item.account_id === accountId
        );
        index !== -1 && list.splice(index, 1);
      },
      //查找用户在数组的索引号
      _getUserIndex(accountId, list) {
        return list.findIndex(item => item.account_id === accountId);
      },
      //加载更多
      loadMore() {
        if (this.onlineUsers.length > 100) {
          this.getOnlineUserList(++this.pageConfig.page * 100);
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-member-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    background-color: #434343;
    &__group-name {
      padding: 18px 20px 5px;
      color: #ccc;
      i {
        vertical-align: bottom;
      }
      .pr_top {
        position: relative;
        top: -2px;
        font-size: 14px;
      }
    }
    &__container {
      flex: 1;
      position: relative;
      &__scroll {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
      }
      .empty-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        span {
          font-size: 80px;
          color: #7e7e7e;
        }
        p {
          margin-top: 10px;
          color: #999999;
        }
      }
      .member-list__all-tab {
        flex: 1;
      }
      .member-list__apply-tab {
        flex: 1;
      }
      .member-list__limit-tab {
        flex: 1;
      }
    }
    &__operate-container {
      position: relative;
      width: 100%;
      height: 80px;
      padding: 10px;
      background-color: #34363a;
      box-sizing: border-box;
      color: #e2e2e2;
      .iconzaixianrenshu {
        margin-top: -3px;
        vertical-align: middle;
        margin-right: 4px;
      }
      .info-panel__online-num {
        display: inline-block;
        margin-left: 6px;
        color: #ababab;
      }
      .info-panel__refresh-btn {
        display: inline-block;
        margin-left: 6px;
        color: #ababab;
        cursor: pointer;
        &:hover {
          color: #4da1ff;
        }
      }
      .info-panel__allow-raise-hand {
        float: right;
        &__switch-title {
          display: inline-block;
          vertical-align: middle;
          margin-right: 4px;
        }
      }

      .button-panel__btn-box {
        margin-top: 10px;
        & > ul {
          list-style-type: none;
          float: left;
          height: 30px;
          line-height: 30px;
          border-radius: 3px;
          overflow: hidden;
        }
        &__tab-item {
          width: 74px;
          height: 30px;
          text-align: center;
          background-color: #666666;
          color: #cacaca;
          float: left;
          cursor: pointer;
          position: relative;
          margin-right: 1px;
          &:hover {
            background-color: #969696;
            color: #fff;
          }
          &.active {
            background-color: #fc5659;
            color: #fff;
            &:hover {
              color: #fff;

              background-color: #fc5659;
            }
          }
          &.raise-hand {
            &::before {
              content: ' ';
              top: 6px;
              right: 6px;
              position: absolute;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background-color: #fc5659;
              position: absolute;
            }
          }
        }
        .search-btn {
          float: right;
          width: 50px;
          height: 30px;
          line-height: 30px;
          border-radius: 4px;
          text-align: center;
          color: #fff;
          background-color: #666666;
        }
      }
      &__search-panel {
        display: flex;
        width: calc(100% - 20px);
        height: 30px;
        position: absolute;
        top: 4px;
        left: 10px;
        background-color: #34363a;
        border-radius: 4px;
        overflow: hidden;

        .search-panel__input {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          background-color: hsla(0, 0%, 100%, 0.9);
          padding: 0 75px 0 10px;
          border: none;
          color: #666;
        }
        .search-panel__clear-btn {
          width: 15px;
          height: 15px;
          position: absolute;
          top: 7px;
          right: 55px;
          background-image: url('./images/account-file-close-default.png');
          background-repeat: no-repeat;
          background-size: 100%;
        }
        .search-panel__confirm {
          display: inline-block;
          width: 50px;
          height: 30px;
          line-height: 30px;
          border-radius: 0 4px 4px 0;
          text-align: center;
          background-color: #a6a6a8;
          color: #ffffff;
          position: absolute;
          top: 0;
          right: 0;
          cursor: pointer;
        }
      }
    }
  }
</style>
