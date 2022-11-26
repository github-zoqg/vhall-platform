<template>
  <div class="vmp-member-item">
    <div class="vmp-member-item__avatar-wrapper">
      <img
        width="24"
        height="24"
        class="vmp-member-item__avatar-wrapper__avatar"
        :src="userInfo.avatar ? userInfo.avatar : defaultAvatar"
      />
      <img
        v-show="[1, '1', 3, '3'].includes(userInfo.device_type)"
        class="vmp-member-item__avatar-wrapper__phone"
        width="9"
        height="12"
        :src="phoneImg"
        alt
      />
    </div>
    <el-tooltip
      :content="userInfo.nickname"
      popper-class="vmp-member-item-popper-width"
      :visible-arrow="false"
    >
      <span
        class="vmp-member-item__name"
        :class="{
          'vmp-member-item__name-limit':
            isShowMyPresentation &&
            tabIndex === 1 &&
            currentSpeakerId != userInfo.account_id &&
            userInfo.is_speak &&
            ![2, '2'].includes(userInfo.device_status),
          'vmp-member-item__name_ingroup': isHost && isInGroup
        }"
      >
        {{ userInfo.nickname }}
      </span>
    </el-tooltip>
    <span
      class="vmp-member-item__role"
      :class="userInfo.role_name | roleClassFilter"
      v-if="![2, '2'].includes(userInfo.role_name)"
    >
      {{ userInfo.role_name | roleFilter }}
    </span>
    <div class="vmp-member-item__control">
      <template v-if="memberOptions.platformType === 'live'">
        <!-- 主讲人标识 -->
        <template v-if="isShowSpeakerFlag">
          <i class="vmp-member-item__control__user-icon vh-iconfont vh-line-star-off"></i>
        </template>

        <!--被禁言标识 -->
        <template v-if="[1, 3].includes(tabIndex) && userInfo.is_banned === 1">
          <i
            class="vmp-member-item__control__user-icon vh-iconfont vh-line-silenced"
            style="color: #cccccc"
          ></i>
        </template>
        <!--被踢出标识 -->
        <template v-if="tabIndex === 3 && userInfo.is_kicked">
          <i
            class="vmp-member-item__control__user-icon vh-saas-iconfont vh-saas-a-line-KickedoutMembers"
            style="color: #cccccc"
          ></i>
        </template>
        <!-- 显示条件：申请上麦 -->
        <template
          v-if="
            [1, 2].includes(tabIndex) &&
            [1, '1'].includes(userInfo.is_apply) &&
            applyUserList.findIndex(u => u.account_id == this.userInfo.account_id) !== -1 &&
            !userInfo.is_speak
          "
        >
          <i
            class="vmp-member-item__control__user-icon vh-iconfont vh-a-line-handsup"
            style="color: #cccccc; font-size: 15px"
          ></i>
        </template>
        <!-- 显示条件：上麦中 -->
        <template
          v-if="
            tabIndex === 1 &&
            currentSpeakerId != userInfo.account_id &&
            userInfo.is_speak &&
            ![2, '2'].includes(userInfo.device_status)
          "
        >
          <i
            class="vmp-member-item__control__user-icon vh-iconfont vh-a-line-handsup"
            style="font-size: 15px"
          ></i>
        </template>
        <!--同意上麦-->
        <i
          v-if="tabIndex === 2 && ([1, '1'].includes(roleName) || guestHasInvitePer)"
          class="vmp-member-item__control__up-mic"
          @click="handleConsent(userInfo.account_id)"
        >
          上麦
        </i>

        <!-- 设备有问题不能上麦  仅限视频轮巡活动展示-->
        <template
          v-if="
            tabIndex === 1 &&
            this.isVideoPolling &&
            this.mode != 6 &&
            [2, '2'].includes(userInfo.device_status)
          "
        >
          <i class="vh-iconfont vh-full-warning vmp-member-item__control__device-abnormal"></i>
        </template>
        <template v-if="tabIndex === 1">
          <!--我要演示-->
          <!-- <i
            v-if="isShowMyPresentation"
            class="vmp-member-item__control__up-mic widthAuto"
            @click="myPresentation(userInfo.account_id)"
          >
            我要演示
          </i> -->
          <!--上麦-->
          <i
            v-if="isShowUpMic"
            class="vmp-member-item__control__up-mic"
            @click="upMic(userInfo.is_apply, userInfo.account_id)"
          >
            上麦
          </i>
          <!--下麦-->
          <i
            v-if="isShowDownMic"
            class="vmp-member-item__control__down-mic"
            @click="downMic(userInfo.account_id)"
          >
            {{ $t('interact.interact_1007') }}
          </i>
        </template>
      </template>
      <template v-if="memberOptions.platformType === 'watch'">
        <!-- 主讲人 -->
        <i
          v-if="tabIndex === 1 && userInfo.is_kicked !== 1 && [1, '1'].includes(userInfo.role_name)"
          class="vmp-member-item__control__user-icon vh-iconfont vh-line-star-off"
        ></i>
        <!--被禁言-->
        <i
          v-if="[1, 3].includes(tabIndex) && [1, '1'].includes(userInfo.is_banned)"
          class="vmp-member-item__control__user-icon vh-iconfont vh-line-silenced"
          style="color: #cccccc"
        ></i>
        <!--申请上麦-->
        <i
          v-if="
            [1, 2].includes(tabIndex) &&
            [1, '1'].includes(userInfo.is_apply) &&
            applyUserList.findIndex(u => u.account_id == this.userInfo.account_id) !== -1 &&
            !userInfo.is_speak
          "
          class="vmp-member-item__control__user-icon vh-iconfont vh-a-line-handsup"
          style="color: #cccccc; font-size: 15px"
        ></i>
        <!--上麦中-->
        <i
          v-if="
            tabIndex === 1 &&
            leaderId !== userInfo.account_id &&
            userInfo.is_speak &&
            ![2, '2'].includes(userInfo.device_status)
          "
          class="vmp-member-item__control__user-icon vh-saas-iconfont vh-saas-a-line-Onthemicrophone1"
          style="font-size: 15px"
        ></i>
        <!--设备有问题  仅限视频轮巡活动展示-->
        <i
          v-if="
            tabIndex === 1 &&
            this.isVideoPolling &&
            this.mode != 6 &&
            [2, '2'].includes(userInfo.device_status)
          "
          style="font-size: 15px; vertical-align: middle"
          class="vh-iconfont vh-full-warning vmp-member-item__control__user-icon"
        ></i>
        <!--被踢出-->
        <i
          v-if="tabIndex === 3 && userInfo.is_kicked"
          class="vmp-member-item__control__user-icon vh-saas-iconfont vh-saas-a-line-KickedoutMembers"
          style="color: #cccccc"
        ></i>
        <!-- 显示条件：列表中该用户是是组长 -->
        <template
          v-if="
            tabIndex === 1 &&
            ['1', '3', '20', 1, 3, 20].includes(roleName) &&
            [2, '2'].includes(userInfo.role_name) &&
            [0, '0'].includes(userInfo.is_banned) &&
            ![2, '2'].includes(userInfo.device_status)
          "
        >
          <i
            v-if="
              [1, '1'].includes(isInteract) &&
              !userInfo.is_speak &&
              leaderId !== userInfo.account_id
            "
            class="vmp-member-item__control__up-mic"
            @click="upMic(userInfo.is_apply, userInfo.account_id)"
          >
            上麦
          </i>
          <!-- 显示条件：当前登录者是主持人  正在上麦 -->
          <i
            v-if="
              [1, '1'].includes(isInteract) && userInfo.is_speak && leaderId != userInfo.account_id
            "
            class="vmp-member-item__control__down-mic"
            @click="downMic(userInfo.account_id)"
          >
            {{ $t('interact.interact_1007') }}
          </i>
        </template>
        <!--同意上麦 当前登录者是组长-->
        <i
          v-if="
            tabIndex === 2 &&
            [1, '1'].includes(isInteract) &&
            !userInfo.is_speak &&
            leaderId !== userInfo.account_id
          "
          class="vmp-member-item__control__up-mic"
          @click="handleConsent(userInfo.account_id)"
        >
          上麦
        </i>
      </template>

      <!-- more显示条件：1、当前登录者是主持人-->
      <!-- more显示条件：2、当前登录者是嘉宾助理并且所选用户是观众 -->
      <template v-if="memberOptions.platformType === 'live'">
        <el-dropdown @command="handleCommand" v-show="showUserControl" trigger="click">
          <i class="vmp-member-item__control__more"></i>
          <el-dropdown-menu slot="dropdown" class="vmp-member-dropdown-menu">
            <template v-for="item in operateList">
              <el-dropdown-item
                :command="item.command"
                v-if="getPropertyByKey(item, 'isShow')"
                :disabled="getPropertyByKey(item, 'disable')"
                :key="item.command"
              >
                {{ item.type && item.type === 'toggleButton' ? computedShowText(item) : item.text }}
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <template v-if="memberOptions.platformType === 'watch'">
        <el-dropdown
          @command="handleWatchCommand"
          v-show="
            [20, '20', 1, '1', 3, '3'].includes(roleName) && [2, '2'].includes(userInfo.role_name)
          "
          trigger="click"
        >
          <i class="vmp-member-item__control__more"></i>
          <el-dropdown-menu slot="dropdown" class="vmp-member-dropdown-menu">
            <template v-for="item in watchOperateList">
              <el-dropdown-item
                :command="item.command"
                v-if="getPropertyByKey(item, 'isShow')"
                :disabled="getPropertyByKey(item, 'disable')"
                :key="item.command"
              >
                {{ item.type && item.type === 'toggleButton' ? computedShowText(item) : item.text }}
              </el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </div>
  </div>
</template>

<script>
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import phoneImg from '@/app-shared/assets/img/phone.png';
  export default {
    name: 'VmpMemberItem',
    filters: {
      //角色标签样式
      roleClassFilter(value) {
        //主持人
        if ([1, '1'].includes(value)) {
          return 'host';
        }
        //助理
        if ([3, '3'].includes(value)) {
          return 'assistant';
        }
        //游客
        return 'guest';
      }
    },
    props: {
      //当前的tabIndex
      tabIndex: {
        type: Number,
        required: true,
        default: 1
      },
      //成员组件配置
      memberOptions: {
        type: Object,
        default: () => {
          return {};
        }
      },
      //成员信息
      userInfo: {
        type: Object,
        required: true,
        default: () => {
          return {};
        }
      },
      //登录的用户角色
      roleName: {
        type: [Number, String],
        required: true
      },
      //是否是分组讨论
      isInGroup: {
        type: Boolean,
        required: true,
        default: () => false
      },
      //mode
      mode: {
        type: [Number, String],
        default: () => 3
      },
      //当前主讲人id
      currentSpeakerId: {
        type: [Number, String],
        default: () => ''
      },
      //当前演示主屏幕（主讲人）
      mainScreen: {
        type: [Number, String],
        default: () => ''
      },
      //当前演示屏幕
      presentationScreen: {
        type: [Number, String],
        default: () => ''
      },
      //当前的组长的id
      leaderId: {
        type: [Number, String],
        default: () => ''
      },
      //当前登录用户的id
      userId: {
        type: [Number, String],
        default: () => ''
      },
      //是否是互动直播(1是 0否)
      isInteract: {
        type: Number,
        default: 0
      },
      //申请互动的人员
      applyUsers: {
        type: Array,
        default: () => []
      },
      //直播状态，0未开始，1已开始，2已结束
      status: {
        type: [Array, String, Number],
        default: () => {
          return 0;
        }
      },
      // 嘉宾为当前主讲人时是否有邀请上麦的权限
      guestHasInvitePer: {
        type: Boolean,
        default: false
      }
    },
    mounted() {},
    data() {
      return {
        //默认头像
        defaultAvatar: defaultAvatar,
        //手机图片标识
        phoneImg: phoneImg,
        //操作项
        operateList: [
          //设为主讲
          {
            command: 'setSpeaker',
            //在对应的计算属性中判断
            isShow: 'isShowSetSpeaker',
            disable: false,
            text: '设为主讲',
            sequence: 1
          },
          //邀请演示（全部人员里展示）
          {
            command: 'inviteMic',
            isShow: 'isShowInvitation',
            disable: 'isLiveInviteDisable',
            text: '邀请演示',
            sequence: 2
          },
          //设置禁言/取消禁言
          {
            command: 'setBanned',
            isShow: 'isShowLiveMuted',
            disable: false,
            //注意，这里只是为了进行初始赋值，实际动态切换文案是在计算属性中
            text: ![0, '0'].includes(this.userInfo.is_banned) ? '取消禁言' : '聊天禁言',
            type: 'toggleButton',
            sequence: 3
          },
          //踢出 / 取消踢出
          {
            command: 'setKicked',
            isShow: 'isShowLiveKicked',
            disable: false,
            text: this.userInfo.is_kicked ? '取消踢出' : '踢出活动',
            type: 'toggleButton',
            sequence: 4
          },
          {
            command: 'setKicked',
            isShow: 'isShowLiveGroupKicked',
            disable: false,
            text: this.userInfo.is_kicked ? '取消踢出' : '踢出小组',
            type: 'toggleButton',
            sequence: 5
          },
          //升为组长 （全部人员下展示）
          {
            command: 'setLeader',
            isShow: 'isShowSetLeader',
            disable: false,
            text: '升为组长',
            sequence: 6
          },
          //我要演示 （主持人）
          {
            command: 'setMyPresentation',
            isShow: 'isShowMyPresentation',
            disable: false,
            text: '我要演示',
            sequence: 7
          }
        ],
        //观看端操作项
        watchOperateList: [
          //邀请演示（全部人员里展示）
          {
            command: 'inviteMic',
            isShow: 'isShowWatchInvitation',
            disable: 'isWatchInviteDisable',
            text: '邀请演示',
            sequence: 1
          },
          //设置禁言/取消禁言
          {
            command: 'setBanned',
            isShow: 'isShowWatchMuted',
            disable: false,
            text: ![0, '0'].includes(this.userInfo.is_banned) ? '取消禁言' : '聊天禁言',
            type: 'toggleButton',
            sequence: 2
          },
          //踢出 / 取消踢出
          {
            command: 'setKicked',
            isShow: 'isShowWatchKicked',
            disable: false,
            text: this.userInfo.is_kicked ? '取消踢出' : '踢出小组',
            type: 'toggleButton',
            sequence: 3
          },
          //升为组长
          {
            command: 'setLeader',
            isShow: 'isShowWatchSetLeader',
            disable: false,
            text: '升为组长',
            sequence: 4
          }
        ],
        //真实的申请上麦的数组
        applyUserList: []
      };
    },
    watch: {
      //监听数组的变化，保证举手标识能出现
      applyUsers: {
        handler(val) {
          this.applyUserList = val;
          this.$forceUpdate();
        },
        immediate: true,
        deep: true
      }
    },
    computed: {
      //人员操作项是否显示(PC发起)
      showUserControl() {
        return (
          (this.roleName == '1' && this.userInfo.account_id != this.userId && !this.isInGroup) ||
          (this.roleName == '1' &&
            this.userInfo.account_id != this.userId &&
            this.isInGroup &&
            this.userInfo.role_name != 20) ||
          ([3, '3', 4, '4'].includes(this.roleName) &&
            [2, '2'].includes(this.userInfo.role_name)) ||
          (!this.isInGroup &&
            this.roleName == '1' &&
            this.userInfo.account_id == this.userId &&
            this.userInfo.is_speak &&
            this.mainScreen != this.userInfo.account_id) ||
          (this.roleName == '1' && this.isInGroup)
        );
      },
      //发起端演示的是否是选中的用户
      isLiveInviteDisable() {
        return this.userInfo.account_id == this.presentationScreen;
      },
      //观看端演示的是否是选中的用户
      isWatchInviteDisable() {
        return this.userInfo.account_id == this.presentationScreen;
      },
      //是否显示禁言、取消禁言
      isShowLiveMuted() {
        if (this.tabIndex !== 3) {
          return ![1, '1'].includes(this.userInfo.role_name);
        } else {
          return ![1, '1'].includes(this.userInfo.role_name) && !this.userInfo.is_kicked;
        }
      },
      //是否显示踢出、取消踢出(非分组)
      isShowLiveKicked() {
        return !this.isInGroup && ![1, '1'].includes(this.userInfo.role_name);
      },
      //是否显示踢出分组、取消踢出
      isShowLiveGroupKicked() {
        return this.isInGroup && ![1, '1'].includes(this.userInfo.role_name);
      },
      //是否显示禁言、取消禁言（PC观看）
      isShowWatchMuted() {
        if (this.tabIndex !== 3) {
          return [2, '2'].includes(this.userInfo.role_name);
        } else {
          return [2, '2'].includes(this.userInfo.role_name) && !this.userInfo.is_kicked;
        }
      },
      //是否显示踢出、取消踢出小组（PC观看）
      isShowWatchKicked() {
        return [2, '2'].includes(this.userInfo.role_name);
      },
      //是否展示设为主讲按钮(PC发起)
      isShowSetSpeaker() {
        if (this.tabIndex !== 1) {
          return false;
        }
        return (
          !this.isInGroup &&
          !!this.isInteract &&
          [1, 4, '1', '4'].includes(this.userInfo.role_name) &&
          this.userInfo.is_speak &&
          this.mainScreen != this.userInfo.account_id
        );
      },
      //PC观看端设为组长
      isShowWatchSetLeader() {
        return (
          this.tabIndex === 1 &&
          [2, '2'].includes(this.userInfo.role_name) &&
          [2, '2'].includes(this.userInfo.device_type) &&
          [0, '0'].includes(this.userInfo.is_banned) &&
          ![2, '2'].includes(this.userInfo.device_status)
        );
      },
      //是否显示邀请演示操作选项(PC发起)
      isShowInvitation() {
        let isShow = false;
        if (this.tabIndex !== 1) {
          return false;
        }
        //如果不是分组讨论
        if (!this.isInGroup) {
          let validateRoleName = [this.userInfo.role_name, this.roleName].every(item => {
            return ![3, '3'].includes(item);
          });
          isShow =
            [6, '6'].includes(this.mode) &&
            [2, '2'].includes(this.userInfo.device_type) &&
            ![2, '2'].includes(this.userInfo.device_status) &&
            validateRoleName &&
            [0, '0'].includes(this.userInfo.is_banned);
        }

        //如果是分组讨论
        if (this.isInGroup) {
          isShow =
            [1, '1'].includes(this.roleName) &&
            [2, '2'].includes(this.userInfo.role_name) &&
            [2, '2'].includes(this.userInfo.device_type) &&
            ![2, '2'].includes(this.userInfo.device_status) &&
            [0, '0'].includes(this.userInfo.is_banned);
        }
        return isShow;
      },
      //是否显示邀请演示操作选项(PC观看)
      isShowWatchInvitation() {
        if (this.tabIndex === 1) {
          return (
            this.isInteract &&
            [2, '2'].includes(this.userInfo.device_type) &&
            [0, '0'].includes(this.userInfo.is_banned) &&
            ![2, '2'].includes(this.userInfo.device_status)
          );
        }
        return false;
      },
      //是否显示升为组长选项(PC发起)
      isShowSetLeader() {
        if (!this.isInGroup || this.tabIndex !== 1) {
          return false;
        }
        return (
          [2, '2'].includes(this.userInfo.role_name) &&
          [2, '2'].includes(this.userInfo.device_type) &&
          [0, '0'].includes(this.userInfo.is_banned) &&
          ![2, '2'].includes(this.userInfo.device_status)
        );
      },
      /** 状态标识显示条件 */
      //是否显示主讲人标识
      isShowSpeakerFlag() {
        if (this.tabIndex === 1) {
          const options = [
            this.mode !== 6 &&
              this.$domainStore.state.roomBaseServer.interactToolStatus.doc_permission ===
                this.userInfo.account_id,
            this.mode === 6 && [1, '1'].includes(this.userInfo.role_name)
          ];
          return options.some(value => !!value);
        }
        return false;
      },
      //列表中该用户是否不是主持人身份
      isNotHost() {
        const options = [
          [1, '1'].includes(this.roleName),
          ![1, '1'].includes(this.userInfo.role_name),
          ![3, '3'].includes(this.userInfo.role_name),
          ![20, '20'].includes(this.userInfo.role_name),
          ![2, '2'].includes(this.userInfo.device_status)
        ];
        return options.every(item => !!item);
      },
      //是否是主持人
      isHost() {
        return (
          [1, '1'].includes(this.roleName) &&
          [1, '1'].includes(this.userInfo.role_name) &&
          [1, '1'].includes(this.userInfo.device_status)
        );
      },
      //是否显示上麦标识
      isShowUpMic() {
        let isShow = false;
        if (this.isHost) {
          isShow =
            [1, '1'].includes(this.isInteract) &&
            [0, '0'].includes(this.userInfo.is_speak) &&
            [1, '1'].includes(this.status);
          return isShow;
        }
        //如果不是主持人
        if (
          this.isNotHost ||
          (this.guestHasInvitePer && this.userInfo.role_name != 1 && this.userInfo.role_name != 3)
        ) {
          isShow =
            [1, '1'].includes(this.isInteract) &&
            !this.userInfo.is_banned &&
            [0, '0'].includes(this.userInfo.is_speak) &&
            [1, '1'].includes(this.userInfo.device_status);
        }

        return isShow;
      },
      //是否显示下麦标识
      isShowDownMic() {
        let isShow = false;
        if (this.isHost) {
          return (
            [1, '1'].includes(this.isInteract) &&
            this.userInfo.is_speak &&
            this.currentSpeakerId !== this.userId
          );
        }
        if (this.isNotHost || (this.guestHasInvitePer && this.userInfo.role_name != 1)) {
          isShow = [1, '1'].includes(this.isInteract) && this.userInfo.is_speak;
        }
        return isShow;
      },
      //是否显示我要演示
      isShowMyPresentation() {
        return this.isHost && [1, '1'].includes(this.isInteract) && this.isInGroup;
      },
      /** 状态标识显示条件 */
      //获取属性值
      getPropertyByKey() {
        return function (item = {}, keyName = '') {
          return typeof item[keyName] === 'boolean' ? item[keyName] : this[item[keyName]];
        };
      },
      //计算应该显示的文字
      computedShowText() {
        const _this = this;
        return function (item = {}) {
          let text = '';
          const { command = '' } = item;
          switch (command) {
            case 'setBanned':
              text = ![0, '0'].includes(_this.userInfo.is_banned) ? '取消禁言' : '聊天禁言';
              break;
            case 'setKicked':
              if (_this.isInGroup) {
                text = _this.userInfo.is_kicked ? '取消踢出' : '踢出小组';
              } else {
                text = _this.userInfo.is_kicked ? '取消踢出' : '踢出活动';
              }
              break;
            default:
              break;
          }
          return text;
        };
      },
      //是否在申请举手列表里
      isInApplyUsers() {
        return this.applyUserList.findIndex(u => u.account_id == this.userInfo.account_id) !== -1;
      },
      //是否显示举手的标识(PC发起)
      isShowHandFlag() {
        return (
          [1, 2].includes(this.tabIndex) &&
          [1, '1'].includes(this.userInfo.is_apply) &&
          this.isInApplyUsers &&
          !this.userInfo.is_speak
        );
      },
      // 是否开启视频轮巡
      isVideoPolling() {
        return this.$domainStore.state.roomBaseServer.configList['video_polling'];
      }
    },
    methods: {
      //踢出成员
      handleSetKicked() {
        this.$emit('operateUser', { type: 'setKicked', params: this.userInfo });
      },
      //禁言成员
      handleSetBanned() {
        this.$emit('operateUser', { type: 'setBanned', params: this.userInfo });
      },
      // 邀请演示，主直播间和小组内都会调用
      handleInviteMic() {
        this.$emit('operateUser', { type: 'inviteMic', params: this.userInfo });
      },
      //处理指令
      handleCommand(command) {
        switch (command) {
          case 'setSpeaker':
            this.$emit('operateUser', { type: 'setSpeaker', params: this.userInfo });
            break;
          case 'setBanned':
            this.handleSetBanned();
            break;
          case 'setKicked':
            this.handleSetKicked();
            break;
          case 'setGroupKicked':
            this.handleSetKicked();
            break;
          // 主直播间主持人邀请成员演示
          case 'inviteMic':
            this.handleInviteMic();
            break;
          // 升为组长
          case 'setLeader':
            this.$emit('operateUser', { type: 'setLeader', params: this.userInfo });
            break;
          // 我要演示
          case 'setMyPresentation':
            this.myPresentation();
            break;
          default:
            break;
        }
      },
      //处理观看端指令
      handleWatchCommand(command) {
        switch (command) {
          case 'setBanned':
            this.handleSetBanned();
            break;
          case 'setKicked':
            this.handleSetKicked();
            break;
          case 'setGroupKicked':
            this.handleSetKicked();
            break;
          // 组长邀请成员演示
          case 'inviteMic':
            this.handleInviteMic();
            break;
          // 升为组长
          case 'setLeader':
            this.$emit('operateUser', { type: 'setLeader', params: this.userInfo });
            break;
          default:
            break;
        }
      },
      //上麦
      upMic() {
        this.$emit('interactiveOperate', { type: 'upMic', params: this.userInfo });
      },
      //下麦
      downMic() {
        this.$emit('interactiveOperate', { type: 'downMic', params: this.userInfo });
      },
      //我要演示
      myPresentation() {
        this.$emit('interactiveOperate', { type: 'myPresentation', params: this.userInfo });
      },
      //同意上麦
      handleConsent() {
        this.$emit('interactiveOperate', { type: 'agreeUpMic', params: this.userInfo });
      }
    }
  };
</script>

<style lang="less">
  .vmp-member-item-popper-width {
    max-width: 300px;
    background: rgba(0, 0, 0, 0.95) !important;
    margin-top: 5px !important;
  }
  .vmp-member-item {
    position: relative;
    color: #999;
    line-height: 48px;
    padding: 0 10px 0 14px;
    font-size: 12px;
    overflow-x: hidden;
    &:hover {
      background-color: var(--group-item-hover-color);
      .vmp-member-item__control {
        &__more {
          opacity: 1;
        }
      }
    }
    &__avatar-wrapper {
      display: inline-block;
      position: relative;
      &__avatar {
        display: inline-block;
        border-radius: 50%;
        vertical-align: middle;
      }
      &__phone {
        position: absolute;
        right: -1px;
        bottom: 10px;
      }
    }
    &__name {
      display: inline-block;
      max-width: 102px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
      margin-left: 9px;
      color: var(--group-name-font-color);
      font-size: 14px;
      height: 14px;
      line-height: 1;
    }
    &__name-limit,
    &__name_ingroup {
      max-width: 76px;
    }
    &__role {
      display: inline-block;
      text-align: center;
      line-height: 15px;
      vertical-align: middle;
      padding: 0 4px;
      font-size: 10px;
      border-radius: 8px;
      &.host {
        background-color: rgba(252, 86, 89, 0.15);
        color: #fb3a32;
      }
      &.assistant {
        background-color: rgba(166, 166, 166, 0.15);
        color: #a6a6a6;
      }
      &.guest {
        background: rgba(10, 127, 245, 0.2);
        color: #0a7ff5;
      }
      &.leadercol {
        background-color: rgba(77, 161, 255, 0.15);
        color: #3562fa;
      }
    }
    &__control {
      float: right;
      &__user-icon {
        color: var(--theme-color);
        font-size: 13px;
        vertical-align: middle;
        margin-right: 6px;
      }
      &__device-abnormal {
        color: var(--theme-color);
        font-size: 15px;
        margin-right: 6px;
        vertical-align: middle;
      }
      &__up-mic,
      &__down-mic {
        display: inline-block;
        width: 30px;
        height: 16px;
        background: rgba(221, 221, 221, 0.15);
        border-radius: 4px;
        margin-right: 6px;
        color: var(--group-turnOff-font-color);
        text-align: center;
        vertical-align: middle;
        line-height: 16px;
        font-style: normal;
        letter-spacing: 1px;
        cursor: pointer;
      }
      .widthAuto {
        width: auto;
        padding: 0 2px;
        margin-right: 4px;
      }
      &__more {
        display: inline-block;
        width: 13px;
        height: 13px;
        vertical-align: middle;
        margin-left: 3px;
        padding: 2px 4px;
        color: var(--group-more-font-color);
        font-size: 12px;
        opacity: 0;
        background: url('../img/more.png') no-repeat center;
        background-size: 13px 3px;
        border-radius: 4px;
        &:hover {
          cursor: pointer;
          background-color: var(--group-more-hover-color);
          color: #ccc;
        }
      }
      &__more-place-holder {
        display: inline-block;
        width: 13px;
        height: 13px;
        vertical-align: middle;
        margin-left: 3px;
        opacity: 0;
      }
      &__detail {
        position: absolute;
        top: 40px;
        right: 8px;
        z-index: 2;
        width: 96px;
        background-color: #383838;
        border-radius: 4px;
        box-shadow: 0 1px 9px 0 rgba(0, 0, 0, 0.2);
        overflow: hidden;
        box-sizing: border-box;
        cursor: pointer;
        &--set-speak,
        &--set-kick {
          height: 28px;
          color: #e6e6e6;
          text-align: center;
          line-height: 28px;
          padding: 0;
          margin: 3px 0;
          &:hover {
            background-color: #444;
            color: #fff;
          }
        }
      }
    }
  }
  .vmp-member-dropdown-menu.el-dropdown-menu {
    position: absolute;
    top: 5px;
    right: 8px;
    z-index: 2;
    width: 96px;
    background: #383838 !important;
    border-radius: 4px;
    -webkit-box-shadow: 0 1px 9px 0 rgb(0 0 0 / 20%);
    box-shadow: 0 1px 9px 0 rgb(0 0 0 / 20%);
    overflow: hidden;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: pointer;

    .popper__arrow {
      display: none;
    }
    .el-dropdown-menu__item {
      height: 28px;
      color: #ccc;
      text-align: center;
      line-height: 28px;
      padding: 0;
      margin: 3px 0;
      &:hover {
        background-color: #444;
        color: #e6e6e6;
      }
    }
    .is-disabled {
      background: #999;
      color: #fff;
      &:hover {
        background: #999;
        cursor: default;
      }
    }
    .popper__arrow {
      &:after {
        border-bottom-color: #fff !important;
      }
    }
  }
</style>
