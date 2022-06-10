<template>
  <van-popup
    v-model="pwdData.visible"
    class="vmp-bind-password"
    get-container="body"
    :close-on-click-overlay="false"
    @close="dialogClose"
  >
    <h1 class="dialog-title">
      {{ pwdData.type == 'edit' ? $t('account.account_1016') : $t('account.account_1017') }}
      <i class="vh-iconfont vh-line-close" @click="pwdData.visible = false"></i>
    </h1>

    <div class="vmp-bind-password-content">
      <div class="edit-title">{{ $t('account.account_1038') }}</div>

      <div class="vmp-input-base" v-if="pwdData.type == 'edit'">
        <van-field
          class="input-base"
          v-model="pwdForm.old_password"
          name="code"
          type="password"
          autocomplete="off"
          :placeholder="$t('account.account_1039')"
          @blur="validtorOldPassword"
        />
        <p class="error-tip">{{ errorTip.old_password }}</p>
      </div>

      <div class="vmp-input-base">
        <van-field
          class="input-base"
          v-model="pwdForm.password"
          name="code"
          type="password"
          autocomplete="off"
          :placeholder="
            pwdData.type == 'edit' ? $t('account.account_1040') : $t('account.account_1041')
          "
          @blur="validtorPassword"
        />
        <p class="error-tip">{{ errorTip.password }}</p>
      </div>

      <div class="vmp-input-base">
        <van-field
          class="input-base"
          v-model="pwdForm.confirm_password"
          name="code"
          type="password"
          autocomplete="off"
          :placeholder="
            pwdData.type == 'edit' ? $t('account.account_1042') : $t('account.account_1043')
          "
          @blur="validtorConfirmPassword"
        />
        <p class="error-tip">{{ errorTip.confirm_password }}</p>
      </div>
      <div slot="footer">
        <van-button class="vmp-bind-password-submit" @click="editPwdHandler">
          {{ $t('account.account_1037') }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script>
  import { useUserServer } from 'middle-domain';
  const defaultErrorTip = {
    old_password: '',
    password: '',
    confirm_password: ''
  };
  const defaltPwdForm = {
    old_password: '',
    password: '',
    confirm_password: ''
  };
  const passwordReg = /^([0-9a-zA-Z_`!~@#$%^*+=,.?;'":)(}{/\\|<>&[-]|]){6,30}$/;
  export default {
    name: 'BindPassword',
    props: {
      value: {
        type: Object,
        default: () => ({
          type: 'add',
          visible: false
        })
      }
    },
    data() {
      return {
        useUserServer: {},
        pwdForm: Object.assign({}, defaltPwdForm),
        errorTip: Object.assign({}, defaultErrorTip) // 错误提示
      };
    },
    computed: {
      pwdData: {
        set(val) {
          this.$emit('input', val);
        },
        get() {
          return this.value;
        }
      }
    },
    created() {
      this.useUserServer = useUserServer();
    },
    methods: {
      // 弹窗关闭
      dialogClose() {
        this.pwdData.visible = false;
        this.$emit('input', this.pwdData);
        this.pwdForm = Object.assign({}, defaltPwdForm);
        this.errorTip = Object.assign({}, defaultErrorTip);
      },

      // 修改密码
      editPwdHandler() {
        if (this.pwdData.type === 'add') {
          this.validtorPassword() && this.validtorConfirmPassword() && this.resetPassword();
        } else {
          this.validtorOldPassword() &&
            this.validtorPassword() &&
            this.validtorConfirmPassword() &&
            this.resetPassword();
        }
      },

      // 数据校验--旧密码
      validtorOldPassword() {
        if (this.pwdForm.old_password === '') {
          this.errorTip.old_password = this.$t('appointment.appointment_1022');
          return false;
        } else {
          this.errorTip.old_password = '';
          return true;
        }
      },
      // 数据校验--新密码
      validtorPassword() {
        if (this.pwdForm.password === '') {
          this.errorTip.password = this.$t('appointment.appointment_1022');
          return false;
        } else if (!passwordReg.test(this.pwdForm.password)) {
          this.errorTip.password = this.$t('account.account_1072');
          return false;
        } else {
          this.errorTip.password = '';
          return true;
        }
      },
      // 数据校验--确认密码
      validtorConfirmPassword() {
        if (this.pwdForm.confirm_password === '') {
          this.errorTip.confirm_password = this.$t('account.account_1073');
          return false;
        } else if (!passwordReg.test(this.pwdForm.confirm_password)) {
          this.errorTip.confirm_password = this.$t('account.account_1072');
          return false;
        } else if (this.pwdForm.confirm_password !== this.pwdForm.password) {
          this.errorTip.confirm_password = this.$t('account.account_1074');
          return false;
        } else {
          this.errorTip.confirm_password = '';
          return true;
        }
      },

      // 设置密码
      resetPassword() {
        const params = {
          ...this.pwdForm,
          scene_id: this.pwdData.type === 'add' ? 9 : 10 // 1账户信息-修改密码  4忘记密码-邮箱方式找回 5忘记密码-短信方式找回 9设置密码（密码不存在情况）10账户信息-修改密码(不需要发送验证码)
        };
        this.useUserServer
          .resetPassword(params)
          .then(res => {
            if (res && res.code == 200) {
              this.$toast(this.$t('account.account_1059'));
              // 密码修改完成后，刷新页面
              window.localStorage.clear();
              window.sessionStorage.clear();
              this.$nextTick(() => {
                window.location.reload();
              });
            } else {
              this.$toast(this.$tec(res.code) || res.msg);
            }
          })
          .catch(err => {
            this.$toast(this.$tec(err.code) || err.msg);
          });
      }
    }
  };
</script>

<style lang="less">
  .vmp-bind-password {
    width: 680px;
    border-radius: 16px;
    background: #ffffff;
    padding: 60px 40px;

    .dialog-title {
      width: 100%;
      height: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 40px;
      font-weight: 500;
      color: #1a1a1a;

      .vh-line-close {
        color: #c8c9cc;
        font-size: 44px;
      }
    }

    .vmp-bind-password-content {
      padding-top: 48px;

      .edit-title {
        height: 88px;
        display: flex;
        align-items: center;
        font-size: 28px;
        color: #1a1a1a;
        padding-bottom: 48px;
      }

      .edit-tip {
        line-height: 40px;
        font-size: 28px;
        color: #fb3a32;
      }

      .edit-phone {
        height: 72px;
        display: flex;
        align-items: center;
        font-size: 28px;
        color: #1a1a1a;
      }

      .vmp-input-base {
        .input-base {
          padding: 0;

          .van-field__body {
            width: 100%;
            height: 80px;
            border-radius: 8px;
            border: 1px solid rgba(151, 151, 151, 0.5);
            padding: 0 0 0 20px;

            .van-field__control::placeholder {
              color: #979797;
            }

            .input-button {
              border: none;
              font-size: 28px;
              color: #999999;
            }
            .input-button-disable {
              border: none;
              font-size: 28px;
              color: #fb3a32;
            }
          }
        }
        .error-tip {
          height: 48px;
          display: flex;
          align-items: center;
          font-size: 24px;
          color: #fb3a32;
          &.error-tip-mini {
            height: 32px;
          }
        }
      }
    }

    .vmp-bind-password-submit {
      width: 100%;
      height: 80px;
      border-radius: 40px;
      background: #fb3a32;
      color: #ffffff;
      font-size: 28px;
    }
  }
</style>
