<template>
  <div class="vmp-member-list">
    <!--分组名称-->
    <div class="vmp-member-list__group-name" v-if="isInGroup">
      <i class="vh-iconfont vh-line-group"></i>
      <span class="pr_top">{{ groupInitData.name }}</span>
    </div>
    <!--成员区域-->
    <div class="vmp-member-list__container">
      <scroll
        class="vmp-member-list__container__scroll"
        :class="{ 'show-empty-img': isShowEmptyImg }"
        ref="scroll"
        @pullingUp="loadMore"
      >
        <!--全部成员-->
        <template v-if="tabIndex === 1">
          <div class="member-list__all-tab">
            <div
              v-if="searchShow && searchUserInput && !onlineUsers.length"
              class="empty-container"
            >
              <span class="empty-img">
                <img src="./img/search@2x.png" alt="" />
              </span>
              <p>很抱歉，没有搜索到您要找的人</p>
            </div>
            <template v-else style="overflow: auto">
              <template v-for="user in onlineUsers">
                <member-item
                  :key="user.account_id"
                  v-if="![1, '1'].includes(user.is_kicked)"
                  @operateUser="handleOperateUser"
                  @interactiveOperate="handleInteractiveOperate"
                  :user-info="user"
                  :role-name="roleName"
                  :is-in-group="isInGroup"
                  :is-interact="isInteract"
                  :mode="mode"
                  :member-options="memberOptions"
                  :current-speaker-id="getCurrentSpeakerId"
                  :main-screen="getCurrentMainScreen"
                  :presentation-screen="getCurrentPresentationScreen"
                  :leader-id="leaderId"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                  :status="liveStatus"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
        <!--举手的成员-->
        <template v-if="tabIndex === 2">
          <div class="member-list__apply-tab">
            <div v-if="!applyUsers.length" class="empty-container">
              <span class="empty-img-top">
                <img src="./img/noTop@2x.png" alt="" />
              </span>
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
                  :is-interact="isInteract"
                  :mode="mode"
                  :member-options="memberOptions"
                  :current-speaker-id="getCurrentSpeakerId"
                  :main-screen="getCurrentMainScreen"
                  :presentation-screen="getCurrentPresentationScreen"
                  :leader-id="leaderId"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                  :status="liveStatus"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
        <!--受限制的成员-->
        <template v-if="tabIndex === 3">
          <div class="member-list__limit-tab">
            <div v-if="!limitedUsers.length" class="empty-container">
              <span class="empty-img-top">
                <img src="./img/no@2x.png" alt="" />
              </span>
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
                  :is-interact="isInteract"
                  :mode="mode"
                  :member-options="memberOptions"
                  :current-speaker-id="getCurrentSpeakerId"
                  :main-screen="getCurrentMainScreen"
                  :presentation-screen="getCurrentPresentationScreen"
                  :leader-id="leaderId"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                  :status="liveStatus"
                ></member-item>
              </template>
            </template>
          </div>
        </template>
      </scroll>
    </div>
    <!--底部操作区域-->
    <div class="vmp-member-list__operate-container" v-if="isShowBottom">
      <!--信息面板-->
      <div class="vmp-member-list__operate-container__info-panel">
        <i class="vh-saas-iconfont vh-saas-a-line-Onlinelist"></i>
        <span
          class="info-panel__online-num"
          v-if="isShowBtn(configList['ui.hide_host_userlist_nums'])"
        >
          {{ totalNum | formatHotNum }}人在线
        </span>
        <span class="info-panel__refresh-btn" @click="refreshList">
          {{ $t('webinar.webinar_1032') }}
        </span>
        <div
          class="info-panel__allow-raise-hand"
          v-if="configList['ui.hide_handsUp'] && mode !== 6"
        >
          <label class="raise-hand-switch" for="raiseHandSwitch">
            允许举手
            <input
              style="display: none"
              v-model="allowRaiseHand"
              @change="onSwitchAllowRaiseHand"
              type="checkbox"
              id="raiseHandSwitch"
            />
            <i class="ss">
              <em></em>
            </i>
          </label>
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
              v-if="isShowBtn(configList['is_interact_and_host'])"
            >
              举手
            </li>
            <li
              @click="switchToTab(3)"
              class="button-panel__btn-box__tab-item"
              :class="tabIndex === 3 ? 'active' : ''"
              v-if="isShowBtn(configList['is_membermanage'])"
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
        <span class="search-panel__confirm" @click="doSearch">
          {{ $t('account.account_1062') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import memberItem from './components/member-item';
  import scroll from './components/scroll';
  import { throttle } from 'lodash';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import {
    useMicServer,
    useRoomBaseServer,
    useMemberServer,
    useInteractiveServer,
    useMsgServer,
    useGroupServer
  } from 'middle-domain';
  export default {
    name: 'VmpMemberList',
    components: {
      memberItem,
      scroll
    },
    data() {
      return {
        //成员列表组件配置
        memberOptions: {},
        //当前角色
        roleName: '',
        //当前登录的用户
        userId: '',
        //房间号
        roomId: '',
        //mod 6代表分组活动
        mode: 3,
        //是否是互动直播 直播模式：1-音频、2-视频、3-互动
        isInteract: 0,
        /** 搜索输入框相关 */
        //是否显示搜索输入框
        searchShow: false,
        //未能找到搜索的人
        searchEmpty: false,
        // 输入的成员名称
        searchUserInput: '',
        /** 搜索输入框结束 */
        // 容器内边距
        emptyContainerPaddingTop: 10,
        //当前的激活的tab
        tabIndex: 1,
        //是否允许举手
        allowRaiseHand: false,
        //分页配置
        pageConfig: {
          page: 0,
          limit: 100
        },
        //是否是pc发起端功能
        isLive: false,
        //是否是pc观看端功能
        isWatch: false
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
      this.micServer = useMicServer();
      this.memberServer = useMemberServer();
      this.interactiveServer = useInteractiveServer();
      this.groupServer = useGroupServer();
    },
    beforeDestroy() {
      this.removeEventsListener();
    },
    async mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据
      await this.initViewData();
      //开始初始化流程
      this.init();
      this.listenEvents();
    },
    updated() {
      //hack处理BsScroll不能滚动的问题
      this.$nextTick(() => {
        this.refresh();
      });
    },
    watch: {
      roleName(newVal) {
        this.roleName = newVal;
      }
    },
    computed: {
      //在线的成员列表
      onlineUsers() {
        return useMemberServer().state.onlineUsers;
      },
      //举手的列表
      applyUsers() {
        return useMemberServer().state.applyUsers;
      },
      //受限的列表
      limitedUsers() {
        return useMemberServer().state.limitedUsers;
      },
      //举手提示
      raiseHandTip() {
        return useMemberServer().state.raiseHandTip || false;
      },
      //在线人数
      totalNum() {
        return useMemberServer().state.totalNum || 0;
      },
      //组长id
      leaderId() {
        return useMemberServer().state.leaderId;
      },
      //是否显示搜索结果图片
      isShowEmptyImg() {
        return [
          this.tabIndex === 1 &&
            this.searchShow &&
            this.searchUserInput &&
            !this.onlineUsers.length,
          this.tabIndex === 2 && !this.applyUsers.length,
          this.tabIndex === 3 && !this.limitedUsers.length
        ].some(item => !!item);
      },
      //是否显示底部区域
      isShowBottom() {
        let show = true;
        if (this.isWatch) {
          return this.isInGroup && this.leaderId == this.userId;
        }
        if (this.isLive) {
          show = true;
        }
        return show;
      },
      //底部区域的按钮是否显示,根据配置里是发起端还是观看端
      isShowBtn() {
        const _this = this;
        return function (value = false) {
          return _this.isWatch ? true : value;
        };
      },
      configList() {
        return this.$domainStore.state.roomBaseServer.configList || {};
      },
      //是否在分组里
      isInGroup() {
        return this.groupServer.state.groupInitData.isInGroup;
      },
      //分组信息
      groupInitData() {
        return this.groupServer.state.groupInitData;
      },
      //活动状态(直播未开始，已开始，已结束)
      liveStatus() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { webinar = {} } = watchInitData;
        return webinar.type;
      },
      //互动工具状态
      interactToolStatus() {
        const { interactToolStatus = {} } = this.roomBaseServer.state;
        return interactToolStatus;
      },
      //找到正确的当前主讲人
      getCurrentSpeakerId() {
        return this.isInGroup
          ? this.groupServer.state.groupInitData.doc_permission
          : this.interactToolStatus.doc_permission;
      },
      //找到当前的主屏
      getCurrentMainScreen() {
        return this.isInGroup
          ? this.groupServer.state.groupInitData.main_screen
          : this.interactToolStatus.main_screen;
      },
      //找到当前的演示屏幕
      getCurrentPresentationScreen() {
        return this.isInGroup
          ? this.groupServer.state.groupInitData.presentation_screen
          : this.interactToolStatus.presentation_screen;
      },
      //获取当前的上麦的人员列表
      getCurrentSpeakerList() {
        return this.micServer.state.speakerList;
      }
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.memberOptions = widget.options;
          this.isLive = this.memberOptions.platformType === 'live';
          this.isWatch = this.memberOptions.platformType === 'watch';
        }
      },
      //初始化视图数据
      initViewData() {
        const { watchInitData = {} } = this.roomBaseServer.state;
        const { join_info = {}, webinar = {}, interact = {} } = watchInitData;
        this.mode = webinar.mode;
        this.isInteract = webinar.mode == 3 || webinar.mode == 6 ? 1 : 0;
        this.roleName = join_info.role_name;
        this.userId = join_info.third_party_user_id;
        this.roomId = interact.room_id;
        this.allowRaiseHand = !!parseInt(this.interactToolStatus.is_handsup);
      },
      //统一初始化方法
      init() {
        this.refreshList();
      },
      //初始化房间消息回调监听
      listenEvents() {
        //监听自定义消息
        this.msgServer.$onMsg('CUSTOM_MSG', msg => {
          //人员上下线消息丢失时，会收到这个消息
          msg.data.type === 'reload_online_user_list' && this.updateOnlineUserList();
        });

        //加入房间
        this.memberServer.$on('JOIN', this.handleJoinRoom);

        //离开房间
        this.memberServer.$on('LEFT', this.handleLeaveRoom);

        //直播结束
        this.memberServer.$on('live_over', this.handleEndLive);

        //用户申请上麦(提示小红点)
        this.memberServer.$on('UPDATE_TAB_TIPS', this.handleUpdateTabTips);

        //用户申请上麦
        this.memberServer.$on('vrtc_connect_apply', this.handleConnectApply);

        //用户上麦成功
        this.memberServer.$on('vrtc_connect_success', this.handleConnectSuccess);

        //用户拒绝上麦邀请
        this.memberServer.$on('vrtc_connect_invite_refused', this.handleUserRejectConnect);

        //互动连麦断开成功
        this.memberServer.$on('vrtc_disconnect_success', this.handleSuccessDisconnect);

        //房间消息结束直播
        this.memberServer.$on('endLive', this.handleEndLive);

        //取消踢出
        this.memberServer.$on('room_kickout_cancel', this.updateOnlineUserList);

        //开始讨论
        this.memberServer.$on('group_switch_start', this.updateOnlineUserList);

        //组内人员变动
        this.memberServer.$on('group_join_change', this.updateOnlineUserList);

        //切换频道
        this.memberServer.$on('GROUP_MSG_CREATED', this.updateOnlineUserList);

        //  结束讨论
        this.memberServer.$on('GROUP_SWITCH_END', this.updateOnlineUserList);

        //踢出小组
        this.memberServer.$on('ROOM_GROUP_KICKOUT', this.updateOnlineUserList);

        // 解散分组(主播&观看均更新)
        this.memberServer.$on('GROUP_DISBAND', this.updateOnlineUserList);

        // 切换组长(组长变更)
        this.memberServer.$on('GROUP_LEADER_CHANGE', this.handleLeaderChange);

        // 主持人进入退出小组 消息监听
        this.memberServer.$on('GROUP_MANAGER_ENTER', this.handleGroupManagerEnter);

        // 频道变更-开始讨论(刷新数据)
        this.memberServer.$on('ROOM_CHANNEL_CHANGE', this.updateOnlineUserList);
      },
      //移除事件监听
      removeEventsListener() {
        //加入房间事件
        this.memberServer.$off('JOIN', this.handleJoinRoom);
        //离开房间事件
        this.memberServer.$off('LEFT', this.handleLeaveRoom);
        //直播结束
        this.memberServer.$off('live_over', this.handleEndLive);
        //用户申请上麦(提示小红点)
        this.memberServer.$off('UPDATE_TAB_TIPS', this.handleUpdateTabTips);
        //用户申请上麦
        this.memberServer.$off('vrtc_connect_apply', this.handleConnectApply);
        //移除用户上麦成功
        this.memberServer.$off('vrtc_connect_success', this.handleConnectSuccess);
        //用户拒绝上麦邀请
        this.memberServer.$off('vrtc_connect_invite_refused', this.handleUserRejectConnect);
        //互动连麦断开成功
        this.memberServer.$off('vrtc_disconnect_success', this.handleSuccessDisconnect);
        //房间消息结束直播
        this.memberServer.$off('endLive', this.handleEndLive);
        //取消踢出
        this.memberServer.$off('room_kickout_cancel', this.updateOnlineUserList);
        //开始讨论
        this.memberServer.$off('group_switch_start', this.updateOnlineUserList);
        //组内人员变动
        this.memberServer.$off('group_join_change', this.updateOnlineUserList);
        //  结束讨论
        this.memberServer.$off('GROUP_SWITCH_END', this.updateOnlineUserList);

        //踢出小组
        this.memberServer.$off('ROOM_GROUP_KICKOUT', this.updateOnlineUserList);

        // 解散分组(主播&观看均更新)
        this.memberServer.$off('GROUP_DISBAND', this.updateOnlineUserList);

        // 切换组长(组长变更)
        this.memberServer.$off('GROUP_LEADER_CHANGE', this.handleLeaderChange);

        // 主持人进入退出小组 消息监听
        this.memberServer.$off('GROUP_MANAGER_ENTER', this.handleGroupManagerEnter);

        // 频道变更-开始讨论(刷新数据)
        this.memberServer.$off('ROOM_CHANNEL_CHANGE', this.updateOnlineUserList);

        //memberServer还原一下视图相关数据
        this.memberServer.resetStateData();
      },
      //加入房间的处理
      handleJoinRoom(msg) {
        this.$message.success(
          this.$t('message.message_1030', {
            n: msg.context.nickname || msg.context.nick_name
          })
        );
      },
      //离开房间处理
      handleLeaveRoom(msg) {
        console.log(msg);
      },
      //直播结束处理
      handleEndLive() {
        //更新一下列表数据
        this.updateOnlineUserList();
        //重置一下视图里各个状态
        this.resetViewData();
      },
      //用户申请上麦处理(成员tab的红点提示)
      handleUpdateTabTips(msg) {
        const { visible = false } = msg || {};
        //tab提示小红点
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitTabTips', { visible: visible, type: 8 })
        );
      },
      //用户申请上麦
      handleConnectApply(msg) {
        if (this.roleName == 1 && msg.data.room_role == 4) {
          this.$message.success(
            `收到 ${this.$getRoleName(4)} [ ${msg.data.nick_name || msg.data.nickname} ] 的上麦申请`
          );
        }
      },
      //用户上麦成功
      handleConnectSuccess(msg) {
        if (this.isInteract !== 1 && msg.data.room_role == 1) {
          this.$message.success({ message: '直播发起成功' });
          return;
        }

        if (msg.data.room_join_id == this.userId) {
          this.$message.success({ message: '您已上麦' });
          return;
        }

        if (msg.data.room_role != 2) {
          this.$message.success({ message: `${msg.data.nick_name}已上麦` });
        }
      },
      //用户拒绝上麦邀请
      handleUserRejectConnect(msg) {
        let role = '';

        if (msg.data.room_role == 2) {
          role = this.$t('chat.chat_1063');
        }

        if (msg.data.room_role == 4) {
          role = this.$t('chat.chat_1023');
        }

        if (msg.data.extra_params == this.userId) {
          this.$message.warning({
            message: `${role}${msg.data.nick_name || msg.data.nickname}拒绝了你的上麦邀请`
          });
        }
      },
      //互动连麦断开成功
      handleSuccessDisconnect(msg) {
        //提示语
        if (msg.data.target_id == this.userId) {
          this.$message.success({ message: this.$t('interact.interact_1028') });
          return;
        }
        //如果两次消息的人员不一样，并且是非观众，则提示（domain已判断是否非观众）
        this.$message.success({
          message: this.$t('interact.interact_1030', {
            n: msg.data.nick_name || msg.data.nickname
          })
        });
      },
      //组长变更
      handleLeaderChange(msg) {
        console.log(msg);
        //还原一下tab
        this.tabIndex = 1;
        this.updateOnlineUserList();
      },
      //主持人进入、退出小组
      handleGroupManagerEnter(msg) {
        ['enter', 'quit'].includes(msg.data.status) && this.updateOnlineUserList();
      },
      //刷新在线的成员列表
      updateOnlineUserList: throttle(function () {
        this.pageConfig.page = 0;
        this.getOnlineUserList();
      }, 2000),
      //获取在线人员列表
      getOnlineUserList(pos) {
        const params = {
          room_id: this.roomId,
          pos: pos || (this.pageConfig.page <= 0 ? 0 : this.pageConfig.page),
          limit: this.pageConfig.limit
        };

        //如果存在输入搜索人员的值
        if (this.searchUserInput) {
          Object.assign(params, { nickname: this.searchUserInput });
        }

        this.memberServer
          .getOnlineUserList(params)
          .then(res => {
            if (res.code === 200) {
              this.$refs.scroll.finishPullUp();
              if (!res?.data?.list?.length) {
                this.pageConfig.page--;
              }
            }
            if (![200, '200'].includes(res.code)) {
              this.pageConfig.page--;
            }
          })
          .catch(() => {
            this.pageConfig.page--;
          })
          .finally(() => {
            this.refresh();
          });
      },
      //刷新在线人数
      refreshList() {
        if (this.tabIndex === 3) {
          this.switchToTab(3);
        }
        //数据埋点--刷新成员列表
        window.vhallReportForProduct?.report(110134);
        this.pageConfig.page = 0;
        this.searchUserInput = '';
        this.getOnlineUserList();
      },
      //直播结束重置视图里的一些状态
      resetViewData() {
        this.allowRaiseHand = false;
        if (this.tabIndex !== 1) {
          this.switchToTab(1);
        }
      },
      //切换允许举手状态
      onSwitchAllowRaiseHand(element) {
        if (this.liveStatus !== 1) {
          element.target.checked = false;
          this.allowRaiseHand = false;
          this.$message.error(this.$t('512521'));
          return;
        }
        const params = {
          room_id: this.roomId,
          status: this.allowRaiseHand ? 1 : 0
        };

        this.micServer
          .setHandsUp(params)
          .then(res => {
            console.log('switch-mic-status', res);
            //数据埋点--开启/关闭允许举手
            window.vhallReportForProduct?.report(element.target.checked ? 110127 : 110128);
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
        this.memberServer.updateState('tabIndex', index);
        //清空输入的人员筛选
        this.searchUserInput = '';
        this.searchShow = false;
        if (index === 2) {
          // this.raiseHandTip = false;
          this.memberServer.updateState('raiseHandTip', false);
        } else if (index === 3) {
          this.memberServer.getLimitUserList();
        }
        if (this.$refs.scroll && this.$refs.scroll.$refs && this.$refs.scroll.$refs.scrollBox) {
          this.emptyContainerPaddingTop = this.$refs.scroll.$refs.scrollBox.scrollHeight / 2 - 60;
        }
        setTimeout(() => {
          this.refresh();
        }, 50);
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
        // 数据埋点-搜索人员
        window.vhallReportForProduct?.report(110129);
        this.pageConfig.page = 0;
        this.getOnlineUserList();
      },
      //响应人员操作
      handleOperateUser({ type = '', params = {} }) {
        console.log('[member] handleOperateUser:', type, params);
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
        const { is_apply = 0, account_id = '' } = params;
        switch (type) {
          case 'upMic':
            this.upMic(!!is_apply, account_id);
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
        this.micServer
          .hostAgreeApply(params)
          .then(res => {
            if (res.code !== 200) {
              this.$message.error(res.msg);
              return;
            }
            this._deleteUser(accountId, this.memberServer.state.applyUsers, 'applyUsers');
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
          this.$message.error(this.$t('512521'));
          return;
        }

        if (isApply) {
          this.agreeUpMic(accountId);
        } else {
          if (this.userId === accountId) {
            // 主持人自己上麦
            this.micServer.userSpeakOn().then(res => {
              if (res.code !== 200) {
                this.$message.error(res.msg);
              }
            });
          } else {
            this.micServer
              .inviteMic({
                room_id: this.roomId,
                receive_account_id: accountId
              })
              .then(res => {
                console.warn(res, '邀请上麦');
                if (res.code == 200) {
                  //todo 这里需要上报埋点
                  this.$message.success({ message: this.$t('message.message_1033') });
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
      downMic(accountId, needConfirm = true) {
        const data = {
          room_id: this.roomId,
          receive_account_id: accountId
        };
        if (needConfirm && this.isInGroup && this.isLive) {
          this.$confirm('下麦后，演示将自动结束，是否下麦？', this.$t('account.account_1061'), {
            confirmButtonText: this.$t('account.account_1062'),
            cancelButtonText: this.$t('account.account_1063'),
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
            // type: 'info',
            // center: true
          }).then(() => {
            this.micServer
              .speakOff(data)
              .then(res => {
                //todo 埋点上报
                return res;
              })
              .catch(error => {
                this.$message.error(error.msg);
              });
          });
        } else {
          this.micServer
            .speakOff(data)
            .then(res => {
              //todo 埋点上报
              return res;
            })
            .catch(error => {
              this.$message.error(error.msg);
            });
        }
      },
      // 我要演示
      myPresentation(accountId) {
        if (this.getCurrentPresentationScreen == accountId) {
          this.$message.warning('正在演示中');
          return false;
        }
        // 设置主讲人
        this.$confirm(
          '演示后，组内成员将不能演示白板、文档、桌面共享是否确认演示？',
          this.$t('account.account_1061'),
          {
            confirmButtonText: this.$t('account.account_1062'),
            cancelButtonText: this.$t('account.account_1063'),
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
          }
        ).then(() => {
          this.memberServer
            .userPresentation({
              room_id: this.roomBaseServer.state.watchInitData.interact.room_id
            })
            .then(res => {
              if (res.code !== 200) {
                this.$message.error(res.msg);
              }
            })
            .catch(err => {
              this.$message.warning(err.msg);
            });
        });
      },
      /**
       * 设置主讲人
       * @param {Number | String} accountId 用户ID
       * @Function void()
       */
      setSpeaker(accountId, setMainScreen = true) {
        //设置主屏幕
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
        //设置主讲人
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
        if (
          this.isWatch &&
          (accountId === this.leaderId || accountId === this.getCurrentSpeakerId)
        ) {
          return;
        }
        const params = {
          room_id: this.roomId,
          receive_account_id: accountId,
          type: 1 // 0=邀请上麦|1=邀请演示
        };
        return this.memberServer
          .inviteUserToInteract(params)
          .then(res => {
            if (res.code == 200) {
              if (!['', null, void 0].includes(accountId) && accountId === this.userId) {
                // this.$message.success('邀请演示发送成功')
              } else {
                //数据埋点--邀请上麦
                window.vhallReportForProduct?.report(110130);
                this.$message.success(this.$t('message.message_1033'));
              }
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      },
      //设为组长
      setLeader(accountId = '') {
        const params = {
          room_id: this.roomId,
          leader_account_id: accountId,
          group_id: this.groupInitData.group_id || ''
        };
        this.groupServer
          .setLeader(params.group_id, accountId)
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
            //数据埋点--禁言/取消禁言
            window.vhallReportForProduct?.report(110125);
            console.warn('禁言---res', res);
          })
          .catch(err => {
            console.warn('禁言---res', err);
          });
        // “禁言”要关闭当前用户的在麦状态
        console.log('禁言 -  - 要关闭当前用户的在麦状态 - - - - ', isBanned);
        if (isBanned) {
          return;
        }
        this.micServer
          .speakOff({ receive_account_id: accountId, room_id: this.roomId })
          .then(res => {
            //todo 埋点上报
            return res;
          })
          .catch(error => {
            this.$message.error(error.msg);
          });
      },
      /**
       * 踢出/取消踢出
       */
      setKicked(accountId, isKicked) {
        const { kickedUser } = this.memberServer;
        const nextStatus = [1, '1'].includes(isKicked) ? 0 : 1;
        const confirmText = nextStatus ? '您确定要执行踢出操作？' : '您确定要执行取消踢出操作？';
        this.$confirm(confirmText, this.$t('account.account_1061'), {
          confirmButtonText: this.$t('account.account_1062'),
          cancelButtonText: this.$t('account.account_1063'),
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
            kickedUser(params).then(res => {
              let { msg = '', code } = res || {};
              if (![200, '200'].includes(code)) {
                return this.$message.error(msg);
              }
              // 踢出只能在在线和举手列表操作
              //埋点上报--踢出/取消踢出
              window.vhallReportForProduct?.report(nextStatus ? 110126 : 110146);
              if (nextStatus) {
                this._deleteUser(accountId, this.memberServer.state.onlineUsers, 'onlineUsers');
                this._deleteUser(accountId, this.memberServer.state.applyUsers, 'applyUsers');
              } else {
                // 取消踢出只能在受限列表操作
                this.memberServer.getLimitUserList();
              }
            });
          })
          .catch(() => {});
      },
      //删除用户
      _deleteUser(accountId, list = [], key = '') {
        this.memberServer._deleteUser(accountId, list);
      },
      //加载更多
      loadMore() {
        if (this.memberServer.state.onlineUsers.length >= this.pageConfig.limit) {
          this.pageConfig.page++;
          this.getOnlineUserList();
        }
      },
      //滚动条位置更新
      refresh() {
        if (this.$refs && this.$refs.scroll) {
          this.$refs.scroll.refresh();
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
    background-color: #2a2a2a;
    &__group-name {
      display: flex;
      align-items: center;
      padding: 18px 20px 5px;
      color: #ccc;
      .pr_top {
        margin-left: 10px;
        font-size: 14px;
      }
    }
    &__container {
      flex: 1 0 auto;
      max-height: calc(100% - 80px);
      position: relative;
      overflow: hidden;
      &__scroll {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .show-empty-img {
        .test_01 {
          height: 100%;
          display: flex;
          flex: 1;
        }
      }
      .empty-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        span {
          display: inline-block;
          img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
        p {
          margin-top: 10px;
          color: #999;
        }
        .empty-img {
          width: 120px;
          height: 120px;
        }
        .empty-img-top {
          width: 180px;
          height: 100px;
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
      background-color: #2a2a2a;
      box-sizing: border-box;
      color: #e2e2e2;
      border-top: 1px solid #1a1a1a;
      .vh-saas-a-line-Onlinelist {
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
        .raise-hand-switch {
          cursor: pointer;
          color: #ccc;
          font-size: 12px;
          margin-right: 1px;
          & > input:checked + i em {
            border-color: #ff9446;
            left: 14px;
            transition: all 0.1s ease-in-out;
          }
          & > i {
            display: inline-block;
            width: 26px;
            height: 14px;
            background-color: #242527;
            border-radius: 100px;
            position: relative;
            margin-left: 5px;
            top: 3px;
            & > em {
              box-sizing: border-box;
              position: absolute;
              top: 2px;
              left: 2px;
              content: '';
              width: 10px;
              height: 10px;
              background-color: #242527;
              border: 2px solid #aaaaaa;
              border-radius: 10px;
              transition: all 0.1s ease-in-out;
              backface-visibility: hidden;
              transform-style: preserve-3d;
            }
          }
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
          background-color: #434343;
          color: #999;
          float: left;
          cursor: pointer;
          position: relative;
          margin-right: 1px;
          &:hover {
            background-color: #969696;
            color: #fff;
          }
          &.active {
            background-color: #595959;
            color: #e6e6e6;
            &:hover {
              color: #e6e6e6;
              background-color: #595959;
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
              background-color: #fb3a32;
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
          color: #999;
          background-color: #434343;
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
          background-image: url('./img/account-file-close-default.png');
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
          color: #fff;
          position: absolute;
          top: 0;
          right: 0;
          cursor: pointer;
        }
      }
    }
  }
</style>
