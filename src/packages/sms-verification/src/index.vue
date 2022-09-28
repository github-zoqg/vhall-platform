<template>
  <van-popup v-model="dialogVisible" class="sms-verification" round>
    <div class="container">
      <div class="title-wrap">
        <p class="title">{{ $t('appointment.appointment_1034') }}</p>
        <i class="vh-iconfont vh-line-close" @click="dialogVisible = false" />
      </div>
      <ul class="form-wrap">
        <li class="form-item line input-item">
          <van-field
            v-model="phone"
            :placeholder="$t('account.account_1025')"
            type="tel"
            class="input"
            maxlength="15"
          />
          <p v-if="showPhoneErrorShow" class="error-message">{{ $t('account.account_1069') }}</p>
        </li>
        <template v-if="needVerification">
          <li class="smsVerificationCaptcha form-item"></li>
          <li class="verification-wrap form-item line input-item">
            <van-field
              v-model="code"
              :placeholder="$t('form.form_1020')"
              type="tel"
              class="code-input"
              maxlength="6"
            />
            <van-button
              class="code-btn"
              type="danger"
              :disabled="!captchaReady || isDownTime"
              @click="sendCode"
            >
              {{
                isDownTime
                  ? $t('account.account_1031', { n: userServerState.second })
                  : $t('account.account_1030')
              }}
            </van-button>
            <p v-if="showCodeError" class="error-message">{{ $t('form.form_1020') }}</p>
          </li>
        </template>
      </ul>
      <van-button round type="danger" class="btn" size="normal" block @click="handleSumbit">
        {{ $t('login.login_1054') }}
      </van-button>
      <!-- 隐私合规（嵌入不展示） -->
      <vmp-privacy-compliance
        scene="smsVerification"
        clientType="mobile"
        compType="2"
      ></vmp-privacy-compliance>
    </div>
  </van-popup>
</template>
<script>
  import { useUserServer, useSubscribeServer, useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpSmsVerification',
    data() {
      const userServerState = this.userServer.state; // 响应式注入
      return {
        userServerState,
        dialogVisible: false,
        phone: '',
        code: '',
        needVerification: false,
        showPhoneErrorShow: false,
        showCodeError: false
      };
    },
    beforeCreate() {
      this.userServer = useUserServer();
    },
    computed: {
      codeBtnDisabled() {
        return this.phone.length < 11 || this.phone.length > 15;
      },
      captchaReady() {
        return !!this.userServerState.captchaVal;
      },
      isDownTime() {
        return this.userServerState.second >= 0;
      }
    },
    methods: {
      open(needVerification = false) {
        this.needVerification = needVerification;
        this.phone = '';
        this.dialogVisible = true;
        if (this.needVerification) {
          this.$nextTick(() => {
            this.userServer.initNECaptcha('.smsVerificationCaptcha');
          });
        }
      },
      sendCode() {
        if (this.checkMobile()) {
          this.userServer.sendCode(this.phone, 12);
        }
      },
      // 提交
      handleSumbit() {
        if (!this.checkMobile()) return false;
        if (this.needVerification && !this.code) {
          this.showCodeError = true;
          return false;
        }
        const watchInitData = useRoomBaseServer().state?.watchInitData;
        const failure = res => {
          this.userServer.refreshNECaptha();
          this.$toast(res.msg);
        };
        const params = {
          visitor_id: watchInitData?.visitor_id,
          webinar_id: watchInitData?.webinar?.id,
          phone: this.phone
        };
        if (this.needVerification) {
          params.code = this.code;
        }
        useSubscribeServer()
          .noticeWechatSubmit(params)
          .then(res => {
            if (res.code === 200) {
              window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitSubmitSuccess'));
              this.dialogVisible = false;
            } else {
              failure(res);
            }
          })
          .catch(res => failure(res));
      },
      checkMobile() {
        this.clearVerify();
        let relt;
        if (this.needVerification) {
          const reg = /^1[0-9]{10}$/; // 手机号
          relt = reg.test(this.phone);
        } else {
          // 没有开启手机号验证  只有手机号长度
          relt = this.phone.length >= 11 && this.phone.length <= 15;
        }
        if (!relt) {
          this.showPhoneErrorShow = true;
        }
        return relt;
      },
      // 清除错误提示
      clearVerify() {
        this.showPhoneErrorShow = false;
        this.showCodeError = false;
      }
    }
  };
</script>
<style lang="less">
  .sms-verification {
    overflow: visible; // 易盾在弹层中可能被遮挡
    .container {
      width: 670px;
      padding: 50px 60px 64px;
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
      position: relative;
      margin-bottom: 30px;
      &.line {
        border-bottom: 1px solid #e6e6e6;
      }
      &.input-item {
        margin-bottom: 48px;
      }
      .error-message {
        position: absolute;
        bottom: -36px;
        font-size: 24px;
        color: #fb2626;
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
    // 覆盖vant-ui
    .van-cell {
      padding: 15px 0;
    }
    .van-button__text {
      white-space: nowrap; //为了避免部分机型折行
    }
  }
</style>
