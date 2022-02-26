<template>
  <div class="header-right_control">
    <div
      class="header-right_control_icon"
      :style="userInfo.avatar ? { 'background-image': `url(${userInfo.avatar})` } : {}"
    >
      <div class="header-right_control_wrap">
        <div class="header-right_control_wrap-head">
          <div class="header-right_control_wrap-head-left">
            <span class="header-right_control_wrap-head-left-role">
              {{ roleMap[userInfo.role_name] }}
            </span>
            <span class="header-right_control_wrap-head-left-name">
              {{ userInfo.nickname }}
            </span>
          </div>
          <div
            class="header-right_control_wrap-head-right"
            v-if="isShowQuit"
            @click="roleQuit || userInfo.role_name != 1"
          >
            退出
          </div>
        </div>
        <div class="header-right_control_wrap-container">
          <div
            class="header-right_control_wrap-container-setting"
            :class="{ 'header-right_control_wrap-container-disabled': thirtPushStreamimg }"
            v-if="isShowMediaSetting && (userInfo.role_name == 1 || userInfo.role_name == 4)"
            @click="openMediaSettings"
          >
            <i class="vh-iconfont vh-line-setting"></i>
            <p>媒体设置</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            :class="{ 'header-right_control_wrap-container-disabled': !isLiving }"
            v-if="isShowSplitScreen && isSupportSplitScreen"
            @click="splitScreen"
          >
            <i class="vh-saas-iconfont vh-saas-a-line-Viewlayout"></i>
            <p>{{ splitStatus == 2 ? '分屏' : '关闭分屏' }}</p>
          </div>
          <!-- <div
            class="header-right_control_wrap-container-setting"
            v-if="userInfo.role_name != 1"
            @click="roleQuit"
          >
            <i class="iconfont iconjiaosetuichu"></i>
            <p>角色退出</p>
          </div> -->
          <div
            class="header-right_control_wrap-container-setting"
            v-if="
              isShowThirdParty &&
              webinarInfo.no_delay_webinar == 0 &&
              isThirtPushStream &&
              !thirtPushStreamimg
            "
            @click="thirdPartyShow"
          >
            <i class="vh-saas-iconfont vh-saas-a-line-thirdpartyinitiate"></i>
            <p>第三方发起</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            @click="thirdPartyClose"
            v-if="isShowThirdParty && isThirtPushStream && thirtPushStreamimg"
          >
            <i class="vh-saas-iconfont vh-saas-a-color-webpageinitiate1"></i>
            <p>网页发起</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            v-if="isShowVirtualAudience && webinarInfo.mode != 6"
            @click="openVirtualAudience"
            :class="{ 'header-right_control_wrap-container-disabled': !isLiving }"
          >
            <i class="vh-saas-iconfont vh-saas-a-line-dissolutiongrouping"></i>
            <p>虚拟人数</p>
          </div>
        </div>
        <div class="header-right_control_wrap-bottom" v-if="isShowSupport">
          微吼知客提供技术支持
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'HeaderControl',
    props: {
      isShowMediaSetting: {
        default: false,
        type: Boolean
      },
      isShowQuit: {
        default: false,
        type: Boolean
      },
      isShowSupport: {
        default: false,
        type: Boolean
      },
      isShowSplitScreen: {
        default: false,
        type: Boolean
      },
      isShowVirtualAudience: {
        default: false,
        type: Boolean
      },
      isShowThirdParty: {
        default: false,
        type: Boolean
      }
    },
    computed: {
      isSupportSplitScreen() {
        return (
          (this.userInfo.role_name == 1 || this.userInfo.role_name == 4) &&
          this.webinarInfo.mode != 6 &&
          this.webinarInfo.mode != 1
        );
      },
      isLiving() {
        //是否正在直播  虚拟人数是否可以使用，只有直播的时候可以使用
        return this.webinarInfo.type == 1;
      }
    },
    data() {
      return {
        roomBaseState: null,
        isThirtPushStream: false, // 是否支持第三方推流
        thirtPushStreamimg: false, // 是否正在第三方推流
        userInfo: {}, // 用户头图和名称、角色
        webinarInfo: {}, //活动下信息
        splitStatus: 2, //分屏状态
        roleMap: {
          1: '主持人',
          2: '观众',
          3: '助理',
          4: '嘉宾'
        }
      };
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.roomBaseState = this.roomBaseServer.state;
      this.userInfo = this.roomBaseState.watchInitData.join_info;
      this.webinarInfo = this.roomBaseState.watchInitData.webinar;
      if (this.webinarInfo.mode == 2) {
        this.isThirtPushStream = true;
      }
    },
    methods: {
      openMediaSettings() {
        // TODO 媒体设置弹窗
        this.$emit('openMediaSettings');
      },
      splitScreen() {
        //分屏
        if (this.splitStatus == 2) {
          this.$emit('startSplit');
        } else {
          this.$emit('endSplit');
        }
      },
      roleQuit() {
        // 角色退出
        // 调用退出接口 跳转页面
      },
      thirdPartyShow() {
        // 第三方发起
        if (this.isLiving) {
          this.$message.warning('请先结束直播');
          return;
        }
        this.$emit('thirdPushStream', true);
        this.thirtPushStreamimg = true;
        this.roomBaseServer.setInavToolStatus('start_type', 4);
      },
      thirdPartyClose() {
        // 网页发起 第三方发起关闭
        if (this.isLiving) {
          this.$message.warning('请先结束直播');
          return;
        }
        this.$emit('thirdPushStream', false);
        this.thirtPushStreamimg = false;
        this.roomBaseServer.setInavToolStatus('start_type', 1);
      },
      openVirtualAudience() {
        // 虚拟人数弹窗
        this.$emit('openVirtualProple');
      }
    }
  };
</script>
<style lang="less">
  .header-right_control {
    height: 100%;
    &:hover {
      .header-right_control_wrap {
        display: block;
      }
    }
    &_icon {
      border-radius: 50%;
      width: 28px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      color: @font-error-low;
      font-size: 20px;
      cursor: pointer;
      border-radius: 50%;
      background: url('../img/my-dark@2x.png') no-repeat;
      background-size: 100% 100%;
      // background-color: hsla(0, 0%, 88.6%, 0.15);
    }
    &_wrap {
      display: none;
      position: absolute;
      top: 35px;
      right: 10px;
      z-index: 10;
      width: 260px;
      border-radius: 4px;
      overflow: hidden;
      font-size: 14px;
      cursor: auto;
      background: transparent;
      padding-top: 15px;
      &-head {
        height: 50px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: @bg-error-light;
        border: 4px 4px 0 0;
        &-left {
          &-role {
            padding: 3px 8px;
            font-size: 12px;
            border: 1px solid @border-host-color;
            border-radius: 50px;
            text-align: center;
            color: @font-error-low;
          }
          &-name {
            width: 110px;
            color: @font-error-low;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
            margin-left: 7px;
            vertical-align: bottom;
          }
        }
        &-right {
          color: @font-error-low;
          cursor: pointer;
          font-size: 14px;
        }
      }
      &-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 18px 20px;
        background-color: @bg-light-normal;
        &-setting {
          font-size: 12px;
          color: @font-hover-low;
          cursor: pointer;
          box-sizing: border-box;
          text-align: center;
          i {
            display: inline-block;
            width: 34px;
            height: 34px;
            font-size: 19px;
            color: #888;
            border: 1px solid #888;
            line-height: 34px;
            border-radius: 50%;
          }
          .iconfenpingmoshi {
            font-size: 16px;
          }
          p {
            line-height: 36px;
          }
          &:hover {
            i {
              border: 1px solid @border-light-color;
              color: @font-error-low;
              background-color: @bg-error-light;
            }
            p {
              color: @font-error;
            }
          }
        }
        &-disabled {
          cursor: default;
          color: @font-disabled-normal;
          pointer-events: none;
          i {
            border: 1px solid @border-normal-color;
            color: @border-normal-color;
            background-color: bg-light-normal;
          }
        }
      }
      &-bottom {
        text-align: center;
        height: 32px;
        line-height: 32px;
        background-color: @bg-lighter-normal;
        font-size: 12px;
        border-bottom-right-radius: 4px;
        border-bottom-left-radius: 4px;
        &:hover {
          color: #5d6efe;
        }
      }
    }
  }
</style>
