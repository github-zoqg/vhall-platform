<template>
  <div class="vhall_weixin_auth">
    <van-popup v-model="unionid" round position="bottom" :close-on-click-overlay="false">
      <div class="auth_header">
        <img src="../assets/images/vh-logo.png" alt="" />
        <span>微吼直播</span>
        <span>申请</span>
      </div>
      <div class="auth_body">
        <p class="tip_header">获取您的微信昵称、头像信息</p>
        <p class="tip_content">用于观看直播参与聊天、抽奖、抢红包等互动行为。</p>
      </div>
      <div class="button_box">
        <van-button round type="primary" class="auth_button_wid" @click="goAuth">
          微信授权
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
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
        this.unionid = localStorage.getItem('unionid') ? false : true;
      }
    }
  };
</script>

<style lang="less">
  .vhall_weixin_auth {
    .van-popup {
      padding: 48px;
      height: 470px;
    }
    .auth_header {
      display: flex;
      align-items: center;
      span {
        color: #1a1a1a;
        font-weight: 600;
        font-size: 28px;
        line-height: 36px;
        margin-left: 12px;
      }
      img {
        width: 26px;
        height: 26px;
      }
    }
    .auth_body {
      .tip_header {
        margin-top: 40px;
        color: #262626;
        font-weight: 600;
        font-size: 32px;
        line-height: 44px;
      }
      .tip_content {
        color: #8c8c8c;
        font-weight: 400;
        font-size: 28px;
        line-height: 39px;
        margin-top: 16px;
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
