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
              {{ userInfo.role_name | roleFilter }}
            </span>
            <span class="header-right_control_wrap-head-left-name">
              {{ userInfo.nickname }}
            </span>
          </div>
        </div>
        <div class="header-right_control_wrap-container">
          <div
            class="header-right_control_wrap-container-setting"
            :class="{ 'header-right_control_wrap-container-disabled': thirtPushStreamimg }"
            v-if="userInfo.role_name == 1 || userInfo.role_name == 4"
            @click="openMediaSettings"
          >
            <i class="vh-iconfont vh-line-setting"></i>
            <p>媒体设置</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            :class="{
              'header-right_control_wrap-container-disabled':
                !isLiving || isInsertFilePushing || isCurrentShareScreen
            }"
            v-if="configList['is_interact'] && isSupportSplitScreen"
            @click="handleSplitScreenChange"
          >
            <i class="vh-saas-iconfont vh-saas-a-line-Viewlayout"></i>
            <p>{{ isOpenSplitScreen ? '关闭分屏' : '分屏' }}</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            v-if="userInfo.role_name != 1"
            @click="roleQuit"
          >
            <i class="vh-iconfont vh-line-exit"></i>
            <p>角色退出</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            v-if="isShowThirdPushStream"
            @click="thirdPartyShow"
          >
            <i class="vh-saas-iconfont vh-saas-a-line-thirdpartyinitiate"></i>
            <p>第三方发起</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            @click="thirdPartyClose"
            v-if="webinarInfo.mode == 2 && thirtPushStreamimg"
          >
            <i class="vh-saas-iconfont vh-saas-a-color-webpageinitiate1"></i>
            <p>网页发起</p>
          </div>
          <div
            class="header-right_control_wrap-container-setting"
            v-if="configList['virtual_user'] && webinarInfo.mode != 6"
            @click="openVirtualAudience"
            :class="{ 'header-right_control_wrap-container-disabled': !isLiving }"
          >
            <i class="vh-saas-iconfont vh-saas-a-line-dissolutiongrouping"></i>
            <p>虚拟人数</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSplitScreenServer, useUserServer } from 'middle-domain';
  export default {
    name: 'HeaderControl',
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
      },
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      // 是否开启分屏
      isOpenSplitScreen() {
        return this.$domainStore.state.splitScreenServer.isOpenSplitScreen;
      },
      // 是否开启了插播
      isInsertFilePushing() {
        return this.$domainStore.state.insertFileServer.isInsertFilePushing;
      },
      // 是否开启桌面共享
      isCurrentShareScreen() {
        return (
          this.$domainStore.state.desktopShareServer.localDesktopStreamId &&
          this.$domainStore.state.desktopShareServer.desktopShareInfo.accountId ==
            this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id
        );
      },
      // 是否正在第三方推流
      thirtPushStreamimg() {
        return this.roomBaseServer.state.isThirdStream;
      },
      //是否显示第三方推流组件
      isShowThirdPushStream() {
        // mode == 2: 支持第三方推流 并且不能是无延迟直播， 配置项configList['btn_thirdway'] == 1
        return (
          this.configList['btn_thirdway'] &&
          this.webinarInfo.no_delay_webinar == 0 &&
          this.webinarInfo.mode == 2 &&
          !this.thirtPushStreamimg
        );
      }
    },
    data() {
      return {
        roomBaseState: null,
        userInfo: {}, // 用户头图和名称、角色
        webinarInfo: {} //活动下信息
      };
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.splitScreenServer = useSplitScreenServer();
      this.useServer = useUserServer();
      this.roomBaseState = this.roomBaseServer.state;
      this.userInfo = this.roomBaseState.watchInitData.join_info;
      this.webinarInfo = this.roomBaseState.watchInitData.webinar;
    },
    methods: {
      // 分屏状态更改
      handleSplitScreenChange() {
        window.vhallReportForProduct && window.vhallReportForProduct.report(120003);
        if (this.isOpenSplitScreen) {
          this.splitScreenServer.closeSplit();
        } else {
          // queryString
          const search = location.search
            ? `${location.search}&s=1&layout=${sessionStorage.getItem('layout')}`
            : `?s=1&layout=${sessionStorage.getItem('layout')}`;
          // location
          const url =
            process.env.NODE_ENV === 'development'
              ? `${window.location.origin}`
              : `${window.location.protocol}${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_ROUTER_BASE_URL}`;
          const retUrl = `${url}/lives/split-screen/${this.$route.params.id}${search}`;
          this.splitScreenServer.openSplit(retUrl);
        }
      },
      openMediaSettings() {
        // TODO 媒体设置弹窗
        this.$emit('openMediaSettings');
      },
      roleQuit() {
        // 角色退出
        window.vhallReportForProduct && window.vhallReportForProduct.report(110142);
        this.useServer.loginRoleOut({ webinar_id: this.webinarInfo.id }).then(res => {
          if (res.code == 200) {
            window.location.href = `${window.location.protocol}${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_WEB_KEY}/lives/keylogin/${this.webinarInfo.id}/${this.userInfo.role_name}`;
            window.localStorage.clear();
            window.sessionStorage.clear();
          }
        });
        // 调用退出接口 跳转页面
      },
      thirdPartyShow() {
        // 第三方发起
        if (this.isLiving) {
          this.$message.warning('请先结束直播');
          return;
        }
        window.vhallReportForProduct && window.vhallReportForProduct.report(120002);
        this.$emit('thirdPushStream', true);
        this.$domainStore.state.roomBaseServer.isThirdpartyInitiated = true;
        this.roomBaseServer.setInavToolStatus('start_type', 4);
      },
      thirdPartyClose() {
        // 网页发起 第三方发起关闭
        if (this.isLiving) {
          this.$message.warning('请先结束直播');
          return;
        }
        this.$emit('thirdPushStream', false);
        this.$domainStore.state.roomBaseServer.isThirdpartyInitiated = false;
        this.roomBaseServer.setInavToolStatus('start_type', 1);
      },
      openVirtualAudience() {
        // 虚拟人数弹窗
        window.vhallReportForProduct && window.vhallReportForProduct.report(120004);
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
