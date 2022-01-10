<template>
  <div class="vmp-watch-login">
    <div class="vmp-watch-login-unuser" @click="goLogin">
      <p><img src="./images/my-dark@2x.png" alt="" /></p>
      <span>登录</span>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpWatchLogin',
    data() {
      return {
        themeClass: {
          pageBg: '#3562fa'
        }
      };
    },
    methods: {
      goLogin() {
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickLogin'
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-watch-login {
    padding-right: 24px;
    &-unuser {
      text-align: center;
      display: flex;
      cursor: pointer;
      p {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 8px;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
      span {
        font-size: 14px;
        font-weight: 400;
        color: #ccc;
        line-height: 32px;
      }
    }
  }
</style>
