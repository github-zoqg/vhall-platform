<template>
  <div class="vmp-code-login">
    <el-form
      ref="ruleForm"
      key="pwdLoginForm"
      :model="ruleForm"
      :rules="ruleFormRules"
      label-width="0"
      class="vmp-login__form__common"
    >
      <!-- 账户相关 -->
      <el-form-item prop="username">
        <el-input
          v-model.trim="ruleForm.username"
          clearable
          placeholder="请输入手机号/邮箱"
          @focus="loginErrMsg = ''"
        ></el-input>
      </el-form-item>
      <!-- 图片验证码 -->
      <el-form-item
        v-show="photoCpathaShow"
        :class="loginErrMsg != '' ? 'vhsaas-box__msg__error__bottom' : ''"
      >
        <div id="pwdLoginCaptcha" class="vhsaas-yundun-captcha"></div>
        <!-- TODO 可能注释掉 -->
        <span v-if="loginErrMsg != ''" class="vhsaas-form-error">{{ loginErrMsg }}</span>
      </el-form-item>
      <!-- 请输入登录密码 -->
      <el-form-item class="vhsaas-box__pwd" prop="password">
        <pwd-input
          v-model.trim="ruleForm.password"
          clearable
          :placeholder="!isLoginPwdFocus ? '请输入登录密码' : ''"
          :maxlength="30"
          auto-complete="off"
          onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
          style="ime-mode: disabled"
          :isPasswordVisible="!loginPwdShow"
          @focus="handleFocus('isLoginPwdFocus')"
          @blur="handleBlur('isLoginPwdFocus')"
        >
          <span slot="suffix" class="closePwd" @click="loginPwdType">
            <i
              v-show="loginPwdShow"
              slot="suffix"
              style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
              class="iconfont iconyincang_icon"
            ></i>
            <i
              v-show="!loginPwdShow"
              slot="suffix"
              style="display: inline-block; font-size: 12px; margin-right: 5px; cursor: pointer"
              class="iconfont iconxianshi_icon"
            ></i>
          </span>
        </pwd-input>
      </el-form-item>
      <!-- 其它 -->
      <el-form-item>
        <div
          :class="[
            'vhsaas-box__link',
            { 'vhsaas-box__link__error': mailError, 'vhsaas-box__msg__error': photoCpathaShow }
          ]"
        >
          <el-checkbox v-model="accountChecked" class="vhsaas-box-checkbox"></el-checkbox>
          <span
            class="vhsaas-box__auto vhsaas-box__checked"
            @click="accountChecked = !accountChecked"
          >
            自动登录
          </span>
          <span class="vhsaas-box__auto vhsaas-box__forget">
            <a :href="forgetUrl" target="_blank">忘记密码</a>
          </span>
        </div>
        <el-button class="vhsaas-red-button length-max vhsaas-login-btn" @click="checkLoginAccount">
          自动登录
        </el-button>
        <a
          href="javascript:void(0)"
          :class="['vhsaas-reg__link', { 'vhsaas-default': !photoCpathaShow }]"
          v-if="options.showToReg == 1"
          @click="handleToReg"
        >
          立即注册
        </a>
      </el-form-item>
      <!-- 第三方登录 -->
      <third-login-link v-if="options.showThirdLogin"></third-login-link>
    </el-form>
  </div>
</template>
<script>
  import PwdInput from './pwd-input.vue';
  import ThirdLoginLink from './third-login-link.vue';
  export default {
    name: 'VmpPwdLogin',
    components: {
      PwdInput,
      ThirdLoginLink
    },
    props: {
      showToReg: {
        required: true,
        default() {
          /* showToReg取值范围
             0 -- 不开启注册快捷入口；
             1 -- 开启注册快捷入口。
          */
          return 0;
        }
      },
      showThirdLogin: {
        required: true,
        default() {
          /* showThirdLogin 取值范围
             0 -- 不开启第三方登录功能；
             1 -- 开启第三方登录功能。
          */
          return 0;
        }
      }
    },
    data() {
      const validAccount = (rule, value, callback) => {
        this.accError = value === '';
        if (value === '') {
          callback(new Error('请输入手机号/邮箱'));
        } else {
          callback();
        }
      };
      const validPwd = (rule, value, callback) => {
        const pattern = /^([0-9a-zA-Z_`!~@#$%^*+=,.?;'":)(}{/\\|<>&[-]|]){6,30}$/;
        this.mailError = value === '' || !pattern.exec(value);
        if (value === '') {
          callback(new Error('请输入登录密码'));
        } else if (!pattern.exec(value)) {
          callback(new Error('账号密码错误'));
        } else {
          callback();
        }
      };
      return {
        isMobile: false, // 是否是手机端展示(true - 手机端；false - PC浏览器)
        options: {},
        cap: null, // 云盾本身
        key: 'b7982ef659d64141b7120a6af27e19a0', // 云盾key
        ruleForm: {
          username: '', // 密码登录时，表示账号
          password: '' // 密码
        },
        ruleFormRules: {
          username: [{ required: true, validator: validAccount, trigger: 'blur' }],
          password: [{ required: true, validator: validPwd, trigger: 'blur' }]
        }
      };
    },
    methods: {
      // 切换至注册面板
      handleToReg() {
        this.$emit('handleLink', 'reg');
      },
      // 调起图片验证码
      callCaptcha(element, success, failure) {
        window.initNECaptcha({
          captchaId: this.key,
          element: element,
          mode: 'float',
          width: 270,
          // TODO 网易易顿多语言字段 lang
          onReady(instance) {
            console.log('instance', instance);
          },
          onVerify(err, data) {
            console.log(err);
            success(err, data);
          },
          onload(instance) {
            console.log('load...', instance);
            failure(instance);
          }
        });
      },
      initData(params = {}) {
        // 组件加载初始化默认数据
        this.isMobile =
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|wOSBrowser|BrowserNG|WebOS)/i.test(
            navigator.userAgent
          );
        this.options = {
          ...{
            showToReg: this.showToReg,
            showThirdLogin: this.showThirdLogin
          },
          ...params
        };
        console.log('验证码登录', this.options);
        // 默认图片验证码加载
        this.callCaptcha(
          '#pwdLoginCaptcha',
          function (err, data) {
            if (data) {
              this.phoneKey = data.validate;
            } else {
              console.log('#pwdLoginCaptcha --- call-success图片验证码', err);
            }
          },
          function (err) {
            console.log('#pwdLoginCaptcha --- call-failure图片验证码', err);
          }
        );
      },
      handleSetAutoStatus() {
        this.accountChecked = !this.accountChecked;
      },
      handleCodeLogin() {}
    },
    created() {
      this.initData();
    }
  };
</script>
<style lang="less" scoped>
  @import url('../less/reset.less');
  .vmp-code-login {
    padding: 0 32px;
  }
</style>
