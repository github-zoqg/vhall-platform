<template>
  <div class="vmp-code-login">
    <div class="vmp-reg-login__son__tab" v-if="sonTitle">
      <span>{{ sonTitle }}</span>
    </div>
    <el-form
      ref="ruleForm"
      key="codeLoginForm"
      :model="ruleForm"
      :rules="ruleFormRules"
      label-width="0"
      class="vmp-login__form__common"
    >
      <!-- 手机号 -->
      <el-form-item prop="phone" class="common_mg3">
        <el-input
          v-model.trim="ruleForm.phone"
          clearable
          :maxlength="11"
          :placeholder="$t('account.account_1025')"
        ></el-input>
      </el-form-item>
      <!-- 图片验证码 -->
      <el-form-item class="common_mg3">
        <div id="codeLoginCaptcha" class="vhsaas-yundun-captcha"></div>
      </el-form-item>
      <!-- 短信验证码 -->
      <el-form-item prop="captchas" class="vmp-reg-login__wrap__code common_mg3">
        <el-input
          v-model.trim="ruleForm.captchas"
          clearable
          type="captcha"
          :maxlength="6"
          :placeholder="$t('account.account_1029')"
          @blur="autoLoginSetMargin"
        ></el-input>
        <span
          type="danger"
          :disabled="btnDisabled || isDownTime"
          :class="[
            'vmp-reg-login__code__btn vmp-reg-login__show__border',
            {
              start: !btnDisabled && !isDownTime,
              disabled: btnDisabled,
              pending: !btnDisabled && isDownTime
            }
          ]"
          @click.stop.prevent="handleSendCode"
        >
          {{
            isDownTime
              ? $t('account.account_1031', { n: userServerState.second })
              : $t('account.account_1030')
          }}
        </span>
      </el-form-item>
      <!-- 其它  -->
      <el-form-item>
        <div
          :class="[
            'vmp-reg-login-box__link vmp-reg-login-box__code__link common_mg3',
            {
              'vmp-reg-login-box__height__max': isMaxHeight
            }
          ]"
        >
          <el-checkbox v-model="autoLoginStatus" class="vmp-box-checkbox"></el-checkbox>
          <span
            class="vmp-reg-login-box__auto vmp-reg-login-box__checked"
            @click="autoLoginStatus = !autoLoginStatus"
          >
            {{ $t('login.login_1005') }}
          </span>
        </div>
        <div class="common_mg3">
          <el-button
            type="primary"
            round
            class="length-max vmp-reg-login__login__btn"
            @click="handleCodeLogin"
          >
            {{ $t('nav.nav_1005') }}
          </el-button>
        </div>
        <!-- 隐私合规 -->
        <vmp-privacy-compliance
          scene="loginDynamic"
          clientType="pc"
          @check="checkResult"
        ></vmp-privacy-compliance>
        <a
          href="javascript:void(0)"
          class="vmp-reg-login__reg__link common_mg3"
          v-if="showToReg == 1"
          @click="handleToReg"
        >
          {{ $t('register.register_1005') }}
        </a>
      </el-form-item>
      <!-- 第三方登录 -->
      <third-login-link v-if="showThirdLogin"></third-login-link>
    </el-form>
  </div>
</template>
<script>
  /**
   * @description 验证码登录
   */
  import ThirdLoginLink from './third-login-link.vue';
  import mixin from '../mixins/mixin';
  export default {
    name: 'VmpCodeLogin',
    mixins: [mixin],
    components: {
      ThirdLoginLink
    },
    data() {
      const validatePhone = (rule, value, callback) => {
        if (value === '') {
          callback(this.$t('account.account_1025'));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            callback(new Error(this.$t('account.account_1069')));
          } else {
            callback();
          }
        }
      };
      const validateCaptchas = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('account.account_1070')));
        } else {
          callback();
        }
      };
      return {
        ruleForm: {
          phone: '', // 验证码登录时，表示手机号
          captchas: '' // 短信验证码
        },
        ruleFormRules: {
          phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
          captchas: [{ required: true, validator: validateCaptchas, trigger: 'blur' }]
        },
        autoLoginStatus: false, // 账户的自动登录
        isMaxHeight: false, // 样式控制 - 若验证码通过，或者未输入情况下，自动登录跟其间距只需要8px;
        btnDisabled: true, // 手机号 & 图形验证码 校验，控制发送验证码是否可以点击。默认不可点击
        loginDynamicChecked: false // 登录(快捷短信登录)——默认未选中
      };
    },
    watch: {
      'ruleForm.captchas': function () {
        this.autoLoginSetMargin();
      },
      // 输入手机号
      'ruleForm.phone': function () {
        this.codeBtnDisabledCheck();
      },
      captchaReady() {
        this.codeBtnDisabledCheck();
      }
    },
    methods: {
      // 切换至注册面板
      handleToReg() {
        this.$emit('handleLink', 'reg');
      },
      // 间距设定
      autoLoginSetMargin() {
        this.$refs.ruleForm.validateField('captchas', res => {
          this.isMaxHeight = !!res;
        });
      },
      // 控制发送验证码是否禁用状态
      codeBtnDisabledCheck() {
        if (!this.captchaReady) return (this.btnDisabled = true);
        if (this.ruleForm.phone) {
          this.$refs.ruleForm.validateField('phone', err => {
            this.btnDisabled = !!err;
          });
        }
      },
      // 发送验证码 - 按钮点击
      handleSendCode() {
        if (this.btnDisabled || this.isDownTime) return;
        if (!this.captchaReady) {
          this.$message({
            message: this.$t('login.login_1017'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        this.$refs.ruleForm.validateField('phone', err => {
          if (!err) {
            this.userServer.sendCode(this.ruleForm.phone); // 相应与异常已在domain处理
          }
        });
      },
      // 点击登录 - 验证码登录
      async handleCodeLogin() {
        if (!this.loginDynamicChecked) {
          this.$message({
            message: this.$t('privacy.privacy_1005'),
            showClose: true,
            type: 'warning',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        const valid = await this.$refs.ruleForm.validate();
        if (!valid) return false;
        const params = {
          way: 2, // 手机号验证码登录
          phone: this.ruleForm.phone,
          dynamic_code: this.ruleForm.captchas, // 动态密码【快捷登录（短信验证码登录）必传】
          remember: this.autoLoginStatus ? 1 : ''
        };
        if (this.visitorId) {
          params.visitor_id = this.visitorId; // 游客id 登录方式为账号密码或者手机号验证码方式，如果传入游客ID会将访客和登录账户进行绑定
        }
        this.userServer.userLogin(params).then(res => {
          if (res.code === 200) {
            this.$emit('handleClose', 'code');
            // 刷新页面
            window.location.reload();
          } else {
            this.$message({
              message: this.$tec(res.code) || this.$t('login.login_1021'),
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          }
        });
      },
      /* 隐私合规选择结果标记 */
      checkResult(obj) {
        this[`${obj.scene}Checked`] = obj.checked;
      }
    },
    async mounted() {
      await this.userServer.initNECaptcha();
    }
  };
</script>
<style lang="less">
  @import url('../styles/reset.less');
  .vmp-code-login {
    padding: 0 29px 24px;
    .common_mg3 {
      margin-right: 3px;
      margin-left: 3px;
    }
  }
</style>
