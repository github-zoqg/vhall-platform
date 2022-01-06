<template>
  <div class="vmp-register">
    <el-form
      key="regForm"
      ref="regForm"
      :model="regForm"
      :rules="regFormRules"
      label-width="0"
      class="vmp-login__form__common"
    >
      <!-- 手机号
      <el-form-item
        prop="phone"
        :class="['vhsaas-box__phone', { 'vhsaas-box__msg__error': regPhoneFlag }]"
      >
        <el-input
          v-model.trim="regForm.phone"
          placeholder="请输入手机号"
          :maxlength="11"
          clearable
          auto-complete="off"
        ></el-input>
      </el-form-item> -->
      <!-- 验证码
      <el-form-item id="captcha-box">
        <div id="regCaptcha" class="vhsaas-yundun-captcha"></div>
      </el-form-item> -->
      <!-- 短信密码
      <el-form-item
        prop="code"
        :class="['vhsaas-wrap-code', { 'vhsaas-box__msg__error': captchaError || smsRegErrMsg }]"
      >
        <el-input
          v-model.trim="regForm.code"
          clearable
          type="captcha"
          :maxlength="6"
          placeholder="动态验证码"
        ></el-input>
        <span
          type="danger"
          :disabled="regBtnControl == 'disabled'"
          :class="['vhsaas-code-btn show-border', regBtnControl]"
          @click.stop.prevent="getRegCaptha"
        >
          获取验证码
        </span>
      </el-form-item> -->
      <!-- 注册密码 -->
      <el-form-item :class="['vhsaas-box__pwd', 'vhsaas-box__msg__error']" prop="password">
        <pwd-input
          v-model.trim="regForm.password"
          clearable
          :placeholder="!isPasswordFocus ? '设置密码（选填，6-30个字符）' : ''"
          :maxlength="30"
          auto-complete="off"
          onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
          style="ime-mode: disabled"
          :isPasswordVisible="!regPwdShow"
          @focus="handleFocus('isPasswordFocus')"
          @blur="handleBlur('isPasswordFocus')"
        >
          <span slot="suffix" class="closePwd" @click="passWordType">
            <i
              v-show="regPwdShow"
              slot="suffix"
              style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
              class="iconfont iconyincang_icon"
            ></i>
            <i
              v-show="!regPwdShow"
              slot="suffix"
              style="display: inline-block; font-size: 12px; margin-right: 5px; cursor: pointer"
              class="iconfont iconxianshi_icon"
            ></i>
          </span>
        </pwd-input>
        <a href="javascript:void(0)" class="vhsaas-reg__login" @click="handleToLogin">登录</a>
      </el-form-item>
      <!--  <div :class="['login-btn', { 'vhsaas-box__msg__error': mailError }]">
        <el-button
          class="vhsaas-red-button length-max vhsaas-reg-btn"
          round
          @click="registerHandler"
        >
          立即注册
        </el-button>
      </div> -->
      <!--  <el-form-item class="auto-login register-checked">
        <el-checkbox v-model="checked">
          我已阅读并同意
          <a
            href="https://t.e.vhall.com/home/vhallapi/serviceterms"
            target="_blank"
            style="color: #3562fa"
            rel="noopener noreferrer"
          >
            服务条款及隐私协议
          </a>
        </el-checkbox>
      </el-form-item> -->
    </el-form>
  </div>
</template>
<script>
  import PwdInput from './pwd-input.vue';
  export default {
    name: 'VmpRegister',
    components: {
      PwdInput
    },
    data() {
      const validateRegPhone = async (rule, value, callback) => {
        this.regPhoneFlag = value === '' || !/^1[0-9]{10}$/.test(value);
        if (value === '') {
          this.regBtnControl = 'disabled'; // 验证失败，禁用
          this.isShowRegPhoneErr = true;
          callback(new Error('请输入手机号'));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            this.regBtnControl = 'disabled'; // 验证失败，禁用
            this.isShowRegPhoneErr = true;
            callback(new Error('请输入正确的手机号'));
          } else {
            /* try {
              const result = await this.$vhallapi.nav.loginCheck({
                account: this.regForm.phone,
                channel: 'C'
              });
              if (result && result.code === 200) {
                // 检测结果：check_result 0账号未锁定 1账号锁定; account_exist 账号是否存在：1存在 0不存在
                if (result.data.account_exist > 0) {
                  this.regPhoneFlag = true;
                  this.regBtnControl = 'disabled';
                  this.isShowRegPhoneErr = true;
                  callback(new Error('请输入正确的手机号'));
                } else {
                  this.isShowRegPhoneErr = false;
                  if (this.phoneKey) {
                    this.regPhoneFlag = false;
                    this.regBtnControl = 'start'; // 验证成功，启用
                  } else {
                    this.regPhoneFlag = true;
                    this.regBtnControl = 'disabled';
                  }
                  callback();
                }
              }
            } catch (e) {
              console.log(e);
              callback();
            } */
            callback();
          }
        }
      };
      const validateCaptchas = (rule, value, callback) => {
        this.captchaError = value === '';
        if (value === '') {
          callback(new Error('请输入动态验证码'));
        } else {
          callback();
        }
      };
      const validRegPwd = (rule, value, callback) => {
        const pattern = /^([0-9a-zA-Z_`!~@#$%^*+=,.?;'":)(}{/\\|<>&[-]|]){6,30}$/;
        // const pattern = /^(\w){6,30}$/
        if (value === '') {
          // callback(new Error('请设置登录密码'))
          callback(); // 允许为空
        } else if (!pattern.exec(value)) {
          // callback(new Error('6-30位不包含空格及特殊符号的密码！'))
          callback(new Error('请设置登录密码（6-30位字符）'));
        } else {
          callback();
        }
      };
      return {
        regPwdShow: true, // 注册 - 密码框的显示
        regForm: {
          agree: 1,
          phone: '',
          code: '',
          password: ''
        },
        regFormRules: {
          phone: [{ validator: validateRegPhone, trigger: 'blur' }],
          code: [{ required: true, validator: validateCaptchas, trigger: 'blur' }],
          password: [{ required: false, validator: validRegPwd, trigger: 'blur' }]
        }
      };
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
      show() {
        alert(1);
      }
    }
  };
</script>
<style lang="less" scoped>
  @import url('../less/reset.less');
  .vmp-register {
    padding: 0 32px;
  }
</style>
