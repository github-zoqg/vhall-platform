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
      <!-- 显示条件：被禁言 -->
      <i
        v-show="userInfo.is_banned"
        class="vmp-member-item__control__user-icon iconfont iconjinyan"
        style="color: #cccccc"
      ></i>
      <!-- 显示条件：被踢出 -->
      <i
        v-show="userInfo.is_kicked"
        class="vmp-member-item__control__user-icon iconfont icontichu"
        style="color: #cccccc"
      ></i>
      <!-- more显示条件：1、当前登录者是主持人-->
      <!-- more显示条件：2、当前登录者是嘉宾助理并且所选用户是观众 -->
      <i
        v-if="[1, '1'].includes(roleName)"
        @click.stop="getMore(userInfo.account_id, userInfo.role_name)"
        class="vmp-member-item__control__more"
      ></i>
      <i
        v-else-if="(roleName == '3' || roleName == '4') && user.role_name == '2'"
        @click.stop="getMore(userInfo.account_id, userInfo.role_name)"
        class="vmp-member-item__control__more"
      ></i>
      <i v-else class="vmp-member-item__control__more-placeholder"></i>

      <div v-show="userInfo.showControl" class="vmp-member-item__control__detail">
        <!-- 显示条件：被禁言没被踢出 -->
        <div
          v-show="userInfo.is_banned && !userInfo.is_kicked"
          class="vmp-member-item__control__detail--set-speak"
          @click="handleSetBanned(userInfo.account_id, userInfo.is_banned)"
        >
          <i></i>
          <span>{{ userInfo.is_banned != 0 ? '取消' : '聊天' }}禁言</span>
        </div>
        <div
          class="vmp-member-item__control__detail--set-kick"
          v-if="!isInGroup"
          @click="handleSetKicked(user.account_id, user.is_kicked)"
        >
          <i></i>
          <span>{{ user.is_kicked ? '取消踢出' : '踢出活动' }}</span>
        </div>
        <div
          class="vmp-member-item__control__detail--set-kick"
          v-else
          @click="handleSetKicked(user.account_id, user.is_kicked)"
        >
          <i></i>
          <span>{{ user.is_kicked ? '取消踢出' : '踢出小组' }}</span>
        </div>
      </div>
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
      }
    },
    data() {
      return {
        //默认头像
        defaultAvatar
      };
    },
    methods: {
      //踢出成员
      handleSetKicked(accountId, roleName) {
        console.log(accountId, roleName);
      },
      //禁言成员
      handleSetBanned(accountId, roleName) {
        console.log(accountId, roleName);
      },
      //显示更多
      getMore(accountId, roleName) {
        console.log(accountId, roleName);
      }
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
      &__upmic,
      &__downmic {
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
