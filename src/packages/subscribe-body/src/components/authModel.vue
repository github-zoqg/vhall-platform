<template>
  <div class="auth-wrap-mask">
    <div class="auth-wrap">
      <div v-if="modelType == 'auth'" class="auth-model">
        <div class="auth-model__check-head">
          <span>{{ $t('appointment.appointment_1020') }}</span>
          <span class="close-auth iconfont iconguanbi_icon1" @click.stop="close"></span>
        </div>
        <div class="auth-model__check-info">
          <input
            v-show="hidePwd"
            v-model="pwd"
            class="check-pwd"
            type="password"
            :placeholder="holder"
            value="pwd"
          />
          <input v-show="!hidePwd" v-model="pwd" type="text" value="pwd" :placeholder="holder" />
          <span
            v-show="!hidePwd"
            class="pwd-icon iconfont iconxianshi_icon"
            @click.stop="hidePwd = !hidePwd"
          ></span>
          <span
            v-show="hidePwd"
            class="pwd-icon iconfont iconyincang_icon"
            @click.stop="hidePwd = !hidePwd"
          ></span>
        </div>
        <el-button type="primary" size="medium" round class="auth-model__submit" @click="submit">
          {{ $t('account.account_1062') }}
        </el-button>
      </div>
      <div v-if="modelType == 'startLive'" class="auth-model__start">
        <div class="cover"></div>
        <!-- <img src="../images/live_start.png" alt="" class="cover"> -->
        <span>{{ $t('player.player_1018') }}</span>
        <button class="start-live" @click="link">{{ $t('player.player_1013') }}</button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'AuthModel',
    props: {
      modelType: {
        type: String,
        default: 'auth'
      },
      placeHolder: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        pwd: '',
        hidePwd: true,
        holder: '',
        starPwd: ''
      };
    },
    watch: {
      placeHolder: {
        handler(val) {
          this.holder = val;
        },
        immediate: true
      },
      'pwd.length': {
        handler(val) {
          if (val) {
            this.starPwd = `${val}`.replace(/\*/g, '*');
          }
        }
      }
    },
    methods: {
      submit() {
        this.$emit('authCheck', this.pwd);
      },
      close() {
        this.pwd = '';
        this.hidePwd = true;
        this.$emit('closeModel');
      },
      link() {
        this.$emit('jump');
      }
    }
  };
</script>
<style lang="less" scoped>
  .auth-wrap-mask {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.6);
    z-index: 45;
  }
  .auth-wrap {
    // position: absolute;
    // top: 50%;
    // left: 50%;
    // transform: translate(-50%, -50%);
    margin: 20vh auto 0px auto;
  }
  .auth-model {
    width: 400px;
    height: 204px;
    background: #ffffff;
    border-radius: 4px;
    box-sizing: border-box;
    padding: 24px 32px;
    margin: 0px auto;
    &__check-head {
      width: 100%;
      height: 24px;
      margin-bottom: 32px;
      clear: both;
      // display: flex;
      span {
        display: inline-block;
        height: 100%;
        font-size: 20px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #1a1a1a;
        line-height: 24px;
      }
      .close-auth {
        // display: inline-block;
        // width: 18px;
        // height: 18px;
        font-size: 16px;
        float: right;
        color: #999;
        &:hover {
          cursor: pointer;
        }
      }
    }
    &__check-info {
      width: 100%;
      height: 40px;
      position: relative;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
      input {
        width: 80%;
        height: 40px;
        margin-left: 10px;
        display: inline-block;
        background: #ffffff;
        border: none;
        outline: none;
      }
      &:hover {
        border-color: #999;
      }
      &:focus {
        border-color: #999;
      }

      input[type='password']::-ms-reveal {
        display: none;
      }
      input::-ms-clear {
        display: none;
      }
      input::-webkit-input-safebox-button {
        display: none; /*去掉搜狗浏览器密码软盘*/
      }
      /*edge*/
      input::-o-clear {
        display: none;
      }
      .pwd-icon {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        &:hover {
          cursor: pointer;
        }
      }
      .check-pwd::-webkit-credentials-auto-fill-button {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none;
        position: absolute;
        right: -10px;
      }
    }
    &__submit {
      width: 92px;
      height: 36px;
      // background: #fb3a32;
      // border-radius: 18px;
      // outline: none;
      // border: none;
      // font-size: 14px;
      // font-family: PingFangSC-Regular, PingFang SC;
      // font-weight: 400;
      // color: #ffffff;
      // line-height: 36px;
      margin-top: 24px;
      float: right;
      &:hover {
        cursor: pointer;
      }
    }
  }
  .auth-model__start {
    width: 400px;
    height: 260px;
    background: #ffffff;
    border-radius: 4px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #333333;
    line-height: 20px;
    text-align: center;
    padding-top: 54px;
    box-sizing: border-box;
    margin: 0px auto;
    .cover {
      display: block;
      width: 80px;
      height: 80px;
      margin: 0px auto;
      margin-bottom: 10px;
      background: url('../img/live_start.png') no-repeat;
      background-size: 100%;
      background-position: center;
    }
    span {
      display: block;
      text-align: center;
      margin-bottom: 18px;
      height: 20px;
      line-height: 20px;
    }
    .start-live {
      width: 160px;
      height: 40px;
      background: #fb3a32;
      border-radius: 20px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #ffffff;
      line-height: 40px;
      border: none;
      outline: none;
    }
    // img{
    //   display: block;
    //   width: 160px;
    //   height: 162px;
    //   margin: 0px auto;
    // }
  }
</style>
