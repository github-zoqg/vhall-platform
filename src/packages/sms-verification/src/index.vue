<template>
  <van-popup v-model="dialogVisible" class="sms-verification" round :close-on-click-overlay="false">
    <div class="container">
      <div class="title-wrap">
        <p class="title">提交手机号接收消息提醒</p>
        <i class="vh-iconfont vh-line-close" />
      </div>
      <ul class="form-wrap">
        <li class="form-item line">
          <van-field
            v-model="input"
            :placeholder="$t('account.account_1025')"
            type="tel"
            class="input"
            maxlength="15"
          />
        </li>
        <template v-if="needVerification">
          <li class="smsVerificationCaptcha form-item"></li>
          <li class="verification-wrap form-item line">
            <van-field
              v-model="input"
              :placeholder="$t('form.form_1020')"
              type="tel"
              class="code-input"
              maxlength="15"
            />
            <van-button class="code-btn" type="danger" :disabled="isDownTime" @click="sendCode">
              {{
                isDownTime
                  ? $t('account.account_1031', { n: userServerState.second })
                  : $t('account.account_1030')
              }}
            </van-button>
          </li>
        </template>
      </ul>

      <van-button round type="danger" class="btn" size="normal" block :disabled="btnDisabled">
        提交
      </van-button>
    </div>
  </van-popup>
</template>
<script>
  import { useUserServer } from 'middle-domain';
  export default {
    name: 'VmpSmsVerification',
    data() {
      const userServerState = this.userServer.state; // 响应式注入
      return {
        userServerState,
        dialogVisible: true,
        input: '',
        needVerification: false
      };
    },
    beforeCreate() {
      this.userServer = useUserServer();
    },
    computed: {
      btnDisabled() {
        if (this.needVerification) {
          return true;
        } else {
          // 不需要验证只要数字为 11-11-15即可
          return this.input.length < 11 || this.input.length > 15;
        }
      },
      captchaReady() {
        return !!this.userServerState.captchaVal;
      },
      isDownTime() {
        return this.userServerState.second >= 0;
      }
    },
    mounted() {
      this.open(true);
    },
    methods: {
      open(needVerification = false) {
        this.needVerification = needVerification;
        this.input = '';
        this.dialogVisible = true;
        if (this.needVerification) {
          this.$nextTick(() => {
            this.userServer.initNECaptcha('.smsVerificationCaptcha');
          });
        }
      },
      sendCode() {
        this.userServer.sendCode(18510781799);
      }
    }
  };
</script>
<style lang="less">
  .sms-verification {
    // overflow: visible;
    .container {
      width: 670px;
      padding: 50px 60px;
    }
    .title-wrap {
      height: 44px;
      position: relative;
    }
    .title {
      font-weight: 500;
      font-size: 32px;
      color: #1d1d1d;
    }
    .vh-line-close {
      position: absolute;
      top: 0;
      right: 0;
      color: #8c8c8c;
    }
    .form-wrap {
      width: 100%;
    }
    .form-item {
      margin-bottom: 30px;
      &.line {
        border-bottom: 1px solid #e6e6e6;
      }
    }
    .smsVerificationCaptcha {
      height: 80px; // 方式易盾加载导致页面高度变动
    }
    .code-btn {
      width: 206px;
      height: 68px;
    }
    .input {
      margin-top: 30px;
      // border: 1px solid #ccc;
    }
    .btn {
      margin: 56px auto 0;
    }
    .verification-wrap {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .code-input {
      display: inline-block;
      width: 60%;
      // border: 1px solid #ccc;
    }
  }
</style>
