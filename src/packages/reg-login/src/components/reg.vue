<template>
  <div class="vmp-register">
    <div class="vmp-reg-login__son__tab">
      <span>{{ $t('register.register_1002') }}</span>
    </div>
    <el-form
      key="ruleForm"
      ref="ruleForm"
      :model="ruleForm"
      :rules="ruleFormRules"
      label-width="0"
      class="vmp-login__form__common"
    >
      <!-- 手机号 -->
      <el-form-item prop="phone">
        <el-input
          v-model.trim="ruleForm.phone"
          :placeholder="$t('account.account_1025')"
          :maxlength="11"
          clearable
          auto-complete="off"
          @blur="codeBtnDisabledCheck"
        ></el-input>
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item>
        <div id="regCaptcha" class="vhsaas-yundun-captcha"></div>
      </el-form-item>
      <!-- 短信验证码 -->
      <el-form-item prop="captchas" class="vmp-reg-login__wrap__code">
        <el-input
          v-model.trim="ruleForm.captchas"
          clearable
          type="captcha"
          :maxlength="6"
          :placeholder="$t('account.account_1029')"
        ></el-input>
        <!--
          start: 默认态，红色。条件：手机号 & 图片验证码 校验通过，当前倒计时结束 或 倒计时未开启。
          disabled: 禁用态，灰色。条件：手机号 或 图片验证码 校验失败。
          pending: 验证码发送中，灰色。条件：手机号 & 图片验证码 校验通过，当前倒计时进行中。
         -->
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
      <el-form-item prop="password" class="vmp-register__pwd__box">
        <el-input
          :type="regPwdShow ? 'text' : 'password'"
          v-model.trim="ruleForm.password"
          clearable
          :placeholder="$t('register.register_1007')"
        >
          <i
            slot="suffix"
            class="vh-iconfont"
            :class="[regPwdShow ? 'vh-line-view' : 'vh-line-hidden']"
            @click="passWordType"
          ></i>
        </el-input>
        <a
          href="javascript:void(0)"
          class="vmp-register__login__link"
          @click.stop.prevent="handleToLogin"
        >
          {{ $t('nav.nav_1005') }}
        </a>
      </el-form-item>
      <el-button
        type="primary"
        round
        class="length-max vmp-reg-login__register__btn"
        @click="handleRegister"
      >
        {{ $t('register.register_1013') }}
      </el-button>
      <div class="vmp-reg-login__register__checked">
        <!-- 隐私合规 -->
        <vmp-privacy-compliance
          scene="register"
          clientType="pc"
          @check="checkResult"
        ></vmp-privacy-compliance>
      </div>
    </el-form>
  </div>
</template>
<script>
  import mixin from '../mixins/mixin';
  export default {
    name: 'VmpRegister',
    mixins: [mixin],
    data() {
      const validateRegPhone = async (_, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('account.account_1025')));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            callback(new Error(this.$t('account.account_1069')));
          } else {
            await this.userServer
              .loginCheck(value)
              .then(async res => {
                // 检测结果：check_result 0账号未锁定 1账号锁定; account_exist 账号是否存在：1存在 0不存在
                if (res.code == 200 && res.data && res.data.account_exist > 0) {
                  callback(new Error(this.$t('register.register_1006')));
                } else {
                  callback();
                }
              })
              .catch(res => {
                console.log('验证手机号是否存在', res);
                callback(new Error('请输入正确的手机号'));
              });
          }
        }
      };
      const validateCaptchas = (_, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('account.account_1070')));
        } else {
          callback();
        }
      };
      const validRegPwd = (_, value, callback) => {
        const pattern = /^([0-9a-zA-Z_`!~@#$%^*+=,.?;'":)(}{/\\|<>&[-]|]){6,30}$/;
        if (value === '') {
          callback(); // 允许为空
        } else if (!pattern.exec(value)) {
          callback(new Error(this.$t('login.login_1014')));
        } else {
          callback();
        }
      };
      return {
        isMobile: false, // 是否是手机端展示(true - 手机端；false - PC浏览器)
        options: {},
        ruleForm: {
          agree: 1,
          phone: '',
          captchas: '',
          password: ''
        },
        ruleFormRules: {
          phone: [{ validator: validateRegPhone, trigger: 'blur' }],
          captchas: [{ required: true, validator: validateCaptchas, trigger: 'blur' }],
          password: [{ required: false, validator: validRegPwd, trigger: 'blur' }]
        },
        regPwdShow: false, // 注册 - 密码框的显示
        registerChecked: false,
        loginKeyVo: null,
        btnDisabled: true // 手机号 & 图形验证码 校验，控制发送验证码是否可以点击。默认不可点击
      };
    },
    watch: {
      'ruleForm.password'(val) {
        this.ruleForm.password = `${val}`.replace(/[\u4E00-\u9FA5]/g, '');
      },
      'ruleForm.phone': function () {
        this.codeBtnDisabledCheck();
      },
      'ruleForm.captchas'(val) {
        this.ruleForm.captchas = `${val}`.replace(/[^0-9]/g, '');
      },
      captchaReady() {
        this.codeBtnDisabledCheck();
      }
    },
    methods: {
      handleToLogin() {
        this.$emit('handleLink', 'login');
      },
      handleFocus(key) {
        this[key] = true;
      },
      handleBlur(key) {
        this[key] = false;
      },
      passWordType() {
        this.regPwdShow = !this.regPwdShow;
      },
      codeBtnDisabledCheck() {
        if (!this.captchaReady) return (this.btnDisabled = true);
        if (this.ruleForm.phone) {
          this.$refs.ruleForm.validateField('phone', err => {
            this.btnDisabled = !!err;
          });
        }
      },
      handleSendCode() {
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
          // console.log('校验结果：', !err);
          if (!err) {
            this.userServer.sendCode(this.ruleForm.phone, 8); // 相应与异常已在domain处理
          }
        });
      },
      // 注册
      handleRegister() {
        if (!this.registerChecked) {
          this.$message({
            message: this.$t('privacy.privacy_1005'),
            showClose: true,
            type: 'warning',
            customClass: 'zdy-info-box'
          });
          return;
        }
        this.$refs.ruleForm.validate(async valid => {
          if (valid) {
            if (!this.captchaReady) {
              this.$message({
                message: this.$t('login.login_1023'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
              return;
            }
            let relt = {};
            if (this.ruleForm.password?.length) {
              relt = await this.userServer.handlePassword(this.ruleForm.password);
              if (!relt.pass) {
                this.$message({
                  message: this.$tec(relt.code) || this.$t('register.register_1010'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
                return false;
              }
            }
            const params = {
              source: 2,
              way: 2, // （默认2）1=账号密码注册|2=手机号验证码注册
              phone: this.ruleForm.phone,
              code: this.ruleForm.captchas,
              password: '',
              agree: 1
            };
            if (relt?.retPassword) {
              params.password = relt.retPassword;
              params.uuid = relt.uuid;
            }
            const failure = err => {
              console.log('注册失败', err);
              this.$message({
                message: this.$tec(err.code) || this.$t('register.register_1010'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            };
            this.userServer
              .register(params)
              .then(res => {
                if (res.code == 200) {
                  this.$message({
                    message: this.$t('register.register_1009'),
                    showClose: true,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  this.handleToLogin();
                } else {
                  failure(res);
                }
              })
              .catch(err => {
                failure(err);
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
      await this.userServer.initNECaptcha('#regCaptcha');
    }
  };
</script>
<style lang="less">
  @import url('../styles/reset.less');
  .vmp-register {
    padding: 0 32px 24px 32px;
  }
  .vmp-register__pwd__box {
    position: relative;
    margin-bottom: 40px !important; /*此处固定高度不变*/
    .el-form-item__error {
      position: absolute;
      top: 100%;
      left: 0;
    }
    .vmp-register__login__link {
      position: absolute;
      right: 0;
      top: 44px;
      text-decoration: unset;
      cursor: pointer;
      width: 42px;
      height: 20px;
      font-size: 14px;
      font-weight: 400;
      color: #3562fa;
      line-height: 20px;
    }
  }
  .vmp-reg-login__register__btn {
    margin-bottom: 8px;
  }
  .vmp-reg-login__register__checked {
    text-align: left;
    vertical-align: middle;
    line-height: 20px;
    .el-checkbox__label {
      font-size: 14px;
      font-weight: 400;
      color: #999;
      line-height: 20px;
    }
    .el-checkbox {
      display: flex;
      white-space: normal;
    }
    .el-checkbox__input {
      // float: left;
      position: relative;
      top: 2px;
    }
    a {
      cursor: pointer;
      text-decoration: unset;
      font-size: 14px;
      font-weight: 400;
      color: #3562fa;
      &:hover,
      &:active {
        color: #3562fa;
      }
    }
  }
</style>
