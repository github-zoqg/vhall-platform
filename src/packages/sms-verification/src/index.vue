<template>
  <van-popup v-model="dialogVisible" class="sms-verification" round>
    <div class="container">
      <div class="title-wrap">
        <p class="title">{{ $t('appointment.appointment_1034') }}</p>
        <i class="vh-iconfont vh-line-close" @click="dialogVisible = false" />
      </div>
      <ul class="form-wrap">
        <li :class="['form-item line', phoneError ? 'error' : '']">
          <van-field
            v-model="phone"
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
          </li>
        </template>
      </ul>
      <van-button round type="danger" class="btn" size="normal" block @click="handleSumbit">
        提交
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
        phoneError: '',
        captchaError: '',
        codeError: ''
      };
    },
    beforeCreate() {
      this.userServer = useUserServer();
    },
    computed: {
      codeBtnDisabled() {
        return this.phone.length < 11 || this.phone.length > 15;
        // if (this.needVerification) {
        // }
        //   return false;
        // } else {
        //   // 不需要验证只要数字为 11-11-15即可
      },
      captchaReady() {
        return !!this.userServerState.captchaVal;
      },
      isDownTime() {
        return this.userServerState.second >= 0;
      }
    },
    mounted() {
      // this.open(false);
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
        this.userServer.sendCode(this.phone, 12);
      },
      // 提交
      handleSumbit() {
        const validate = this.checkMobile();
        if (!validate) return false;
        const watchInitData = useRoomBaseServer().state?.watchInitData;
        const failure = res => {
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
        let relt;
        if (this.needVerification) {
          const reg = /^1[0-9]{10}$/; // 手机号
          relt = reg.test(this.phone);
        } else {
          // 没有开启手机号验证  只有手机号长度
          relt = this.phone.length >= 11 && this.phone.length <= 15;
        }
        if (relt) {
          this.clearVerify();
        } else {
          this.phoneError = '请输入正确的手机号';
        }
        console.log(relt);
        return relt;
      },
      // 清除错误提示
      clearVerify() {
        this.phoneError = null;
        // this.userServerState();
      }
    }
  };
</script>
<style lang="less">
  .sms-verification {
    overflow: visible; // 易盾在弹层中可能被遮挡
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
