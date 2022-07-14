<template>
  <div class="vmp-user-center-wap">
    <van-popup
      class="user-advatar-popup"
      v-model="visible"
      position="bottom"
      safe-area-inset-bottom
    >
      <div class="user-menu-item" @click="changeUserState">
        <div class="user-menu-box">
          <i class="vh-iconfont vh-line-account"></i>
        </div>
        <p>{{ $t('account.account_1001') }}</p>
      </div>
      <div class="user-menu-item" @click="changeCashState">
        <div class="user-menu-box">
          <i class="vh-iconfont vh-a-line-financialcenter"></i>
        </div>
        <p>{{ $t('nav.nav_1028') }}</p>
      </div>
    </van-popup>
  </div>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpUserCenterWap',
    data() {
      return {
        visible: false
      };
    },
    methods: {
      openUserCenterWap() {
        this.visible = true;
      },

      closeUserCenterWap() {
        this.visible = false;
      },

      // 打开个人资料
      changeUserState() {
        console.log('changeUserState');
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenUserAccountWap'));
      },

      // 打开提现管理
      changeCashState() {
        console.log('changeCashState');
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenCashWap'));
      }
    }
  };
</script>

<style lang="less">
  .vmp-user-center-wap {
    .user-advatar-popup {
      box-sizing: border-box;
      padding: 20px 30px 40px 30px;
      .user-menu-item {
        text-align: left;
        margin-top: 0;
        height: 88px;
        line-height: 88px;
        i.vh-iconfont {
          font-size: 48px;
        }
        .user-menu-box {
          display: inline-block;
          vertical-align: middle;
          margin-right: 20px;
        }
        p {
          display: inline-block;
          vertical-align: middle;
        }
      }
    }
  }
</style>
