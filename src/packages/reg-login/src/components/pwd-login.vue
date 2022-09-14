<template>
  <div class="vmp-pwd-login">
    <div class="vmp-reg-login__son__tab" v-if="sonTitle">
      <span>{{ sonTitle }}</span>
    </div>
    <el-form
      ref="ruleForm"
      key="pwdLoginForm"
      :model="ruleForm"
      :rules="ruleFormRules"
      label-width="0"
      class="vmp-login__form__common"
    >
      <!-- 账户相关 -->
      <el-form-item prop="account" class="common_mg3">
        <el-input
          v-model.trim="ruleForm.account"
          clearable
          :placeholder="$t('login.login_1010')"
        ></el-input>
      </el-form-item>
      <!-- 图片验证码 -->
      <el-form-item v-show="captchaIsShow" class="common_mg3">
        <div id="pwdLoginCaptcha" class="vhsaas-yundun-captcha"></div>
      </el-form-item>
      <!-- 请输入登录密码 -->
      <el-form-item prop="password" class="common_mg3">
        <PwdInput
          v-model.trim="ruleForm.password"
          clearable
          :placeholder="$t('login.login_1011')"
          :maxlength="30"
          auto-complete="off"
          onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
        ></PwdInput>
      </el-form-item>
      <!-- 其它 -->
      <el-form-item>
        <div
          :class="[
            'vmp-reg-login-box__link vmp-reg-login-box__pwd__link common_mg3',
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
          <span class="vmp-reg-login-box__auto vmp-reg-login-box__forget">
            <a :href="forgetUrl" target="_blank">{{ $t('login.login_1012') }}</a>
          </span>
        </div>
        <div class="common_mg3">
          <el-button
            type="primary"
            round
            class="length-max vmp-reg-login__login__btn"
            @click="handlePwdLogin"
          >
            {{ $t('nav.nav_1005') }}
          </el-button>
        </div>
        <!-- 隐私合规 -->
        <vmp-privacy-compliance
          scene="login"
          clientType="pc"
          @check="checkResult"
        ></vmp-privacy-compliance>
        <a
          href="javascript:void(0)"
          class="vmp-reg-login__reg__link"
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
  import ThirdLoginLink from './third-login-link.vue';
  import PwdInput from './pwd-input.vue';
  import mixin from '../mixins/mixin';
  export default {
    name: 'VmpPwdLogin',
    mixins: [mixin],
    components: {
      ThirdLoginLink,
      PwdInput
    },
    data() {
      const validAccount = (rule, value, callback) => {
        this.accError = value === '';
        if (value === '') {
          callback(new Error(this.$t('login.login_1010')));
        } else {
          callback();
        }
      };
      const validPwd = (rule, value, callback) => {
        const pattern = /^([0-9a-zA-Z_`!~@#$%^*+=,.?;'":)(}{/\\|<>&[-]|]){6,30}$/;
        this.mailError = value === '' || !pattern.exec(value);
        if (value === '') {
          callback(new Error(this.$t('login.login_1011')));
        } else if (!pattern.exec(value)) {
          callback(new Error(this.$t('login.login_1013')));
        } else {
          callback();
        }
      };
      return {
        ruleForm: {
          account: '', // 密码登录时，表示账号
          password: '' // 密码
        },
        ruleFormRules: {
          account: [{ required: true, validator: validAccount, trigger: 'blur' }],
          password: [{ required: true, validator: validPwd, trigger: 'blur' }]
        },
        loginPwdShow: true, // 密码输入内容可见
        captchaIsShow: false, // 是否触发图形验证码展示
        isLoginPwdFocus: false, // handleFocus / handleBlur 会更改此参
        autoLoginStatus: false, // 账户的自动登录
        forgetUrl: 'javascript:void(0);', // 忘记密码链接入口
        isMaxHeight: false, // 样式控制 - 若验证码通过，或者未输入情况下，自动登录跟其间距只需要8px;
        loginChecked: false // 登录(账号密码登录)——默认未选中
      };
    },
    watch: {
      'ruleForm.password': function () {
        this.autoLoginSetMargin();
      }
    },
    methods: {
      // 切换至注册面板
      handleToReg() {
        this.$emit('handleLink', 'reg');
      },
      handleFocus(key) {
        this[key] = true;
      },
      handleBlur(key) {
        this[key] = false;
      },
      handleEye() {
        this.loginPwdShow = !this.loginPwdShow;
      },
      autoLoginSetMargin() {
        let passwordFlag = false;
        this.$refs.ruleForm.validateField('password', function (res) {
          passwordFlag = !res;
        });
        this.isMaxHeight = !passwordFlag;
      },
      // 密码登录
      async handlePwdLogin() {
        if (!this.loginChecked) {
          this.$message({
            message: this.$t('privacy.privacy_1005'),
            showClose: true,
            type: 'warning',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        if (this.captchaIsShow && !this.captchaReady) {
          // 开启了图片验证码展示，但是当前未选择图形码
          this.$message({
            message: this.$t('account.account_1028'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        } else if (this.captchaReady) {
          // 如果选择的图形码有值，表示触发了账号锁定，再次登录需要图片验证码逻辑。这个时候直接往下走。
          await this.sendLogin();
        } else {
          // 如果没有选择过图形码，走账号检测判断
          const valid = this.$refs.ruleForm.validate();
          if (!valid) return false;
          // this.$refs.ruleForm.validate(async valid => {
          //   // 表单验证通过，方才检验，减少多余的请求发送
          //   if (valid) {
          const failure = err => {
            console.log('获取账号检测接口结果错误', err);
            this.$message({
              message: this.$tec(err.code) || this.$t('login.login_1021'),
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          };
          this.userServer
            .loginCheck(this.ruleForm.account)
            .then(async res => {
              if (res.code == 200 && res.data?.check_result === 1) {
                this.captchaIsShow = true;
                // 账号被锁定 再次登录需要图片验证)
                // 默认图片验证码加载
                this.reloadCaptha();
              } else if (res.code == 200) {
                this.captchaIsShow = false;
                // 非异常情况下，触发登录逻辑
                this.sendLogin();
              } else {
                failure(res);
              }
            })
            .catch(err => {
              failure(err);
            });
          // }
          // });
        }
      },
      reloadCaptha() {
        if (this.captchaReady) {
          this.userServer.refreshNECaptha();
        } else {
          this.userServer.initNECaptcha('#pwdLoginCaptcha');
        }
      },
      // 触发login表单验证，若验证通过，执行登录
      async sendLogin() {
        const valid = await this.$refs.ruleForm.validate();
        if (!valid) return false;
        let relt = await this.userServer.handlePassword(this.ruleForm.password);
        if (!relt.pass) {
          this.$message({
            message: this.$t('register.register_1010'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        const params = {
          way: 1, // 账号密码登录
          account: this.ruleForm.account,
          password: relt.retPassword,
          remember: this.autoLoginStatus ? 1 : '',
          uuid: relt.uuid
        };
        if (this.captchaIsShow) {
          params.captcha = this.userServerState.captchaVal;
          params.validate_type = 1; // 1=图片交互方式校验|2=点击交互校验，【账号密码方式登录并且账号被锁定情况下校验，默认是图片交互方式】
        }
        if (this.visitorId) {
          params.visitor_id = this.visitorId; // 游客id 登录方式为账号密码或者手机号验证码方式，如果传入游客ID会将访客和登录账户进行绑定
        }
        const res = await this.userServer.userLogin(params).then();
        if (res.code === 200) {
          this.$emit('handleClose', 'code');
          // 刷新页面
          window.location.reload();
        } else {
          if (this.captchaIsShow && !this.captchaReady) {
            this.reloadCaptha();
          }
          this.$message({
            message: this.$tec(res.code) || this.$t('login.login_1021'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        }
      },
      /* 隐私合规选择结果标记 */
      checkResult(obj) {
        this[`${obj.scene}Checked`] = obj.checked;
      }
    },
    created() {
      const { href } = this.$router.resolve({ path: '/forgetPwd' });
      this.forgetUrl = href;
    }
  };
</script>
<style lang="less">
  @import url('../styles/reset.less');
  .vmp-pwd-login {
    padding: 0 29px 24px;
    .common_mg3 {
      margin-right: 3px;
      margin-left: 3px;
    }
  }
</style>
