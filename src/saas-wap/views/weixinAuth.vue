<template>
  <div class="vhall_weixin_auth">
    <van-popup v-model="unionid" round position="bottom" :close-on-click-overlay="false">
      <div class="auth_header">
        <img src="../assets/images/vh-logo.png" alt="" />
        <span>{{ $t('other.other_1022') }}</span>
        <span>{{ $t('other.other_1023') }}</span>
      </div>
      <div class="auth_body">
        <p class="tip_header">{{ $t('other.other_1024') }}</p>
        <p class="tip_content">{{ $t('other.other_1025') }}</p>
      </div>
      <div class="button_box">
        <van-button round type="primary" class="auth_button_wid" @click="goAuth">
          {{ $t('other.other_1026') }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
  import { isWechat } from '@/app-shared/utils/tool';
  export default {
    data() {
      return {
        unionid: false
      };
    },
    methods: {
      goAuth() {
        let url = sessionStorage.getItem('weixin_auth_url');
        console.log(url, 'goAuth');
        window.open(url);
      },
      getUnionid() {
        this.unionid =
          !localStorage.getItem('unionid') &&
          isWechat() &&
          this.$domainStore.state.roomBaseServer.configList['ui.hide_wechat'] == 0 &&
          !this.$domainStore.state.roomBaseServer.embedObj.embed
            ? true
            : false;
      }
    }
  };
</script>

<style lang="less">
  .vhall_weixin_auth {
    .van-popup {
      padding: 48px;
      height: 470px;
      z-index: 5000 !important;
    }
    .van-overlay {
      z-index: 5000 !important;
    }
    .auth_header {
      display: flex;
      align-items: center;
      span {
        color: #1a1a1a;
        font-weight: 600;
        font-size: 26px;
        line-height: 36px;
        margin-left: 12px;
      }
      img {
        width: 32px;
        height: 32px;
      }
    }
    .auth_body {
      .tip_header {
        margin-top: 40px;
        color: #262626;
        font-weight: 600;
        font-size: 30px;
        line-height: 44px;
      }
      .tip_content {
        color: #8c8c8c;
        font-weight: 400;
        font-size: 26px;
        line-height: 39px;
        margin-top: 12px;
      }
    }
    .button_box {
      text-align: center;
      margin-top: 56px;
      .auth_button_wid {
        width: 340px;
        height: 80px;
        background: #07c160;
        border: 1px solid #07c160;
        font-size: 32px;
      }
    }
    .weixin_auth {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      position: absolute;
    }
  }
</style>
