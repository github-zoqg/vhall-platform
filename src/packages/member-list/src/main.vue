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
                  :leader-id="leader_id"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                  :status="liveStatus"
                  :guest-has-invite-per="guestHasInvitePer"
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
                  :leader-id="leader_id"
                  :user-id="userId"
                  :tab-index="tabIndex"
                  :apply-users="applyUsers"
                  :status="liveStatus"
                  :guest-has-invite-per="guestHasInvitePer"
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
                  :leader-id="leader_id"
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
          {{ totalNumTxt | formatHotNum }}人在线
        </span>
        <span class="info-panel__refresh-btn" @click="refreshList">
          {{ $t('webinar.webinar_1032') }}
        </span>
        <div
          class="info-panel__allow-raise-hand"
          v-if="(configList['ui.hide_handsUp'] && mode !== 6) || guestHasInvitePer"
        >
          <label class="raise-hand-switch" for="raiseHandSwitch">
            允许观众申请连麦
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
              v-if="isShowBtn(configList['is_interact_and_host']) || guestHasInvitePer"
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
    <!-- 设置主讲人弹窗 -->
    <saas-alert
      :visible="popAlert.visible"
      :confirm="popAlert.confirm"
      :knowText="'知道了'"
      :confirmText="'继续'"
      :cancelText="'取消'"
      @onSubmit="stopShareOrInsert"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">{{ popAlert.text }}</main>
    </saas-alert>
  </div>
</template>

<script>
  import memberItem from './components/member-item';
  import scroll from './components/scroll';
  import { throttle, uniqBy } from 'lodash';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import {
    useMicServer,
    useRoomBaseServer,
    useMemberServer,
    useInteractiveServer,
    useMsgServer,
    useGroupServer,
    useMenuServer
  } from 'middle-domain';
  import { toSJIS } from 'qrcode/lib/core/utils';
  export default {
    name: 'VmpMemberList',
    components: {
      memberItem,
      scroll,
      SaasAlert
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
        //组长id
        leader_id: '',
        //当前的激活的tab
        tabIndex: 1,
        //总人数
        totalNum: 0,
        //是否允许举手
        allowRaiseHand: false,
        // 举手提示
        raiseHandTip: false,
        //分页配置
        pageConfig: {
          page: 0,
          limit: 100
        },
        // 举手列表定时器列表
        handsUpTimerList: {},
        //是否是pc发起端功能
        isLive: false,
        //是否是pc观看端功能
        isWatch: false,
        //连麦断开的定时器
        timer: null,
        totalNumTxt: 0,
        popAlert: {
          text: '切换主讲人或主画面将中断插播视频或桌面共享操作，是否继续？',
          visible: false,
          confirm: true,
          presenter: '',
          accountId: null
        }
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
      this.micServer = useMicServer();
      this.memberServer = useMemberServer();
      this.interactiveServer = useInteractiveServer();
      this.groupServer = useGroupServer();
      this.menuServer = useMenuServer();
    },
    created() {
      this.totalNumTxt = this.totalNum;
      this.initMenuServerEvent();
    },
    beforeDestroy() {
      this.removeMenuServerEvent();
    },
    async mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据
      await this.initViewData();
      //开始初始化流程
      this.init();
      this.listenEvent();
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
      },
      totalNum(val) {
        this.updateTotalNum(val);
      }
    },
    computed: {
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
          return this.leader_id == this.userId && this.isInGroup;
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
      },
      // 嘉宾为当前主讲人时是否有邀请上麦的权限
      guestHasInvitePer() {
        return (
          this.configList?.speak_manage == 1 &&
          this.interactToolStatus.doc_permission == this.userId &&
          this.roleName == 4
        );
      },
      // 是否开启视频轮巡
      isVideoPolling() {
        return this.$domainStore.state.roomBaseServer.configList['video_polling'];
      },
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      accountId() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id;
      },
      desktopShareInfo() {
        return this.$domainStore.state.desktopShareServer.desktopShareInfo;
      },
      // 是否是当前用户插播
      isCurrentRoleInsert() {
        return (
          // 当前正在插播，插播人id等于当前用户id
          this.$domainStore.state.insertFileServer.isInsertFilePushing &&
          this.$domainStore.state.insertFileServer.insertStreamInfo.userInfo.accountId ==
            this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id
        );
      }
    },
    methods: {
      updateTotalNum: throttle(function (val) {
        this.totalNumTxt = val;
      }, 500),
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
        this.getOnlineUserList();
      },
      listenEvent() {
        const _this = this;
        this.listenRoomMsg();
        this.listenGroupMsg();
        this.msgServer.$onMsg('CHAT', rawMsg => {
          let temp = Object.assign({}, rawMsg);

          if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};
          switch (type) {
            case 'disable':
              _this.changeUserStatus(
                temp.data.target_id,
                _this.onlineUsers,
                {
                  is_banned: 1
                },
                'onlineUsers'
              );
              _this.changeUserStatus(
                temp.data.target_id,
                _this.limitedUsers,
                {
                  is_banned: 1
                },
                'limitedUsers'
              );
              _this.changeUserStatus(
                temp.data.target_id,
                _this.applyUsers,
                {
                  is_banned: 1
                },
                'applyUsers'
              );
              // 禁言并且是举手列表
              if (_this.tabIndex === 2) {
                _this._deleteUser(temp.data.target_id, _this.applyUsers, 'applyUsers');
              }
              break;
            case 'permit':
              _this.changeUserStatus(
                temp.data.target_id,
                _this.onlineUsers,
                {
                  is_banned: 0
                },
                'onlineUsers'
              );
              _this.changeUserStatus(
                temp.data.target_id,
                _this.limitedUsers,
                {
                  is_banned: 0
                },
                'limitedUsers'
              );
              _this.changeUserStatus(
                temp.data.target_id,
                _this.applyUsers,
                {
                  is_banned: 0
                },
                'applyUsers'
              );
              _this.limitedUsers.forEach((item, index) => {
                if (item.account_id == temp.data.target_id) {
                  _this.limitedUsers.splice(index, 1);
                }
              });
              break;
            default:
              break;
          }
        });
        //监听自定义消息
        this.msgServer.$onMsg('CUSTOM_MSG', msg => {
          //人员上下线消息丢失时，会收到这个消息
          msg.data.type === 'reload_online_user_list' && this.updateOnlineUserList();
        });
      },
      //初始化房间消息回调监听
      listenRoomMsg() {
        const _this = this;
        const { isLive } = this;

        // 加入房间
        this.msgServer.$onMsg('JOIN', msg => {
          handleUserJoinRoom(msg);
        });

        //离开房间
        this.msgServer.$onMsg('LEFT', msg => {
          handleUserLeaveRoom(msg);
        });

        //直播结束
        this.msgServer.$on('live_over', () => {
          handleLiveOver();
        });

        //房间消息
        this.msgServer.$onMsg('ROOM_MSG', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};

          switch (type) {
            case 'vrtc_connect_apply':
              //用户申请上麦
              if (this.roleName == 1) {
                window.vhallReportForProduct?.toResultsReporting(110179, {
                  event_type: 'message',
                  ...rawMsg
                });
              }
              handleApplyConnect(temp);
              break;
            case 'vrtc_connect_apply_cancel':
              //用户取消申请上麦
              handleCancelApplyConnect(temp);
              break;
            case 'vrtc_connect_agree':
              //同意用户上麦
              handleAgreeApplyConnect(temp);
              break;
            case 'vrtc_connect_success':
              //用户上麦成功
              handleSuccessConnect(temp);
              break;
            case 'vrtc_connect_invite_refused':
              //用户拒绝上麦邀请
              handleUserRejectConnect(temp);
              break;
            case 'vrtc_disconnect_success':
              //互动连麦断开成功
              handleSuccessDisconnect(temp);
              break;
            case 'vrtc_connect_device_check':
              //设备检测
              handleDeviceCheck(temp);
              break;
            case 'kicked_in_chat':
            case 'room_kickout':
              handleKicked(temp);
              break;
            case 'main_room_join_change':
              handleMainRoomJoinChange(temp);
              break;
            case 'endLive':
              handleEndLive(temp);
              break;
            case 'room_kickout_cancel':
              handleRoomCancelKickOut(temp);
              break;
            // 嘉宾为当前主讲人时，允许举手的状态同步
            case 'vrtc_connect_open':
              if (temp.sender_id != _this.userId) {
                _this.allowRaiseHand = true;
              }
              break;
            case 'vrtc_connect_close':
              if (temp.sender_id != _this.userId) {
                _this.allowRaiseHand = false;
              }
              break;

            default:
              break;
          }
        });

        //直播结束
        function handleEndLive(msg) {
          console.log(msg);
          _this.allowRaiseHand = false;
        }

        //直播结束
        function handleLiveOver() {
          setTimeout(() => {
            _this.refreshList();
          }, 1000);
          //重置一下视图里各个状态
          _this.resetViewData();
        }

        //设备检测
        function handleDeviceCheck(msg) {
          const { member_info = {} } = msg.data;
          if (![2, '2'].includes(msg.data.device_type)) {
            _this.changeUserStatus(
              msg.data.room_join_id,
              _this.onlineUsers,
              member_info,
              'onlineUsers'
            );
          }
          if (![0, '0'].includes(msg.data.device_status)) {
            _this.changeUserStatus(
              msg.data.room_join_id,
              _this.onlineUsers,
              member_info,
              'onlineUsers'
            );
          }
        }
        //用户加入房间
        function handleUserJoinRoom(msg) {
          try {
            const { isLive, isWatch } = _this;
            const { context } = msg;

            // 上线的人是自己，不做操作
            if (isLive && msg.sender_id == _this.userId) {
              return;
            }

            let index = _this._getUserIndex(msg.sender_id, _this.onlineUsers);

            if (isWatch) {
              _this.totalNum = msg.uv;
              _this.memberServer.updateState('totalNum', _this.totalNum);
            }

            // 如果是发起端
            if (isLive) {
              const groupUsersNumber = _this.getGroupedUserLength();
              _this.totalNum = _this.isInGroup
                ? msg.uv
                : msg.uv - (_this.groupInitData.switch_status == 1 ? groupUsersNumber : 0);
              _this.memberServer.updateState('totalNum', _this.totalNum);
            }

            if (isWatch && !_this.isInGroup && index >= 0) {
              return;
            }

            if (isLive && index >= 0) {
              return;
            }

            // 在线人数大于200不再添加到列表里，只能加载更多
            if (_this.totalNum > 200) {
              return;
            }
            // 隐身模式登录
            if (msg.data.hide) {
              return;
            }

            // 从上麦人员列表中获取加入房间着是否上麦
            const speakIndex = _this._getUserIndex(msg.sender_id, _this.getCurrentSpeakerList);

            if (isLive) {
              const user = {
                account_id: msg.sender_id,
                avatar: context.avatar,
                device_status: !['', void 0, null].includes(context.device_status)
                  ? context.device_status
                  : 1,
                device_type: !['', void 0, null].includes(context.device_status)
                  ? context.device_type
                  : 2,
                is_banned: isNaN(Number(context.is_banned)) ? 0 : Number(context.is_banned),
                nickname: context.nick_name || context.nickname,
                role_name: context.role_name,
                is_speak: speakIndex >= 0 ? 1 : 0,
                is_apply: 0
              };
              //看一下上线的是不是组长
              if (
                _this.isInGroup &&
                context &&
                context.groupInitData &&
                ![null, void 0, ''].includes(context.groupInitData.join_role)
              ) {
                user.role_name = context.groupInitData.join_role;
                user.is_banned = isNaN(Number(context.groupInitData.is_banned))
                  ? 0
                  : Number(context.groupInitData.is_banned);
              }

              //在主房间，但是是分组内成员上线
              if (!_this.isInGroup && context?.groupInitData?.isInGroup) {
                return;
              }

              _this.onlineUsers.push(user);
              _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
              _this.memberServer.updateState('onlineUsers', _this.onlineUsers);
              setTimeout(() => {
                _this.refresh();
              }, 100);
              if (msg.context.role_name == 4) {
                if (msg.sender_id == _this.userId) {
                  return;
                }
                _this.$message({
                  message: _this.$t('message.message_1030', {
                    n: msg.context.nickname || msg.context.nick_name
                  }),
                  showClose: true,
                  // duration: 0,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
              }
            }

            if (isWatch) {
              if (_this.isInGroup) {
                const flag = _this.onlineUsers.find(item => item.account_id == msg.sender_id);
                if (flag) {
                  _this.onlineUsers.forEach(item => {
                    if (item.account_id == msg.sender_id) {
                      Object.assign(item, {
                        avatar: context.avatar,
                        device_status: context.device_status,
                        nickname: context.nick_name || context.nickname,
                        device_type: context.device_type,
                        is_speak: speakIndex >= 0 ? 1 : 0,
                        role_name:
                          context &&
                          context.groupInitData &&
                          ![null, void 0, ''].includes(context.groupInitData.join_role)
                            ? context.groupInitData.join_role
                            : item.role_name
                      });
                    }
                  });
                  _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
                  _this.memberServer.updateState('onlineUsers', _this.onlineUsers);
                } else {
                  const user = {
                    account_id: msg.sender_id,
                    nickname: context.nick_name || context.nickname,
                    avatar: context.avatar,
                    device_status: context.device_status,
                    device_type: context.device_type,
                    role_name: context.role_name,
                    is_speak: speakIndex >= 0 ? 1 : 0,
                    is_apply: 0,
                    is_banned:
                      context && context.groupInitData ? Number(context.groupInitData.is_banned) : 0
                  };
                  //看一下上线的是不是组长
                  if (
                    context &&
                    context.groupInitData &&
                    ![null, void 0, ''].includes(context.groupInitData.join_role)
                  ) {
                    user.role_name = context.groupInitData.join_role;
                  }
                  _this.onlineUsers.push(user);
                  _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
                  _this.memberServer.updateState('onlineUsers', _this.onlineUsers);
                }
              } else {
                //在主房间，但是是分组内成员上线
                if (context?.groupInitData?.isInGroup) {
                  return;
                }
                const user = {
                  account_id: msg.sender_id,
                  avatar: context.avatar,
                  device_status: context.device_status,
                  device_type: context.device_type,
                  is_banned: Number(context.is_banned),
                  nickname: context.nickname || context.nick_name,
                  role_name: context.role_name,
                  is_speak: speakIndex >= 0 ? 1 : 0,
                  is_apply: 0
                };
                _this.onlineUsers.push(user);
                _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
                _this.memberServer.updateState('onlineUsers', _this.onlineUsers);
                if (msg.context.role_name == 4) {
                  if (msg.sender_id == _this.userId) {
                    return;
                  }
                  _this.$message({
                    message: _this.$t('message.message_1030', {
                      n: msg.context.nickname || msg.context.nick_name
                    }),
                    showClose: true,
                    // duration: 0,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                }
              }
            }
          } catch (ex) {
            console.error('ex:', ex);
          }
        }
        //用户离开房间
        function handleUserLeaveRoom(msg) {
          const isLive = _this.isLive;
          const isWatch = _this.isWatch;
          if (msg?.context?.isAuthChat) return; // 如果是聊天审核页面不做任何操作
          const groupUserNum =
            _this.getGroupedUserLength() >= 1 ? _this.getGroupedUserLength() - 1 : 0;

          if (isLive) {
            _this.totalNum = _this.isInGroup
              ? msg.uv
              : msg.uv - (_this.groupInitData.switch_status == 1 ? groupUserNum : 0);
            _this.memberServer.updateState('totalNum', _this.totalNum);
          }

          if (isWatch) {
            _this.totalNum = msg.uv;
            _this.memberServer.updateState('totalNum', _this.totalNum);
          }
          if (_this.totalNum < 0) {
            _this.totalNum = 0;
            _this.memberServer.updateState('totalNum', _this.totalNum);
          }
          _this._deleteUser(msg.sender_id, _this.onlineUsers, 'onlineUsers');
          _this._deleteUser(msg.sender_id, _this.applyUsers, 'applyUsers');
          _this._deleteUser(msg.sender_id, _this.limitedUsers, 'limitedUsers');
          setTimeout(() => {
            _this.refresh();
          }, 50);
        }
        //用户申请上麦
        function handleApplyConnect(msg) {
          //举手tab的小红点
          if (_this.tabIndex !== 2) {
            _this.raiseHandTip = true;
          }
          // 如果申请人是自己
          if (msg.data.room_join_id == _this.userId) {
            return;
          }
          //tab提示小红点
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(_this.cuid, 'emitTabTips', { visible: true, type: 8 })
          );
          let user = {
            account_id: msg.data.room_join_id,
            avatar: msg.data.avatar,
            device_status: msg.data.device_status,
            device_type: msg.data.device_type,
            nickname: msg.data.nick_name || msg.data.nickname,
            role_name: msg.data.room_role
          };
          if ((_this.roleName == 1 || _this.guestHasInvitePer) && user.role_name == 4) {
            _this.$message.success(`收到 ${_this.$getRoleName(4)} [ ${user.nickname} ] 的上麦申请`);
          }
          const { member_info = { is_apply: 1 } } = msg.data;
          user = Object.assign(user, member_info);
          _this.applyUsers.unshift(user);

          _this.applyUsers = uniqBy(_this.applyUsers, 'account_id'); // 去重
          _this.changeUserStatus(user.account_id, _this.onlineUsers, member_info, 'onlineUsers');
          // 申请30秒后从列表去掉
          _this.handsUpTimerList[user.account_id] &&
            clearTimeout(_this.handsUpTimerList[user.account_id]);
          delete _this.handsUpTimerList[user.account_id];
          _this.handsUpTimerList[user.account_id] = window.setTimeout(() => {
            _this.handsUpTimerList[user.account_id] &&
              clearTimeout(_this.handsUpTimerList[user.account_id]);
            delete _this.handsUpTimerList[user.account_id];
            _this.changeUserStatus(
              user.account_id,
              _this.onlineUsers,
              {
                is_apply: 0
              },
              'onlineUsers'
            );
            _this.applyUsers = _this.applyUsers.filter(u => u.account_id !== user.account_id);
            if (!_this.applyUsers.length) {
              _this.raiseHandTip = false;
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(_this.cuid, 'emitTabTips', { visible: false, type: 8 })
              );
            }
          }, 30000);
        }
        //用户取消上麦申请
        function handleCancelApplyConnect(msg) {
          const { member_info = { is_apply: 0 } } = msg.data;
          //发起端举手提示
          _this.raiseHandTip = false;
          _this._deleteUser(msg.data.room_join_id, _this.applyUsers, 'applyUsers');
          _this.changeUserStatus(
            msg.data.room_join_id,
            _this.onlineUsers,
            member_info,
            'onlineUsers'
          );
          _this.handsUpTimerList[msg.data.room_join_id] &&
            clearTimeout(_this.handsUpTimerList[msg.data.room_join_id]); // 取消下麦清除定时器
          delete _this.handsUpTimerList[msg.data.room_join_id];
        }
        //同意用户上麦
        function handleAgreeApplyConnect(msg) {
          if (_this.isLive) {
            _this.raiseHandTip = false;
            return;
          }
          if (_this.isWatch) {
            _this.changeUserStatus(
              msg.room_join_id,
              _this.onlineUsers,
              {
                is_apply: 0,
                is_speak: 1
              },
              'onlineUsers'
            );
          }
        }
        //用户上麦成功
        function handleSuccessConnect(msg) {
          const { member_info = { is_apply: 0, is_speak: 1 } } = msg.data;
          _this.changeUserStatus(
            msg.data.room_join_id,
            _this.onlineUsers,
            member_info,
            'onlineUsers'
          );
          //上麦成功，需要更新一下申请上麦的人（因为主持人和助理、组长等都会看到申请列表）
          _this._deleteUser(msg.sender_id, _this.applyUsers, 'applyUsers');
          //上麦成功，重新对在线人员排一下序
          _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
          //如果已经没有举手的人，清除一下举手一栏的小红点
          if (!_this.applyUsers.length) {
            _this.raiseHandTip = false;
          }
          if (msg.data.room_join_id == _this.userId && msg.data.room_role == 2) {
            return;
          }
          if (_this.isInteract !== 1 && msg.data.room_role == 1) {
            if (_this.roomBaseServer.state.isThirdStream) {
              _this.$message.success({ message: '正在使用第三方推流' });
            } else {
              _this.$message.success({ message: '直播发起成功' });
            }
            return;
          }
          if (msg.data.room_join_id == _this.userId) {
            // 7.7.4 优化后不再提示
            // _this.$message.success({ message: '您已上麦' });
          } else {
            msg.data.room_role != 2 &&
              _this.$message.success({ message: `${msg.data.nick_name}已上麦` });
          }
          //清除定时器
          _this.handsUpTimerList[msg.data.room_join_id] &&
            clearTimeout(_this.handsUpTimerList[msg.data.room_join_id]);
          delete _this.handsUpTimerList[msg.data.room_join_id];
        }
        //用户拒绝上麦邀请
        function handleUserRejectConnect(msg) {
          // 如果申请人是自己
          if (msg.data.room_join_id == _this.userId) {
            return;
          }

          //发起端需要判断一下是不是非主持人&&非主讲人的嘉宾
          if (_this.isLive && _this.roleName != 1 && !_this.guestHasInvitePer) {
            return;
          }

          let role = '';
          if (msg.data.room_role == 2) {
            role = _this.$t('chat.chat_1063');
          } else if (msg.data.room_role == 4) {
            role = _this.$t('chat.chat_1023');
          }
          if (msg.data.inviter_account_id == _this.userId) {
            _this.$message.warning({
              message: `${role}${msg.data.nick_name}拒绝了你的上麦邀请`
            });
          }
        }
        //互动连麦成功断开链接
        function handleSuccessDisconnect(msg) {
          _this.changeUserStatus(
            msg.data.target_id,
            _this.onlineUsers,
            {
              is_speak: 0,
              is_apply: 0
            },
            'onlineUsers'
          );
          // 7.7.4 优化后不再有下麦提示
          //提示语
          // if (msg.data.target_id == _this.userId) {
          //   _this.timer && clearTimeout(_this.timer);
          //   _this.timer = setTimeout(() => {
          //     _this.$message.success({ message: _this.$t('interact.interact_1028') });
          //   }, 1000);
          //   return;
          // }

          // 当前用户ID,解决俩次触发vrtc_connect_success会提示两次下麦消息
          if (_this.LocalCatchTarget_id != msg.data.target_id) {
            _this.LocalCatchTarget_id = msg.data.target_id;
            window.vhallReportForProduct?.toResultsReporting(110180, {
              event_type: 'message',
              ...msg
            });
            if (msg.data.room_role != 2) {
              _this.$message.success({
                message: _this.$t('interact.interact_1030', { n: msg.data.nick_name })
              });
            }
            setTimeout(() => {
              _this.LocalCatchTarget_id = null;
            }, 3000);
          }
          if (_this.applyUsers.length > 0) {
            const deleteIndex = _this.applyUsers.findIndex(
              item => item.account_id == msg.data.target_id
            );
            if (deleteIndex >= 0) {
              _this.applyUsers.splice(deleteIndex, 1);
            }
          }
        }
        //处理踢出人员
        function handleKicked(msg) {
          _this._deleteUser(msg.accountId, _this.onlineUsers, 'onlineUsers');
          _this._deleteUser(msg.accountId, _this.applyUsers, 'applyUsers');
          //刷新下受限列表
          _this.getLimitUserList();
          _this.refreshList();
        }
        //主房间人员变动
        function handleMainRoomJoinChange(msg) {
          //必须在主房间
          if (_this.isInGroup) return;

          if (isLive) {
            _this.totalNum = msg.uv - _this.getGroupedUserLength();
            _this.totalNum = _this.totalNum >= 0 ? _this.totalNum : 0;
            // 如果sender_id==自己
            if (msg.sender_id == _this.userId) {
              _this.totalNum++;
            }
            _this.memberServer.updateState('totalNum', _this.totalNum);
          }

          if (msg.data.isJoinMainRoom) {
            const flag = _this.onlineUsers.find(item => item.account_id == msg.sender_id);
            if (flag) return false;
            _this.onlineUsers.push({
              nickname: msg.data.nickname || msg.data.nick_name,
              is_banned: msg.data.isBanned,
              account_id: msg.data.accountId,
              role_name: msg.data.role_name == 20 ? 2 : msg.data.role_name,
              device_type: msg.data.device_type,
              is_apply: 0
            });
          } else {
            _this.onlineUsers.forEach((item, index) => {
              if (item.account_id === msg.data.accountId) {
                _this.onlineUsers.splice(index, 1);
              }
            });
          }
        }
        //房间内取消踢出
        function handleRoomCancelKickOut(msg) {
          console.log(msg);
          _this.refreshList();
        }
      },
      //初始化分组消息回调监听
      listenGroupMsg() {
        const _this = this;
        const { isLive, isWatch } = this;

        this.msgServer.$onMsg('ROOM_MSG', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }

          const { type = '' } = temp.data || {};
          switch (type) {
            case 'changeGroupInitData':
              //重新获取最新的groupInitData
              isLive && changeGroupInitData(temp);
              break;
            case 'vrtc_connect_presentation_success':
              //演示权限变更
              isWatch && handlePresentationPermissionChange(temp);
              break;
            case 'group_switch_start':
              //groupServer并不会给在主房间的观众发开始讨论的消息，所以这里需要监听房间事件
              _this.updateOnlineUserList();
              break;
            case 'group_join_change':
              _this.updateOnlineUserList();
              break;
            case 'group_disband':
              _this.updateOnlineUserList();
              break;
            case 'group_switch_proceed':
              //groupServer并不会给在主房间的观众发开始讨论的消息，所以这里需要监听房间事件
              _this.updateOnlineUserList();
              break;
            default:
              break;
          }
        });

        //为上线的分组成员添加身份
        this.groupServer.$on('GROUP_JOIN_INFO', msg => {
          handleSetUserJoinInfo(msg);
        });

        // 切换channel
        this.groupServer.$on('GROUP_MSG_CREATED', msg => {
          isLive && handleStartGroupDiscuss(msg);
        });

        //  结束讨论
        this.groupServer.$on('GROUP_SWITCH_END', msg => {
          console.log('GROUP_SWITCH_END', msg);
          handleEndGroupDiscuss(msg);
        });

        // 踢出小组
        this.groupServer.$on('ROOM_GROUP_KICKOUT', msg => {
          handleGroupKicked(msg);
        });

        // 切换组长(组长变更)
        this.groupServer.$on('GROUP_LEADER_CHANGE', msg => {
          if (isLive && !this.isInGroup) return;
          this.leader_id = msg.data.account_id;
          //还原一下tab
          this.tabIndex = 1;
          this.updateOnlineUserList();
        });

        // 主持人进入退出小组 消息监听
        this.groupServer.$on('GROUP_MANAGER_ENTER', msg => {
          handleHostJoin(msg);
        });

        // 频道变更-开始讨论(刷新数据)
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', msg => {
          isWatch && _this.updateOnlineUserList(msg);
        });

        //为上线的分组成员添加身份
        function handleSetUserJoinInfo(msg) {
          if (_this.isLive) {
            // 是自己 && 不在分组中
            if (msg.sender_id == _this.userId && !_this.isInGroup) {
              return;
            }
            _this.onlineUsers.forEach(item => {
              if (item.account_id == msg.sender_id) {
                Object.assign(item, {
                  account_id: msg.sender_id,
                  is_banned: msg.data.is_banned,
                  role_name: msg.data.join_role
                  // is_speak: speakIndex >= 0 ? 1 : 0,
                });
              }
            });
            return;
          }
          if (_this.isWatch) {
            // 是自己 && 在分组中
            if (msg.sender_id == _this.userId || !_this.isInGroup) {
              return;
            }
            // 是否已添加
            const flag = _this.onlineUsers.find(item => item.account_id == msg.sender_id);
            const speakIndex = _this._getUserIndex(msg.sender_id, _this.getCurrentSpeakerList);
            if (flag) {
              _this.onlineUsers.forEach(item => {
                if (item.account_id == msg.sender_id) {
                  Object.assign(item, {
                    account_id: msg.sender_id,
                    is_banned: msg.data.is_banned,
                    role_name: msg.data.join_role,
                    is_speak: speakIndex >= 0 ? 1 : 0,
                    nickname: msg.data.nickname || msg.data.nick_name,
                    is_apply: 0
                  });
                }
              });
              _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
            } else {
              const user = {
                account_id: msg.sender_id,
                is_banned: msg.data.is_banned,
                role_name: msg.data.join_role,
                is_speak: speakIndex >= 0 ? 1 : 0,
                nickname: msg.data.nickname || msg.data.nick_name,
                is_apply: 0
              };
              _this.onlineUsers.push(user);
              _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
            }
          }
        }
        //主持人/助理进入小组
        function handleHostJoin(msg) {
          if (_this.isLive) {
            ['enter', 'quit'].includes(msg.data.status) && _this.updateOnlineUserList();
          }
        }

        //分组--开始讨论
        function handleStartGroupDiscuss() {
          _this.onlineUsers = [];
          _this.memberServer.updateState('onlineUsers', _this.onlineUsers);
          _this.updateOnlineUserList();
        }
        //
        function handleEndGroupDiscuss(msg) {
          console.log('GROUP_SWITCH_END 分组--结束讨论:', msg);
          _this.onlineUsers = [];
          _this.memberServer.updateState('onlineUsers', _this.onlineUsers);
          _this.updateOnlineUserList();
          _this.leader_id = '';
        }
        //重新获取最新的groupInitData
        function changeGroupInitData(msg) {
          console.log(msg);
          // _this.groupInitData = msg;
        }
        //踢出小组
        function handleGroupKicked(msg) {
          if (isLive) {
            _this.onlineUsers = [];
            _this.getOnlineUserList();
            return;
          }
          if (isWatch) {
            if (!_this.isInGroup) return;
            if (_this.userId == msg.data.target_id) {
              _this.onlineUsers = [];
              _this.getOnlineUserList();
            } else {
              // 不等于时删除该人员
              this._deleteUser(msg.data.target_id, this.onlineUsers, 'onlineUsers');
            }
          }
        }

        //演示权限变更
        function handlePresentationPermissionChange(msg) {
          _this.onlineUsers.forEach(item => {
            if (msg.sender_id == item.account_id) {
              item.is_speak = 1;
            }
          });
        }
      },
      //刷新当前列表数据
      updateOnlineUserList: throttle(function () {
        this.pageConfig.page = 0;
        this.onlineUsers = [];
        this.getOnlineUserList();
      }, 2000),
      //获取在线人员列表
      getOnlineUserList(pos) {
        const _this = this;
        const params = {
          room_id: this.roomId,
          pos: pos || (this.pageConfig.page <= 0 ? 0 : this.pageConfig.page),
          limit: this.pageConfig.limit,
          reset_device_status: 0
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
              this.onlineUsers = this.memberServer.state.onlineUsers || [];
              (this.onlineUsers || []).forEach(item => {
                //更新一下成员的role
                if (_this.isWatch && item.account_id == _this.userId) {
                  _this.roleName = item.role_name;
                }
                //刷新当前的组长id
                if ([20, '20'].includes(item.role_name)) {
                  _this.leader_id = item.account_id;
                }
                //维护举手状态
                if (_this.applyUsers.map(user => user.account_id).includes(item.account_id)) {
                  item.is_apply = 1;
                }
              });

              if (!res?.data?.list?.length) {
                _this.pageConfig.page--;
              }
              //在线总人数
              _this.totalNum = _this.memberServer.state.totalNum;
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
      /**
       * 改变在线人员列表的状态
       */
      changeUserStatus(accountId = '', list = [], obj = {}, key = '') {
        const item = list.find(item => item.account_id === accountId);
        if (!item) {
          return;
        }
        const index = list.findIndex(item => item.account_id === accountId);
        if (index !== -1) {
          Object.assign(item || {}, obj);
          this.$set(list, index, item);
        }
        //因为逻辑暂时还在视图维护，所以也更新一下server里的属性
        this.memberServer.updateState(key, list);
        console.log(this.onlineUsers, '更改后的人员列表');
      },
      //获取受限人员列表
      async getLimitUserList() {
        const _this = this;
        const data = {
          room_id: this.roomId,
          pos: 0,
          limit: 100
        };
        try {
          let bannedList = await _this.memberServer.getMutedUserList(data);
          let kickedList = this.isInGroup
            ? { data: { list: [] } }
            : await _this.memberServer.getKickedUserList(data);
          bannedList = bannedList?.data?.list || [];
          kickedList = kickedList?.data?.list || [];
          const list = bannedList.concat(kickedList);
          const hash = {};
          this.limitedUsers = (list || []).reduce((preVal, curVal) => {
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

        //数据埋点--开启/关闭允许举手
        window.vhallReportForProduct?.toStartReporting(
          element.target.checked ? 110127 : 110128,
          element.target.checked ? 110153 : 110154
        );
        this.micServer
          .setHandsUp(params)
          .then(res => {
            window.vhallReportForProduct?.toResultsReporting(
              element.target.checked ? 110153 : 110154,
              { event_type: 'interface', res, request_id: res?.request_id }
            );
            console.log('switch-mic-status', res);
            if (res.code == 200) {
              this.$message.success({ message: '设置成功' });
            }
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
        if (index === 2) {
          this.raiseHandTip = false;
          this.memberServer.updateState('raiseHandTip', false);
        } else if (index === 3) {
          this.getLimitUserList();
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
        const { account_id = '', is_kicked, is_banned } = params;
        switch (type) {
          case 'setBanned':
            this.setBanned(account_id, is_banned);
            break;
          case 'setKicked':
            this.setKicked(account_id, is_kicked);
            break;
          case 'setSpeaker':
            this.setSpeaker(account_id, true);
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
        window.vhallReportForProduct?.toStartReporting(110194, 110195, {
          params
        });
        this.micServer
          .hostAgreeApply(params)
          .then(res => {
            window.vhallReportForProduct?.toResultsReporting(110195, {
              res,
              event_type: 'interface',
              request_id: res?.request_id
            });
            if (res.code !== 200) {
              this.$message.error(res.msg);
              return;
            }
            this._deleteUser(accountId, this.applyUsers, 'applyUsers');
          })
          .catch(err => {
            window.vhallReportForProduct?.toResultsReporting(110195, {
              res: err
            });
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
            window.vhallReportForProduct?.toStartReporting(110174, 110175);
            this.micServer.userSpeakOn().then(res => {
              window.vhallReportForProduct?.toResultsReporting(110175, {
                request_id: res?.request_id,
                event_type: 'interface',
                res
              });
              if (res.code !== 200) {
                this.$message.error(res.msg);
              }
            });
          } else {
            //数据埋点--邀请上麦
            const cUser = this.onlineUsers.filter(el => {
              return el.account_id == accountId;
            });
            window.vhallReportForProduct?.toStartReporting(110130, 110155, {
              invitee_role: cUser[0].role_name,
              invitee_info: { ...cUser[0] }
            });
            this.micServer
              .inviteMic({
                room_id: this.roomId,
                receive_account_id: accountId
              })
              .then(res => {
                window.vhallReportForProduct?.toResultsReporting(110155, {
                  request_id: res?.request_id,
                  event_type: 'interface',
                  receive_account_id: accountId,
                  res
                });
                if (res.code == 200) {
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
          receive_account_id: this.userId == accountId && this.guestHasInvitePer ? null : accountId // 当前嘉宾为主讲人且下麦的人是自己时，下麦自己不传此参数，即可归还主讲人权限
        };
        const cUser = this.onlineUsers.filter(el => {
          return el.account_id == accountId;
        });
        if (this.userId == accountId && this.roleName == 1) {
          // 主持人下麦自己
          window.vhallReportForProduct?.toStartReporting(110172, 110173);
        } else {
          window.vhallReportForProduct?.toStartReporting(110133, 110157, {
            expelled_role: cUser[0].role_name,
            info_of_expelleds: { ...cUser[0] }
          });
        }
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
                if (this.userId == accountId && this.roleName == 1) {
                  // 主持人下麦自己
                  window.vhallReportForProduct?.toResultsReporting(110173, {
                    request_id: res?.request_id,
                    event_type: 'interface',
                    reasonTxt: '演示中下麦,演示自动结束',
                    res
                  });
                } else {
                  window.vhallReportForProduct?.toResultsReporting(110157, {
                    request_id: res?.request_id,
                    event_type: 'interface',
                    res
                  });
                }
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
              if (this.userId == accountId && this.roleName == 1) {
                // 主持人下麦自己
                window.vhallReportForProduct?.toResultsReporting(110173, {
                  request_id: res?.request_id,
                  event_type: 'interface',
                  res
                });
              } else {
                window.vhallReportForProduct?.toResultsReporting(110157, {
                  request_id: res?.request_id,
                  event_type: 'interface',
                  res
                });
              }
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
      setSpeaker(accountId, alert, setMainScreen = true) {
        if (alert) {
          const stream = this.interactiveServer.getDesktopAndIntercutInfo();
          if (stream) {
            this.popAlert.visible = true;
            this.popAlert.presenter = accountId;
            return;
          }
        }
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
        if (this.userId == accountId) {
          window.vhallReportForProduct?.toStartReporting(110176, 110177, {
            rejection_method: encodeURIComponent('成员列表主持人将自己设置为主讲人')
          }); // 主持人将自己设为主讲人
        } else {
          let cUser = this.onlineUsers.filter(el => {
            return el.account_id == accountId;
          });
          window.vhallReportForProduct?.toStartReporting(110169, [110170, 110171], {
            rejection_method: encodeURIComponent('成员列表设置嘉宾为主讲人'),
            guest_info: cUser[0]
          }); // 主持人将嘉宾设为主讲人
        }
        return this.interactiveServer
          .setSpeaker({
            receive_account_id: accountId
          })
          .then(res => {
            window.vhallReportForProduct?.toResultsReporting(
              this.userId == accountId ? 110177 : 110170,
              {
                request_id: res?.request_id,
                event_type: 'interface',
                res
              }
            );

            console.log('setSpeaker success ::', res);
          })
          .catch(err => {
            console.log('setSpeaker failed ::', err);
          });
      },
      //邀请演示
      inviteMic(accountId = '') {
        const isLeader = accountId === this.leader_id;
        const isSpeaker = accountId === this.getCurrentSpeakerId;

        if (this.isWatch && (isLeader || isSpeaker)) return;

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
                this.$message.success(this.$t('message.message_1034'));
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
                this._deleteUser(accountId, this.onlineUsers, 'onlineUsers');
                this._deleteUser(accountId, this.applyUsers, 'applyUsers');
              } else {
                // 取消踢出只能在受限列表操作
                this.getLimitUserList();
              }
            });
          })
          .catch(() => {});
      },
      //删除用户
      _deleteUser(accountId, list = [], key = '') {
        const index = list.findIndex(
          item => ![null, void 0, ''].includes(accountId) && item.account_id === accountId
        );

        if (index !== -1) {
          list.splice(index, 1);
          this.memberServer.updateState(key, list);
        }
      },
      //查找用户在数组的索引号
      _getUserIndex(accountId, list) {
        return list.findIndex(
          item => item.account_id === accountId || item.accountId === accountId
        );
      },
      //加载更多
      loadMore() {
        if (this.onlineUsers.length >= this.pageConfig.limit) {
          this.pageConfig.page++;
          this.getOnlineUserList();
        }
      },
      //滚动条位置更新
      refresh() {
        if (this.$refs && this.$refs.scroll) {
          this.$refs.scroll.refresh();
        }
      },
      getGroupedUserLength() {
        if (!this.groupServer.state.groupedUserList) return 0;
        if (!this.groupServer.state.groupedUserList.length) return 0;
        return this.groupServer.state.groupedUserList.reduce(
          (preVal, curVal) => preVal + curVal.group_joins.length,
          0
        );
      },
      handleTabSwitched(data) {
        if (data.type === 8) {
          // 如果是成员列表
          this.$nextTick(() => {
            this.refresh();
          });
        }
      },
      initMenuServerEvent() {
        this.menuServer.$on('tab-switched', this.handleTabSwitched);
      },
      removeMenuServerEvent() {
        this.menuServer.$off('tab-switched', this.handleTabSwitched);
      },
      // 停止桌面共享或插播
      stopShareOrInsert() {
        if (this.isShareScreen && this.accountId == this.desktopShareInfo.accountId) {
          // 自己正在发起桌面共享
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickStopShare', 'setMainScreen')
          );
        } else if (this.isCurrentRoleInsert) {
          // 正在插播
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickStopInsert'));
        }
        this.setSpeaker(this.popAlert.presenter);
        this.popAlert.visible = false;
      },
      // 关闭弹窗
      closeConfirm() {
        this.popAlert.visible = false;
      }
    }
  };
</script>

<style lang="less">
  .vmp-member-dropdown-menu.el-dropdown-menu {
    background-color: var(--header-tab-item-dropdown-color) !important;
    .el-dropdown-menu__item:hover {
      color: var(--group-more-mute-font-color) !important;
    }
  }
  .vmp-member-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    background-color: var(--theme-menu-bg);
    &__group-name {
      display: flex;
      align-items: center;
      padding: 18px 20px 5px;
      color: var(--group-name-icon-font-color);
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
      background-color: var(--theme-menu-bg);
      box-sizing: border-box;
      color: #e2e2e2;
      border-top: 1px solid var(--theme-menu-bg);
      .vh-saas-a-line-Onlinelist {
        margin-top: -3px;
        vertical-align: middle;
        margin-right: 4px;
        color: var(--group-online-icon-color);
      }
      .info-panel__online-num {
        display: inline-block;
        margin-left: 6px;
        color: var(--group-online-font-color);
      }
      .info-panel__refresh-btn {
        display: inline-block;
        margin-left: 6px;
        color: var(--group-refresh-font-color);
        cursor: pointer;
        &:hover {
          color: var(--theme-color);
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
            background-color: #434343;
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
              border: 2px solid #aaa;
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
          background-color: var(--group-btn-bg-color);
          color: var(--group-btn-font-color);
          float: left;
          cursor: pointer;
          position: relative;
          margin-right: 1px;
          &:hover {
            background-color: var(--group-btn-hover-color);
            color: var(--group-btn-hover-font-color);
          }
          &.active {
            background-color: var(--group-btn-active-color);
            color: var(--group-btn-active-font-color);
            // &:hover {
            //   color: #e6e6e6;
            //   background-color: #595959;
            // }
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
              background-color: var(--theme-color);
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
          background-color: var(--group-btn-bg-color);
          color: var(--group-btn-font-color);
        }
      }
      &__search-panel {
        display: flex;
        width: calc(100% - 20px);
        height: 30px;
        position: absolute;
        top: 4px;
        left: 10px;
        background-color: var(--group-search-input-bg2-color);
        border-radius: 4px;
        overflow: hidden;

        .search-panel__input {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          background-color: var(--group-search-input-bg-color);
          padding: 0 75px 0 10px;
          border: none;
          color: var(--group-search-input-font-color);
          &::-webkit-input-placeholder {
            color: var(--group-search-placeholder-color);
          }
          &::-moz-input-placeholder {
            color: var(--group-search-placeholder-color);
          }
          &::-ms-input-placeholder {
            color: var(--group-search-placeholder-color);
          }
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
          background-color: var(--group-search-bg-color);
          color: var(--group-search-font-color);
          position: absolute;
          top: 0;
          right: 0;
          cursor: pointer;
        }
      }
    }
  }
</style>
