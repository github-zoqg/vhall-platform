<template>
  <div class="vmp-member-list">
    <!--分组名称-->
    <div class="vmp-member-list__group-name" v-if="isInGroup">
      <i class="vh-iconfont vh-line-group"></i>
      <span class="pr_top">{{ groupInitData.name }}</span>
    </div>
    <!--成员区域-->
    <div class="vmp-member-list__container">
      <scroll class="vmp-member-list__container__scroll" ref="scroll" @pullingUp="loadMore">
        <!--全部成员-->
        <template v-if="tabIndex === 1">
          <div class="member-list__all-tab">
            <div
              v-if="searchEmpty"
              class="empty-container"
              :style="{ 'padding-top': `${this.emptyContainerPaddingTop}px` }"
            >
              <span class="vh-saas-iconfont vh-saas-zanwusousuo"></span>
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
              <span class="vh-saas-iconfont vh-saas-zanwujushou"></span>
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
              <span class="vh-saas-iconfont vh-saas-zanwuchengyuan"></span>
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
        <span class="info-panel__online-num" v-if="isShowBtn(configList['ui.hide_host_nums'])">
          {{ totalNum | numberCompression }}人在线
        </span>
        <span class="info-panel__refresh-btn" @click="refreshList">
          {{ $t('webinar.webinar_1032') }}
        </span>
        <div
          class="info-panel__allow-raise-hand"
          v-if="configList['ui.hide_handsUp'] && mode !== 6"
        >
          <!--          <span class="info-panel__allow-raise-hand__switch-title">允许举手</span>-->
          <!--          <el-switch-->
          <!--            v-model="allowRaiseHand"-->
          <!--            :width="32"-->
          <!--            :disabled="disabledSwitchHand"-->
          <!--            @change="onSwitchAllowRaiseHand"-->
          <!--            active-color="#fc5659"-->
          <!--          ></el-switch>-->
          <label class="lb-raisehands" for="lb-raisehands">
            允许举手
            <input
              style="display: none"
              v-model="allowRaiseHand"
              @change="onSwitchAllowRaiseHand"
              type="checkbox"
              id="lb-raisehands"
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
  import * as _ from 'lodash';
  import { sleep } from '@/packages/app-shared/utils/tool';
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
        //上麦人员列表
        speakerList: [],
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
        //
        /** 搜索输入框结束 */
        // 容器内边距
        emptyContainerPaddingTop: 10,
        //当前主讲人的id
        currentSpeakerId: '',
        //当前演示者的id
        presentation_screen: '',
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
          limit: 10
        },
        // 举手列表定时器列表
        handsUpTimerList: {},
        // 上麦人员掉线处理计时器map
        speakerLeaveIntervalMap: {},
        //切换举手状态,防连点
        disabledSwitchHand: false,
        //组长的id
        leaderId: '',
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
    beforeDestroy() {},
    async mounted() {
      //初始化配置
      this.initConfig();
      //初始化视图数据
      await this.initViewData();
      this.isLive && this.handleStartGroup();
      //开始初始化流程
      this.init();
      this.listenEvent();
      //初始化主讲人id
      this.currentSpeakerId = this.groupInitData.isInGroup
        ? this.groupInitData.doc_permission
        : this.interactToolStatus.doc_permission;
      this.presentation_screen = this.groupInitData.presentation_screen;
      this.isWatch && this.changeSpeakerList();
    },
    watch: {
      roleName(newVal, oldVal) {
        this.roleName = newVal;
        console.log(oldVal);
      },
      leader_id: {
        handler(newVal, oldVal) {
          // this.leader_id = newVal;
          if (newVal == oldVal) return;
          this.handleLeaderChange(newVal, oldVal);
        },
        immediate: true
      },
      onlineUsers: {
        handler(newVal) {
          if (this.memberOptions.platformType === 'watch' && newVal && newVal.length) {
            this.onlineSpeakerList = newVal.filter(item => {
              return item.is_speak;
            });
          }
        },
        deep: true,
        immediate: true
      }
    },
    computed: {
      //是否显示底部区域
      isShowBottom() {
        let show = true;
        if (this.memberOptions.platformType === 'watch') {
          return this.leader_id == this.userId && this.isInGroup;
        }
        if (this.memberOptions.platformType === 'live') {
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
        return this.$domainStore.state.roomBaseServer.configList;
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
        let currentSpeakerId = '';
        const _this = this;
        if (this.isInGroup) {
          currentSpeakerId = _this.groupServer.state.groupInitData.doc_permission;
        } else {
          currentSpeakerId = _this.interactToolStatus.doc_permission;
        }
        return currentSpeakerId;
      },
      //找到当前的主屏
      getCurrentMainScreen() {
        let current = '';
        if (this.isInGroup) {
          current = this.groupServer.state.groupInitData.main_screen;
        } else {
          current = this.interactToolStatus.main_screen;
        }
        return current;
      },
      //找到当前的演示屏幕
      getCurrentPresentationScreen() {
        let current = '';
        if (this.isInGroup) {
          current = this.groupServer.state.groupInitData.presentation_screen;
        } else {
          current = this.interactToolStatus.presentation_screen;
        }
        return current;
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
        //初始化一下视图里初始的上麦列表
        this.changeSpeakerList();
      },
      //统一初始化方法
      init() {
        this.getOnlineUserList();
      },
      //开始讨论后的处理（发起端）
      handleStartGroup() {
        const _this = this;
        // 开始讨论后重新初始化页面
        console.log('开始分组讨论');
        this.msgServer.$onMsg('ROOM_MSG', rawMsg => {
          let temp = Object.assign({}, rawMsg);
          if (Object.prototype.toString.call(temp.data) !== '[object Object]') {
            temp.data = JSON.parse(temp.data);
            temp.context = JSON.parse(temp.context);
          }
          const { type = '' } = temp.data || {};
          if (type === 'start_discussion') {
            _this.init();
            // _this.listenEvent();
            //初始化主讲人id
            _this.currentSpeakerId = _this.groupInitData.isInGroup
              ? _this.groupInitData.doc_permission
              : _this.interactToolStatus.doc_permission;
            _this.presentation_screen = _this.groupInitData.presentation_screen;
          }
        });
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
              _this.changeUserStatus(temp.data.target_id, _this.onlineUsers, {
                is_banned: 1
              });
              _this.changeUserStatus(temp.data.target_id, _this.limitedUsers, {
                is_banned: 1
              });
              _this.changeUserStatus(temp.data.target_id, _this.applyUsers, {
                is_banned: 1
              });
              // 禁言并且是举手列表
              if (_this.tabIndex === 2) {
                _this._deleteUser(temp.data.target_id, _this.applyUsers);
              }
              break;
            case 'permit':
              _this.changeUserStatus(temp.data.target_id, _this.onlineUsers, {
                is_banned: 0
              });
              _this.changeUserStatus(temp.data.target_id, _this.limitedUsers, {
                is_banned: 0
              });
              _this.changeUserStatus(temp.data.target_id, _this.applyUsers, {
                is_banned: 0
              });
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
              console.log(temp.data, '用户申请上麦');
              //用户申请上麦
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
            case 'vrtc_speaker_switch':
              //互动设置主讲人
              handleChangeSpeaker(temp);
              break;
            case 'vrtc_connect_device_check':
              //设备检测
              handleDeviceCheck(temp);
              break;
            case 'kicked_in_chat':
            case 'room_kickout':
              handleKicked(temp);
              break;
            case 'vrtc_connect_presentation_refused':
              //用户拒绝了演示邀请
              isLive && handleUserRejectPresentation(temp);
              break;
            case 'vrtc_disconnect_presentation_success':
              //用户主动结束演示
              handleUserEndPresentation(temp);
              break;
            case 'main_room_join_change':
              handleMainRoomJoinChange(temp);
              break;
            case 'endLive':
              handleEndLive(temp);
              break;
            case 'live_over':
              handleLiveOver(temp);
              break;
            case 'room_kickout_cancel':
              handleRoomCancelKickOut(temp);
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
        function handleLiveOver(msg) {
          console.log(msg);
          const hostUserId = this.roomBaseServer.state.watchInitData.webinar.userinfo.user_id;
          // 结束直播时当前主讲人不是主持人， 就设置为主持人
          if (this.currentSpeakerId != hostUserId) {
            this.currentSpeakerId = hostUserId;
          }
          setTimeout(() => {
            _this.refreshList();
          }, 1000);
        }

        //设备检测
        function handleDeviceCheck(msg) {
          const { member_info = {} } = msg.data;
          if (![2, '2'].includes(msg.data.device_type)) {
            _this.changeUserStatus(msg.data.room_join_id, _this.onlineUsers, member_info);
          }
          if (![0, '0'].includes(msg.data.device_status)) {
            _this.changeUserStatus(msg.data.room_join_id, _this.onlineUsers, member_info);
          }
        }
        //用户加入房间
        function handleUserJoinRoom(msg) {
          try {
            console.log('_this.groupServer:', _this.groupServer);
            console.log('_this.isInGroup:', _this.isInGroup);
            const { isLive, isWatch } = _this;
            const { context } = msg;

            // 上线的人是自己，不做操作
            if (isLive && msg.sender_id == _this.userId) {
              return;
            }

            let index = _this._getUserIndex(msg.sender_id, _this.onlineUsers);

            if (isWatch) {
              _this.speakerList = _this.isInGroup
                ? _this.groupInitData.speaker_list
                : _this.interactToolStatus.speaker_list || [];
              _this.totalNum = msg.uv;
            }

            // 如果是分组直播 主持人/助理在主房间,小组内观众上线
            if (isLive && _this.mode === 6) {
              if (!_this.isInGroup && context.groupInitData?.isInGroup) {
                return false;
              }
            }

            if (isLive) {
              const groupUsersNumber = _this.groupServer.state.groupedUserList.length || 0;
              _this.totalNum = _this.isInGroup
                ? msg.uv
                : msg.uv -
                  ([1, 2, '1', '2'].includes(_this.interactToolStatus.is_open_switch)
                    ? groupUsersNumber
                    : 0);
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
            const speakIndex = _this._getUserIndex(msg.sender_id, _this.speakerList);

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
              _this.onlineUsers.push(user);
              _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
              setTimeout(() => {
                _this.refresh();
              }, 100);
              if (msg.context.role_name == 4) {
                if (msg.sender_id == _this.userId) {
                  return;
                }
                _this.$message({
                  message: _this.$t('message.message_1030', { n: msg.context.nickname }),
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
                        is_speak: speakIndex >= 0 ? 1 : 0
                      });
                    }
                  });
                  _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
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
                  _this.onlineUsers.push(user);
                  _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
                }
              } else {
                const user = {
                  account_id: msg.sender_id,
                  avatar: context.avatar,
                  device_status: context.device_status,
                  device_type: context.device_type,
                  is_banned: Number(context.is_banned),
                  nickname: context.nickname,
                  role_name: context.role_name,
                  is_speak: speakIndex >= 0 ? 1 : 0,
                  is_apply: 0
                };
                _this.onlineUsers.push(user);
                _this.onlineUsers = _this.memberServer._sortUsers(_this.onlineUsers);
                if (msg.context.role_name == 4) {
                  if (msg.sender_id == _this.userId) {
                    return;
                  }
                  _this.$message({
                    message: _this.$t('message.message_1030', { n: msg.context.nickname }),
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
          if (msg.context.isAuthChat) return; // 如果是聊天审核页面不做任何操作

          if (isLive) {
            _this.totalNum = _this.isInGroup
              ? msg.uv
              : msg.uv -
                ([1, 2, '1', '2'].includes(_this.interactToolStatus.is_open_switch)
                  ? _this.groupServer.state.groupedUserList.length
                  : 0);
          }

          if (isWatch) {
            _this.totalNum = msg.uv;
          }
          _this.totalNum < 0 && (_this.totalNum = 0);
          _this._deleteUser(msg.sender_id, _this.onlineUsers, 'leave');
          _this._deleteUser(msg.sender_id, _this.applyUsers);
          setTimeout(() => {
            _this.refresh();
          }, 50);
          if (msg.context.role_name == 1 && _this.roleName != 1) {
            _this.$message.warning({ message: _this.$t('message.message_1027') });
          }
          if (msg.context.role_name == 4) {
            _this.$message.warning({
              message: _this.$t('message.message_1029', {
                n: msg.context.nickname || msg.context.nick_name
              })
            });
          }
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
          let user = {
            account_id: msg.data.room_join_id,
            avatar: msg.data.avatar,
            device_status: msg.data.device_status,
            device_type: msg.data.device_type,
            nickname: msg.data.nick_name,
            role_name: msg.data.room_role
          };
          const { member_info = { is_apply: 1 } } = msg.data;
          user = Object.assign(user, member_info);
          _this.applyUsers.unshift(user);

          _this.applyUsers = _.uniqBy(_this.applyUsers, 'account_id'); // 去重
          _this.changeUserStatus(user.account_id, _this.onlineUsers, member_info);
          // 申请30秒后从列表去掉
          _this.handsUpTimerList[user.account_id] &&
            clearTimeout(_this.handsUpTimerList[user.account_id]);
          delete _this.handsUpTimerList[user.account_id];
          _this.handsUpTimerList[user.account_id] = window.setTimeout(() => {
            _this.handsUpTimerList[user.account_id] &&
              clearTimeout(_this.handsUpTimerList[user.account_id]);
            delete _this.handsUpTimerList[user.account_id];
            _this.changeUserStatus(user.account_id, _this.onlineUsers, {
              is_apply: 0
            });
            _this.applyUsers = _this.applyUsers.filter(u => u.account_id !== user.account_id);
            if (!_this.applyUsers.length) {
              _this.raiseHandTip = false;
            }
          }, 30000);
          //todo 信令通知其他组件(比如自定义菜单组件，有红点)
          // this.$emit('memberUpdata');
        }
        //用户取消上麦申请
        function handleCancelApplyConnect(msg) {
          const { member_info = { is_apply: 0 } } = msg.data;
          //发起端举手提示
          _this.raiseHandTip = false;
          _this._deleteUser(msg.data.room_join_id, _this.applyUsers);
          _this.changeUserStatus(msg.data.room_join_id, _this.onlineUsers, member_info);
          _this.handsUpTimerList[msg.data.room_join_id] &&
            clearTimeout(_this.handsUpTimerList[msg.data.room_join_id]); // 取消下麦清除定时器
          delete _this.handsUpTimerList[msg.data.room_join_id];
        }
        //同意用户上麦
        function handleAgreeApplyConnect(msg) {
          if (_this.memberOptions.platformType === 'live') {
            _this.raiseHandTip = false;
            return;
          }
          if (_this.memberOptions.platformType === 'watch') {
            _this.changeUserStatus(msg.room_join_id, _this.onlineUsers, {
              is_apply: 0,
              is_speak: 1
            });
          }
        }
        //用户上麦成功
        function handleSuccessConnect(msg) {
          const { member_info = { is_apply: 0, is_speak: 1 } } = msg.data;
          _this.changeUserStatus(msg.data.room_join_id, _this.onlineUsers, member_info);
          if (msg.data.room_join_id == _this.userId && msg.data.room_role == 2) {
            return;
          }
          if (_this.isInteract !== 1 && msg.data.room_role == 1) {
            _this.$message.success({ message: '直播发起成功' });
            return;
          }
          if (msg.data.room_join_id == _this.userId) {
            _this.$message.success({ message: '您已上麦' });
          } else {
            msg.data.room_role != 2 &&
              _this.$message.success({ message: `${msg.data.nick_name}已上麦` });
          }
          _this.handsUpTimerList[msg.data.room_join_id] &&
            clearTimeout(_this.handsUpTimerList[msg.data.room_join_id]); // 取消下麦清楚定时器
          delete _this.handsUpTimerList[msg.data.room_join_id];
        }
        //用户拒绝上麦邀请
        function handleUserRejectConnect(msg) {
          // 如果申请人是自己
          if (msg.data.room_join_id == _this.userId || _this.roleName != 1) {
            return;
          }
          let role = '';
          if (msg.data.room_role == 2) {
            role = _this.$t('chat.chat_1063');
          } else if (msg.data.room_role == 4) {
            role = _this.$t('chat.chat_1023');
          }
          if (msg.data.extra_params == _this.userId) {
            _this.$message.warning({
              message: `${role}${msg.data.nick_name}拒绝了你的上麦邀请`
            });
          }
        }
        //互动连麦成功断开链接
        function handleSuccessDisconnect(msg) {
          // const { member_info = { is_speak: 0, is_apply: 0 } } = msg.data;
          _this.changeUserStatus(msg.data.target_id, _this.onlineUsers, {
            is_speak: 0,
            is_apply: 0
          });

          //如果是观看端，还要维护一下上麦列表
          if (_this.isWatch) {
            _this.changeSpeakerList();
            _this.speakerList = _this.speakerList.filter(item => item.account_id != msg.sender_id);
          }

          //提示语
          if (msg.data.target_id == _this.userId) {
            _this.$message.success({ message: _this.$t('interact.interact_1028') });
            return;
          }

          // 当前用户ID,解决俩次触发vrtc_connect_success会提示两次下麦消息
          if (_this.LocalCatchTarget_id != msg.data.target_id) {
            _this.LocalCatchTarget_id = msg.data.target_id;
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
        //互动设置主讲人
        function handleChangeSpeaker(msg) {
          console.log(msg, '互动设置主讲人');
          if (_this.isWatch) {
            return;
          }
          _this.currentSpeakerId = msg.data.room_join_id;
        }
        //处理踢出人员
        function handleKicked(msg) {
          _this._deleteUser(msg.accountId, _this.onlineUsers);
          _this._deleteUser(msg.accountId, _this.applyUsers);
          //刷新下受限列表
          _this.getLimitUserList();
          _this.refreshList();
        }
        //用户拒绝邀请演示
        function handleUserRejectPresentation(msg) {
          // 如果申请人是自己
          if (msg.data.room_join_id == _this.userId || _this.roleName != 1) {
            return;
          }
          let role = '';
          if (msg.data.room_role == 2) {
            role = '观众';
          } else if (msg.data.room_role == 4) {
            role = '嘉宾';
          }
          if (msg.data.extra_params == _this.userId) {
            _this.$message.warning({
              message: `${role}${msg.data.nick_name}拒绝了你的演示邀请`
            });
          }
        }
        //用户主动结束演示
        function handleUserEndPresentation(msg) {
          console.log(msg);
          if (_this.isWatch) {
            _this.presentation_screen = _this.leader_id;
          }
        }
        //主房间人员变动
        function handleMainRoomJoinChange(msg) {
          //必须在主房间
          if (!_this.isInGroup) return;

          if (isLive) {
            _this.totalNum = msg.uv - _this.groupServer.state.groupedUserList.length;
            _this.totalNum = _this.totalNum >= 0 ? _this.totalNum : 0;
            // 如果sender_id==自己
            if (msg.sender_id == _this.userId) {
              _this.totalNum++;
            }
          }

          if (msg.data.isJoinMainRoom) {
            const flag = _this.onlineUsers.find(item => item.account_id == msg.sender_id);
            if (flag) return false;
            _this.onlineUsers.push({
              nickname: msg.data.nickname,
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
            case 'vrtc_connect_presentation_agree':
              //用户被邀请演示-同意演示
              isWatch && agreePresentation(temp);
              break;
            case 'vrtc_connect_presentation_success':
              //演示权限变更
              isWatch && handlePresentationPermissionChange(temp);
              break;
            case 'room_vrtc_disconnect_success':
              //下麦成功
              isWatch && handleRoomDisconnectSuccess(temp);
              break;
            default:
              break;
          }
        });

        //为上线的分组成员添加身份
        this.groupServer.$on('GROUP_JOIN_INFO', msg => {
          handleSetUserJoinInfo(msg);
        });

        // only 发起端（开始分组讨论）
        this.groupServer.$on('GROUP_SWITCH_START', msg => {
          isLive && handleStartGroupDiscuss(msg);
        });

        // 切换channel TODO: ???????疑问点
        this.groupServer.$on('GROUP_MSG_CREATED', msg => {
          isLive && handleStartGroupDiscuss(msg);
        });

        //  结束讨论
        this.groupServer.$on('GROUP_SWITCH_END', msg => {
          console.log('GROUP_SWITCH_END', msg);
          handleEndGroupDiscuss(msg);
        });

        // 换组
        this.groupServer.$on('GROUP_JOIN_CHANGE', msg => {
          isLive && this.updateOnlineUserList(msg);
          isWatch && handleGroupChange(msg);
        });

        // 踢出小组
        this.groupServer.$on('ROOM_GROUP_KICKOUT', msg => {
          handleGroupKicked(msg);
        });

        // 解散分组(主播&观看均更新)
        this.groupServer.$on('GROUP_DISBAND', () => {
          this.updateOnlineUserList();
        });

        // 切换组长(组长变更)
        this.groupServer.$on('GROUP_LEADER_CHANGE', msg => {
          if (isLive) return;
          this.leader_id = msg.data.account_id;
          this.getOnlineUserList();
        });

        // 主持人进入退出小组 消息监听
        this.groupServer.$on('GROUP_MANAGER_ENTER', msg => {
          handleHostJoin(msg);
        });

        // 频道变更-开始讨论(刷新数据)
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', msg => {
          isWatch && handleRoomChannelChange(msg);
        });

        // 邀请演示-同意
        // this.groupServer.$on('VRTC_CONNECT_PRESENTATION_AGREE', msg => {
        //   if (!isWatch) return;
        //
        //   if (this.roleName == 20) {
        //     this.$message({
        //       message: '对方已接受邀请',
        //       showClose: true,
        //       // duration: 0,
        //       type: 'success',
        //       customClass: 'zdy-info-box'
        //     });
        //   }
        //   this.presentation_screen = msg.sender_id;
        // });

        // 同意邀请演示成功消息
        // this.groupServer.$on('VRTC_CONNECT_PRESENTATION_SUCCESS', msg => {
        //   isWatch && handlePresentationPermissionChange(msg);
        // });

        // 下麦成功
        this.micServer.$on('vrtc_disconnect_success', msg => {
          isWatch && handleRoomDisconnectSuccess(msg);
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
            _this.speakerList = _this.groupInitData.isInGroup
              ? msg.data.speaker_list
              : _this.interactToolStatus.speaker_list || [];
            // 是否已添加
            const flag = _this.onlineUsers.find(item => item.account_id == msg.sender_id);
            const speakIndex = _this._getUserIndex(msg.sender_id, _this.speakerList);
            if (flag) {
              _this.onlineUsers.forEach(item => {
                if (item.account_id == msg.sender_id) {
                  Object.assign(item, {
                    account_id: msg.sender_id,
                    is_banned: msg.data.is_banned,
                    role_name: msg.data.join_role,
                    is_speak: speakIndex >= 0 ? 1 : 0,
                    nickname: msg.data.nickname,
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
                nickname: msg.data.nickname,
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
            if (msg.data.status == 'enter') {
              setTimeout(() => {
                _this.onlineUsers = [];
                _this.getOnlineUserList();
              }, 1000);
            } else if (msg.data.status == 'quit') {
              _this.onlineUsers = [];
              _this.getOnlineUserList();
            }
            return;
          }
          if (_this.isWatch) {
            // 进入小组重置演示人id
            _this.presentation_screen = _this.groupServer.state.presentation_screen;
          }
        }

        //分组--开始讨论
        function handleStartGroupDiscuss() {
          _this.onlineUsers = [];
          _this.getOnlineUserList();
        }
        //
        function handleEndGroupDiscuss(msg) {
          console.log('GROUP_SWITCH_END 分组--结束讨论:', msg);
          _this.onlineUsers = [];
          _this.getOnlineUserList();
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
              _this.onlineUsers.forEach((item, index) => {
                if (item.account_id == msg.data.target_id) {
                  _this.onlineUsers.splice(index, 1);
                }
              });
            }
          }
        }

        //用户被邀请演示-同意演示
        function agreePresentation(msg) {
          if (_this.roleName == 20) {
            _this.$message({
              message: '对方已接受邀请',
              showClose: true,
              // duration: 0,
              type: 'success',
              customClass: 'zdy-info-box'
            });
          }
          _this.presentation_screen = msg.sender_id;
        }
        //演示权限变更
        function handlePresentationPermissionChange(msg) {
          _this.onlineUsers.forEach(item => {
            if (msg.sender_id == item.account_id) {
              item.is_speak = 1;
            }
          });
        }
        //组长变更
        function handleLeaderChange(msg) {
          _this.leader_id = msg.data.account_id;
          _this.getOnlineUserList();
        }
        //切换频道(开始讨论也会调这里)
        async function handleRoomChannelChange(msg) {
          console.log(msg);
          //todo 待确认切换频道事件和这里的mainScreen
          _this.mainScreen = _this.groupServer.state.groupInitData.main_screen;
          _this.presentation_screen = _this.groupServer.state.groupInitData.presentation_screen;
          await sleep(1000);
          _this.onlineUsers = [];
          _this.getOnlineUserList();
        }
        //切换小组
        async function handleGroupChange(msg) {
          console.log(msg, '切换小组的msg');
          // 进入小组重置演示人id
          _this.presentation_screen = _this.groupServer.state.main_screen;
          // 初始化互动实例
          await this.interactiveServer.init();
        }
        //下麦成功
        function handleRoomDisconnectSuccess(msg) {
          if (msg.data.target_id == _this.presentation_screen) {
            _this.presentation_screen = _this.leader_id;
          }
        }
      },
      // 更新上麦人员列表
      changeSpeakerList() {
        this.speakerList = this.groupServer.state.groupInitData.isInGroup
          ? this.groupInitData.speaker_list || []
          : this.interactToolStatus.speaker_list || [];
      },
      handleLeaderChange(newVal, oldVal) {
        // 如果被设为了组长，接管权限拥有者掉线的异常处理
        if (newVal == this.userId) {
          this.msgServer.$onMsg('LEFT', this.handleRoomLeaveForLeader);
          this.msgServer.$onMsg('JOIN', this.handleRoomJoinForLeader);
        }
        // 如果自己不是组长了，注销事件
        if (oldVal == this.userId) {
          this.msgServer.$offMsg('LEFT', this.handleRoomLeaveForLeader);
          this.msgServer.$offMsg('JOIN', this.handleRoomJoinForLeader);
        }
      },
      handleRoomLeaveForLeader(msg) {
        this.handlePermissionLeave(msg);
        this.handleSpeakerLeave(msg);
      },
      handleRoomJoinForLeader(msg) {
        this.handleSpeakerBack(msg);
      },
      // 演示权限人员掉线异常处理
      handlePermissionLeave(msg) {
        // 如果是当前主讲人掉线，启动异常处理流程
        if (msg.sender_id == this.getCurrentSpeakerId) {
          this._permissionLeaveId = msg.sender_id;
          this.msgServer.$onMsg('JOIN', this.handlePermissionJoin);
          this._permissionLeaveInterval = window.setTimeout(() => {
            // 15秒后自动结束演示
            this.downMic(this._permissionLeaveId, false);
            this.msgServer.$offMsg('JOIN', this.handlePermissionJoin);
          }, 15000);
        }
      },
      // 演示权限人员掉线又重新上线
      handlePermissionJoin(msg) {
        if (this._permissionLeaveId == msg.sender_id) {
          this._permissionLeaveInterval && window.clearTimeout(this._permissionLeaveInterval);
          this.msgServer.$offMsg('JOIN', this.handlePermissionJoin);
        }
      },
      // 上麦人员掉线异常处理
      handleSpeakerLeave(msg) {
        const isInArray =
          (this.onlineSpeakerList || []).findIndex(item => msg.sender_id == item.account_id) > -1;
        if (isInArray) {
          this.speakerLeaveIntervalMap[msg.sender_id] = setTimeout(() => {
            this.speakerLeaveIntervalMap[msg.sender_id] &&
              clearTimeout(this.speakerLeaveIntervalMap[msg.sender_id]);
            delete this.speakerLeaveIntervalMap[msg.sender_id];
            this.downMic(msg.sender_id, false);
          }, 15000);
        }
      },
      // 上麦人员掉线又重新上线
      handleSpeakerBack(msg) {
        if (this.speakerLeaveIntervalMap[msg.sender_id]) {
          this.speakerLeaveIntervalMap[msg.sender_id] &&
            clearTimeout(this.speakerLeaveIntervalMap[msg.sender_id]);
          delete this.speakerLeaveIntervalMap[msg.sender_id];
        }
      },
      updateOnlineUserList() {
        this.onlineUsers = [];
        this.getOnlineUserList();
      },
      //获取在线人员列表
      getOnlineUserList(pos) {
        const _this = this;
        const params = {
          room_id: this.roomId,
          pos: pos || (this.pageConfig.page <= 0 ? 0 : 10 * this.pageConfig.page),
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

              if (!this.onlineUsers.length) {
                this.pageConfig.page--;
              }
              //在线总人数
              this.totalNum = this.memberServer.state.totalNum;
              setTimeout(() => {
                _this.refresh();
              }, 50);
            }
            if (![200, '200'].includes(res.code)) {
              this.pageConfig.page--;
            }
          })
          .catch(() => {
            this.pageConfig.page--;
          });
      },
      /**
       * 改变在线人员列表的状态
       */
      changeUserStatus(accountId = '', list = [], obj = {}) {
        console.log('更改上麦状态', accountId, list, obj);
        const item = list.find(item => item.account_id === accountId);
        if (!item) {
          return;
        }
        const index = list.findIndex(item => item.account_id === accountId);
        if (index !== -1) {
          Object.assign(item || {}, obj);
          this.$set(list, index, item);
        }
        console.log(this.onlineUsers, '更改后的人员列表');
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
          this.$message.error(this.$t('512521'));
          return;
        }
        const params = {
          room_id: this.roomId,
          status: status ? 1 : 0
        };

        //todo 待micServer这边完善方法
        this.disabledSwitchHand = true;
        this.micServer
          .setHandsUp(params)
          .then(res => {
            console.log('switch-mic-status', res);
            //todo 上报埋点
            this.disabledSwitchHand = false;
            this.$message.success({ message: '设置成功' });
          })
          .catch(err => {
            this.disabledSwitchHand = false;
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
        //todo 埋点上报
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
          this.$message.error(this.$t('512521'));
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
        console.log(this.getCurrentMainScreen, '当前演示主屏幕的id');
        console.log(this.getCurrentPresentationScreen, '当前演示屏幕的id');
        console.log(accountId, '当前操作的用户id');

        if (this.getCurrentPresentationScreen == accountId) {
          this.$message.warning('正在演示中');
          return false;
        }
        // 设置主讲人
        this.$confirm(
          '演示后，您可使用小组中的白板、文档、桌面共享功能，是否要演示？',
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
        console.log('[member] accountId:', accountId);
        if (this.memberOptions.platformType === 'watch' && accountId === this.leader_id) {
          return;
        }

        if (this.memberOptions.platformType === 'watch' && accountId === this.getCurrentSpeakerId) {
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
            console.log(res, 'v3InviteMic');
            if (res.code == 200) {
              if (!['', null, void 0].includes(accountId) && accountId === this.userId) {
                // this.$message.success('邀请演示发送成功')
              } else {
                this.$message.success(this.$t('message.message_1033'));
              }
            }
          })
          .catch(err => {
            this.$message.warning(err.msg);
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
            //todo 事件上报
            console.warn('禁言---res', res);
          })
          .catch(err => {
            console.warn('禁言---res', err);
          });
        // “禁言”要关闭当前用户的在麦状态
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
        this.page++;
        this.getOnlineUserList();
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
        .lb-raisehands {
          cursor: pointer;
          color: #ccc;
          font-size: 12px;
          margin-right: 1px;
          & > input:checked + i em {
            border-color: #ff9446;
            left: 22px;
            transition: all 0.1s ease-in-out;
          }
          & > i {
            display: inline-block;
            width: 30px;
            height: 14px;
            background-color: #242527;
            border-radius: 100px;
            position: relative;
            margin-left: 5px;
            position: relative;
            top: 3px;
            & > em {
              box-sizing: border-box;
              position: absolute;
              top: 2px;
              left: 0px;
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
          background-image: url('img/account-file-close-default.png');
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
