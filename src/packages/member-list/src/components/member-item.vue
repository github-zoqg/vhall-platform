<template>
  <div class="vmp-member-item">
    <div class="vmp-member-item__avatar-wrapper">
      <img
        width="28"
        height="28"
        class="vmp-member-item__avatar-wrapper__avatar"
        :src="userInfo.avatar && userInfo.avatar !== '0' ? userInfo.avatar : defaultAvatar"
      />
      <img
        v-show="[1, '1', 3, '3'].includes(userInfo.device_type)"
        class="vmp-member-item__avatar-wrapper__phone"
        width="9"
        height="12"
        src="../images/phone.png"
        alt
      />
    </div>
    <span class="vmp-member-item__name">{{ userInfo.nickname }}</span>
    <span
      class="vmp-member-item__role"
      :class="userInfo.role_name | roleClassFilter"
      v-if="![2, '2'].includes(userInfo.role_name)"
    >
      {{ userInfo.role_name | roleFilter }}
    </span>
    <div class="vmp-member-item__control">
      <!-- 主讲人 -->
      <i
        v-if="
          (mode != 6 && currentSpeakerId === userInfo.account_id) ||
          (mode == 6 && userInfo.role_name == 1)
        "
        class="vmp-member-item__control__user-icon iconfont iconxing"
      ></i>
      <!-- 显示条件：被禁言 -->
      <i
        v-show="userInfo.is_banned == 1"
        class="vmp-member-item__control__user-icon iconfont iconjinyan"
        style="color: #cccccc"
      ></i>
      <!-- 显示条件：申请上麦 -->
      <i
        v-show="
          userInfo.isApply &&
          applyUsers.find(u => u.account_id == userInfo.account_id) &&
          !userInfo.is_speak
        "
        class="vmp-member-item__control__user-icon iconfont iconxiamai"
        style="color: #cccccc; font-size: 15px"
      ></i>
      <!-- 显示条件：上麦中 -->
      <i
        v-if="
          currentSpeakerId != userInfo.account_id &&
          userInfo.is_speak &&
          userInfo.device_status != 2
        "
        class="vmp-member-item__control__user-icon iconfont iconxiamai1"
        style="color: #fc5659; font-size: 15px"
      ></i>
      <!-- 设备有问题不能上麦 -->
      <i
        v-show="isInteract == '1' && userInfo.device_status == 2"
        style="color: #fc5659; font-size: 15px; vertical-align: middle"
        class="iconfont iconhebingxingzhuang vmp-member-item__control__device-abnormal"
      ></i>
      <!-- 显示条件：列表中该用户不是是主持人 -->
      <template
        v-if="
          roleName == '1' &&
          userInfo.role_name != 1 &&
          ((isEnjoy && userInfo.role_name == 3) || userInfo.role_name != 3) &&
          userInfo.role_name != 20 &&
          userInfo.device_status != 2
        "
      >
        <!--互动直播 没有被禁言 没有上麦 不是移动端 设备可以上麦-->
        <i
          v-show="
            isInteract == '1' &&
            !userInfo.is_banned &&
            !userInfo.is_speak &&
            userInfo.device_status == 1
          "
          class="vmp-member-item__control__up-mic"
          @click="upMic(userInfo.isApply, userInfo.account_id)"
        >
          上麦
        </i>
        <!-- 显示条件：当前登录者是主持人  正在上麦 -->
        <i
          v-show="isInteract == '1' && userInfo.is_speak"
          class="vmp-member-item__control__down-mic"
          @click="downMic(userInfo.account_id)"
        >
          下麦
        </i>
      </template>
      <!-- 显示条件：列表中该用户是是主持人 -->
      <template v-if="roleName == '1' && userInfo.role_name == 1 && userInfo.device_status == 1">
        <i
          v-show="isInteract == '1'"
          class="vmp-member-item__control__up-mic widthAuto"
          @click="myPresentation(userInfo.account_id)"
        >
          我要演示
        </i>
        <i
          v-show="isInteract == '1' && !userInfo.is_speak"
          class="vmp-member-item__control__up-mic"
          @click="upMic(userInfo.isApply, userInfo.account_id)"
        >
          上麦
        </i>
        <!-- 显示条件：当前登录者是主持人  正在上麦 -->
        <i
          v-show="isInteract == '1' && userInfo.is_speak && currentSpeakerId != userId"
          class="vmp-member-item__control__down-mic"
          @click="downMic(userInfo.account_id)"
        >
          下麦
        </i>
      </template>
      <!-- class上的hide是为了hover的时候也不显示 -->
      <!-- more显示条件：1、当前登录者是主持人-->
      <!-- more显示条件：2、当前登录者是嘉宾助理并且所选用户是观众 -->
      <el-dropdown @command="handleCommand" v-show="showUserControl">
        <i
          @click.stop="getMore(userInfo.account_id, userInfo.role_name)"
          class="vmp-member-item__control__more"
        ></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="setBanned">聊天禁言</el-dropdown-item>
          <el-dropdown-item command="setKicked">
            {{ userInfo.is_kicked ? '取消踢出' : '踢出活动' }}
          </el-dropdown-item>
          <el-dropdown-item command="groupSetKicked">
            {{ userInfo.is_kicked ? '取消踢出' : '踢出小组' }}
          </el-dropdown-item>
          <el-dropdown-item command="setSpeaker">设为主讲</el-dropdown-item>
          <el-dropdown-item command="inviteMic">邀请演示</el-dropdown-item>
          <el-dropdown-item command="setLeader">升为组长</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
  import defaultAvatar from '@/packages/share/src/images/my-dark@2x.png';
  export default {
    name: 'VmpMemberItem',
    filters: {
      //角色转换
      roleFilter(value) {
        let ret = '';
        switch (Number(value)) {
          case 1:
            ret = '主持人';
            break;
          case 3:
            ret = '助理';
            break;
          case 4:
            ret = '嘉宾';
            break;
          case 20:
            ret = '组长';
            break;
          default:
            ret = '未定义';
        }
        return ret;
      },
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
        type: [Number, String]
      },
      //当前登录用户的id
      userId: {
        type: [Number, String]
      },
      //是否是互动直播
      isInteract: {
        type: Number,
        default: () => false
      },
      isEnjoy: {
        required: false,
        default: false
      },
      //申请互动的人员
      applyUsers: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        //默认头像
        defaultAvatar
      };
    },
    computed: {
      //人员操作项是否显示
      showUserControl() {
        return (
          (this.roleName == '1' && this.userInfo.account_id != this.userId && !this.isInGroup) ||
          (this.roleName == '1' &&
            this.userInfo.account_id != this.userId &&
            this.isInGroup &&
            this.userInfo.role_name != 20)
        );
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
      //显示更多
      getMore(accountId, roleName) {
        console.log(accountId, roleName);
      },
      //处理指令
      handleCommand(command) {
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
          default:
            break;
        }
      },
      //上麦
      upMic() {},
      //下麦
      downMic() {},
      //我要演示
      myPresentation() {}
    }
  };
</script>

<style lang="less">
  .vmp-member-item {
    position: relative;
    box-sizing: content-box;
    height: 44px;
    font-size: 12px;
    padding: 2px 24px;
    color: #999999;
    line-height: 44px;
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
        bottom: 3px;
      }
    }
    &__name {
      display: inline-block;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
      margin: 0 2px 0 9px;
      font-size: 14px;
    }
    &__role {
      text-align: center;
      padding: 0 4px;
      border-radius: 100px;
      vertical-align: middle;
      font-size: 10px;
      &.host {
        background-color: rgba(252, 86, 89, 0.15);
        color: #fb3a32;
      }
      &.assistant {
        background-color: rgba(166, 166, 166, 0.15);
        color: #a6a6a6;
      }
      &.guest {
        background-color: rgba(77, 161, 255, 0.15);
        color: #4da1ff;
      }
      &.leadercol {
        background-color: rgba(77, 161, 255, 0.15);
        color: #3562fa;
      }
    }
    &__control {
      float: right;
      &__user-icon {
        color: #ff9446;
        font-size: 16px;
        vertical-align: middle;
        padding: 0 3px;
      }
      &__up-mic,
      &__down-mic {
        display: inline-block;
        width: 30px;
        height: 20px;
        background: rgba(221, 221, 221, 0.15);
        border-radius: 4px;
        color: #dddddd;
        text-align: center;
        vertical-align: middle;
        line-height: 20px;
        font-style: normal;
        letter-spacing: 1px;
        cursor: pointer;
      }
      &__more {
        display: inline-block;
        width: 27px;
        height: 20px;
        vertical-align: middle;
        margin-left: 3px;
        color: #cccccc;
        font-size: 12px;
        background: url('../images/more.png') no-repeat center;
        background-size: 13px 3px;
        border-radius: 4px;
        &:hover {
          cursor: pointer;
          background-color: #434343;
          color: #cccccc;
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
            background-color: #444444;
            color: #fff;
          }
        }
      }
    }
  }
</style>
