<template>
  <div class="forget-password">
    <!-- 头部区域 -->
    <header class="commen-header home-header">
      <nav :class="['navbar nav-top all']" role="navigation">
        <div class="navbar-header">
          <a class="navbar-brand" :href="logo_jump_url" target="_blank">
            <img src="./images/logo@2x.png" alt="" />
          </a>
        </div>
      </nav>
    </header>
    <div class="section__main">
      <!-- 页面标题区域 -->
      <div class="titleBox">
        <span class="pageTitle">{{ $t('login.login_1033') }}</span>
      </div>
      <!-- 主体内容区域 -->
      <div class="forget__layout">
        <el-steps :active="findStep" class="forget__step" align-center>
          <el-step :title="$t('login.login_1034')">
            <img
              v-if="findStep === 1"
              slot="icon"
              src="./images/step_doing.png"
              class="step__default active"
              alt=""
            />
            <img
              v-else-if="findStep <= 4 && findStep > 1"
              slot="icon"
              src="./images/step_done.png"
              class="step__default active"
              alt=""
            />
            <img v-else slot="icon" src="./images/step_default.png" class="step__default" alt="" />
          </el-step>
          <el-step :title="$t('login.login_1035')">
            <img
              v-if="findStep === 2"
              slot="icon"
              src="./images/step_doing.png"
              class="step__default active"
              alt=""
            />
            <img
              v-else-if="findStep <= 4 && findStep > 2"
              slot="icon"
              src="./images/step_done.png"
              class="step__default active"
              alt=""
            />
            <img v-else slot="icon" src="./images/step_default.png" class="step__default" alt="" />
          </el-step>
          <el-step :title="$t('login.login_1036')">
            <img
              v-if="findStep === 3"
              slot="icon"
              src="./images/step_doing.png"
              class="step__default active"
              alt=""
            />
            <img
              v-else-if="findStep <= 4 && findStep > 3"
              slot="icon"
              src="./images/step_done.png"
              class="step__default active"
              alt=""
            />
            <img v-else slot="icon" src="./images/step_default.png" class="step__default" alt="" />
          </el-step>
          <el-step :title="$t('login.login_1037')">
            <img
              v-if="findStep === 4"
              slot="icon"
              src="./images/step_doing.png"
              class="step__default active"
              alt=""
            />
            <img v-else slot="icon" src="./images/step_default.png" class="step__default" alt="" />
          </el-step>
        </el-steps>
        <!-- 第一步 -->
        <div v-if="findStep === 1" class="step-1">
          <div class="step-ways">
            <div class="step-phone" @click="findPassword('phone')">
              <div class="phone">
                <i class="icon-step-phone"></i>
                {{ $t('login.login_1038') }}
              </div>
              <p class="text">{{ $t('login.login_1039') }}</p>
            </div>
            <div class="step-email" @click="findPassword('email')">
              <div class="phone">
                <i class="icon-step-email"></i>
                {{ $t('login.login_1040') }}
              </div>
              <p class="text">{{ $t('login.login_1041') }}</p>
            </div>
          </div>
          <!-- <div class="care_div">
            <span class="step__warning"></span><span>注意：子账号找回密码请直接联系父账号所有者</span>
          </div> -->
        </div>
        <!-- 第二步 -->
        <div v-if="findStep === 2" class="step-2">
          <div v-if="isType === 'phone'" class="find-phone">
            <p class="find-text">
              {{ $t('login.login_1042') }}
              <span @click="findPassword('email', 1)">{{ $t('login.login_1043') }}</span>
            </p>
            <el-form ref="checkDynamicForm" :model="dynamicForm" :rules="loginRules">
              <el-form-item prop="phone">
                <el-input
                  v-model.trim="dynamicForm.phone"
                  :placeholder="$t('login.login_1044')"
                  :maxlength="11"
                  auto-complete="off"
                ></el-input>
              </el-form-item>
              <el-form-item id="captcha-box">
                <NECaptcha ref="NECaptcha" v-model="dynamicForm.text" />
              </el-form-item>
              <el-form-item prop="code">
                <div class="code">
                  <el-input
                    v-model.trim="dynamicForm.code"
                    :placeholder="$t('login.login_1045')"
                    clearable
                    :maxlength="6"
                    auto-complete="off"
                  >
                    <template slot="append">
                      <span
                        :class="dynamicForm.text && isFindCode ? 'isLoginActive' : ''"
                        @click="time == 60 && dynamicForm.phone && getDyCode()"
                      >
                        {{
                          time == 60
                            ? $t('login.login_1046')
                            : $t('account.account_1031', { n: time })
                        }}
                      </span>
                    </template>
                  </el-input>
                </div>
              </el-form-item>
              <div class="login-btn">
                <el-button
                  type="primary"
                  class="vhsaas-red-button length-152 vhsaas-reg-btn"
                  round
                  @click.stop="sureFindPassword()"
                >
                  {{ $t('login.login_1054') }}
                </el-button>
              </div>
            </el-form>
          </div>
          <div v-if="isType === 'email'" class="find-phone">
            <p class="find-text">
              {{ $t('login.login_1047') }}
              <span @click="findPassword('phone', 1)">{{ $t('login.login_1048') }}</span>
            </p>
            <el-form ref="checkDynamicForm" :model="dynamicForm" :rules="loginRules">
              <el-form-item prop="email">
                <el-input
                  v-model.trim="dynamicForm.email"
                  :placeholder="$t('login.login_1049')"
                  auto-complete="off"
                  :maxlength="30"
                >
                  <template slot="append">
                    <span
                      :class="isFindCode ? 'isLoginActive' : ''"
                      @click="time == 60 && getDyCode()"
                    >
                      {{
                        time == 60
                          ? $t('login.login_1046')
                          : $t('account.account_1031', { n: time })
                      }}
                    </span>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="code">
                <el-input
                  v-model.trim="dynamicForm.code"
                  :placeholder="$t('login.login_1050')"
                  auto-complete="off"
                  :maxlength="6"
                ></el-input>
              </el-form-item>
              <div class="login-btn">
                <el-button
                  type="primary"
                  class="vhsaas-red-button length-152 vhsaas-reg-btn"
                  round
                  @click="sureFindPassword"
                >
                  {{ $t('login.login_1051') }}
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
        <!-- 第三步 -->
        <div v-if="findStep === 3" class="step-3">
          <el-form ref="resetPassword" :model="dynamicForm" :rules="loginRules">
            <el-form-item prop="password">
              <pwd-input
                v-model.trim="dynamicForm.password"
                :placeholder="$t('login.login_1052')"
                :maxlength="30"
                type="password"
                auto-complete="off"
              ></pwd-input>
            </el-form-item>
            <el-form-item prop="checkPassword">
              <pwd-input
                v-model.trim="dynamicForm.checkPassword"
                :placeholder="$t('login.login_1053')"
                type="password"
                :maxlength="30"
                auto-complete="off"
              ></pwd-input>
            </el-form-item>
            <div class="login-btn">
              <el-button
                type="primary"
                class="vhsaas-red-button length-152 vhsaas-reg-btn"
                round
                @click="resetPassword()"
              >
                {{ $t('login.login_1054') }}
              </el-button>
            </div>
          </el-form>
        </div>
        <!-- 第四步 -->
        <div v-if="findStep === 4" class="step-4">
          <i class="icon-set-success"></i>
          <h3>{{ $t('login.login_1055') }}</h3>
          <!--  <p><strong>{{linkTime}}秒</strong>后跳转登录页面</p> -->
        </div>
      </div>
    </div>
    <!-- 底部区域 -->
  </div>
</template>
<script>
  import PwdInput from './components/pwd-input';
  import NECaptcha from './components/NECaptcha';
  import { useUserServer } from 'middle-domain';
  export default {
    components: {
      PwdInput,
      NECaptcha
    },
    data() {
      const validatePhone = (rule, value, callback) => {
        this.isFindCode = false;
        if (value === '') {
          callback(new Error(this.$t('login.login_1044')));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            callback(new Error(this.$t('login.login_1056')));
          } else {
            this.isFindCode = true;
            callback();
          }
        }
      };
      const validateEmail = (rule, value, callback) => {
        if (value === '') {
          this.isFindCode = false;
          callback(new Error(this.$t('login.login_1049')));
        } else {
          // eslint-disable-next-line no-useless-escape
          if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value)) {
            this.isFindCode = false;
            callback(new Error(this.$t('login.login_1057')));
          } else {
            this.isFindCode = true;
            callback();
          }
        }
      };
      const validateCheckPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('login.login_1052')));
        } else if (value !== this.dynamicForm.password) {
          callback(new Error(this.$t('login.login_1025')));
        } else {
          callback();
        }
      };
      return {
        linkTime: 5,
        findStep: 1,
        time: 60,
        isType: 'phone',
        codeKey: 0,
        isFindCode: false,
        dynamicForm: { phone: '', password: '', text: null, checkPassword: '', code: '' },
        loginRules: {
          phone: [{ validator: validatePhone, trigger: 'blur' }],
          email: [{ validator: validateEmail, trigger: 'blur' }],
          password: [
            { required: true, message: this.$t('appointment.appointment_1022'), trigger: 'blur' }
          ],
          code: [{ required: true, message: this.$t('form.form_1020'), trigger: 'blur' }],
          checkPassword: [{ validator: validateCheckPass, trigger: 'blur' }]
        },
        useUserServer: null
      };
    },
    created() {
      this.useUserServer = useUserServer();
      this.logo_jump_url = window.location.protocol + '//www.vhall.com';
    },
    mounted() {
      this.$i18n.locale = 'zh';
    },
    methods: {
      // filterLang() {
      //   let langType = localStorage.getItem('lang');
      //   if (langType) {
      //     return langType == 1 ? 'zh' : 'en';
      //   } else {
      //     return 'zh';
      //   }
      // },
      findPassword(type, index) {
        this.isType = type;
        this.findStep = 2;
        this.isFindCode = false;
        if (index) {
          this.$refs.checkDynamicForm.resetFields();
        }
      },
      // 第二步获取短信验证码
      getDyCode() {
        const failure = res => {
          this.$message({
            message: this.$tec(res.code) || res.msg,
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          this.$refs.NECaptcha?.refreshNECaptha();
        };
        if (this.isType === 'phone') {
          if (this.checkMobile()) {
            if (!this.dynamicForm.text) {
              this.$message({
                message: this.$t('login.login_1059'),
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
              return;
            }
            this.useUserServer
              .sendPhoneCode({
                type: this.isType === 'phone' ? 1 : 2,
                data: this.isType === 'phone' ? this.dynamicForm.phone : this.dynamicForm.email,
                validate: this.dynamicForm.text,
                scene_id: this.isType === 'phone' ? 5 : 4
              })
              .then(res => {
                if (res && res.code == 200) {
                  this.countDown();
                } else {
                  failure(res);
                }
              })
              .catch(res => {
                failure(res);
              });
          }
        } else if (this.isType === 'email') {
          if (this.checkEmail()) {
            this.useUserServer
              .sendPhoneCode({
                type: this.isType === 'phone' ? 1 : 2,
                data: this.isType === 'phone' ? this.dynamicForm.phone : this.dynamicForm.email,
                validate: this.dynamicForm.text,
                scene_id: this.isType === 'phone' ? 5 : 4
              })
              .then(res => {
                if (res && res.code == 200) {
                  this.countDown();
                } else {
                  failure(res);
                }
              })
              .catch(res => {
                failure(res);
              });
          }
        }
      },
      // 第二步确定 检测短信验证码
      sureFindPassword() {
        this.$refs.checkDynamicForm.validate(valid => {
          if (valid) {
            const params = {
              type: this.isType === 'phone' ? 1 : 2,
              data: this.isType === 'phone' ? this.dynamicForm.phone : this.dynamicForm.email,
              code: this.dynamicForm.code,
              scene_id: this.isType === 'phone' ? 5 : 4
            };
            this.useUserServer
              .codeCheck(params)
              .then(res => {
                if (res && res.code == 200 && res.data) {
                  this.codeKey = res.data.key;
                  this.findStep = 3;
                } else {
                  this.$message({
                    message: this.$tec(res.code) || res.msg,
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                this.$message({
                  message: this.$tec(res.code) || res.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      // 第三步重置密码
      resetPassword() {
        console.log(this.dynamicForm.checkPassword, this.dynamicForm.password);
        this.$refs.resetPassword.validate(valid => {
          if (valid) {
            const params = {
              old_password: '',
              password: this.dynamicForm.password,
              confirm_password: this.dynamicForm.checkPassword,
              scene_id: this.isType === 'phone' ? 5 : 4,
              key: this.codeKey
            };
            this.useUserServer
              .resetPassword(params)
              .then(res => {
                if (res && res.code == 200) {
                  this.findStep = 4;
                  const that = this;
                  const linkTimer = setInterval(() => {
                    that.linkTime--;
                    if (that.linkTime === 1) {
                      window.clearInterval(linkTimer);
                      // that.$router.push({ path: '/' })
                      /* if (this.$VhallStorage.get('goHref', 'local')) {
                    window.location.href = this.$VhallStorage.get('goHref')
                  } */
                      window.location.reload();
                      that.linkTime = 5;
                    }
                  }, 1000);
                } else {
                  this.$message({
                    message: this.$tec(res.code) || res.msg,
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                this.$message({
                  message: this.$tec(res.code) || res.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      /**
       * 倒计时函数
       */
      countDown() {
        if (this.time) {
          this.time--;
          setTimeout(() => {
            this.countDown();
          }, 1000);
        } else {
          this.time = 60;
        }
      },
      /**
       * 校验手机号
       */
      checkMobile() {
        return /^1[0-9]{10}$/.test(this.dynamicForm.phone);
      },
      checkEmail() {
        // eslint-disable-next-line no-useless-escape
        return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(
          this.dynamicForm.email
        );
      }
    }
  };
</script>

<style lang="less" scoped>
  .length-152 {
    width: 152px;
    height: 40px;
    border-radius: 20px;
  }
  button.el-button.vhsaas-red-button {
    background: #fb3a32;
    color: #ffffff;
    border: 1px solid #fb3a32;
    &:hover {
      color: #fff;
      background: #fc615b;
      border: 1px solid #fc615b;
    }
    &:focus {
      color: #fff;
      background: #fb3a32;
      border: 1px solid #fb3a32;
    }
    &:active {
      background: #e2332c;
      border: 1px solid #e2332c;
    }
    &.is-disabled {
      background: #f09d99;
      border: 1px solid #f09d99;
      cursor: not-allowed;
      color: #fff;
      &:hover,
      &:focus,
      &:active {
        background: #f09d99;
        border: 1px solid #f09d99;
      }
    }
  }
  /deep/.el-step__head.is-finish {
    color: #fb3a32;
    border-color: #fb3a32;
  }

  header.commen-header {
    margin-bottom: 0;
    height: 64px;
    background-color: #ffffff;
    .nav-top {
      height: 64px;
      margin: 0 auto;
      width: 1300px;
      border: none;
      &.all {
        width: 100%;
        // padding-right: 32px;
      }
    }
    .navbar {
      display: flex;
      flex: 1;
      margin-bottom: 20px;
    }
    .navbar-header {
      width: 224px;
      height: 64px;
      background: #fb3a32;
      float: left;
      .navbar-brand {
        float: left;
        margin: 10px 32px;
        text-align: left;
        width: 120px !important;
        height: 44px;
        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
    }
  }
  @media (min-width: 768px) {
    .navbar {
      border-radius: 4px;
    }
  }
  .titleBox {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    .pageTitle {
      font-size: 24px;
      font-weight: normal;
    }
  }

  .section__main {
    padding-top: 40px;
    width: 1020px;
    height: auto;
    margin: 0 auto;
    padding-bottom: 40px;
  }
  @media (min-width: 1920px) {
    .section__main {
      width: 1374px;
    }
  }
  .forget__layout {
    width: calc(100% - 510px);
    height: auto;
    background: #f5f5f5;
    border-radius: 4px;
    overflow: hidden;
    min-height: 601px;
    padding: 130px 255px 175px 255px;
  }
  .forget__step {
    .step__default {
      display: block;
      width: 14px;
      height: 14px;
      &.active {
        width: 24px;
        height: 24px;
      }
    }
    /deep/.el-step__icon.is-text {
      border: 0;
    }
    /deep/.el-step__line {
      background-color: #e2e2e2;
    }
    /deep/.el-step__title {
      &.is-process,
      &.is-finish,
      &.is-wait,
      &.is-error,
      &.is-success {
        font-size: 14px;
        font-weight: 400;
        color: #222222;
        line-height: 26px;
      }
    }
  }

  .step-1 {
    overflow: hidden;
    margin: 64px auto 0;
    .step-ways {
      display: flex;
      justify-content: space-around;
      .step-phone,
      .step-email {
        text-align: center;
        .phone {
          overflow: hidden;
          cursor: pointer;
          width: 203px;
          height: 63px;
          background: #ffffff;
          box-shadow: 0px 6px 12px 0px rgba(132, 132, 132, 0.16);
          border-radius: 4px;
          border: 1px solid #f5f5f5;
          line-height: 63px;
          font-size: 16px;
          font-weight: 400;
          color: #222222;
          i {
            display: inline-block;
          }
          .icon-step-phone {
            width: 19px;
            height: 28px;
            vertical-align: middle;
            margin-right: 21px;
            background: url('./images/step_phone.png') no-repeat;
            background-size: cover;
          }
          .icon-step-email {
            width: 28px;
            height: 22px;
            vertical-align: middle;
            margin-right: 11px;
            background: url('./images/step_mail.png') no-repeat;
            background-size: cover;
          }
        }
        .text {
          font-size: 12px;
          font-weight: 400;
          color: #999999;
          line-height: 17px;
          margin-top: 15px;
        }
      }
    }
    .care_div {
      font-size: 12px;
      font-weight: 400;
      color: #fb3a32;
      line-height: 17px;
      text-align: center;
      margin-top: 64px;
      .step__warning {
        display: inline-block;
        vertical-align: text-bottom;
        width: 19px;
        height: 17px;
        margin-right: 5px;
        background: url('./images/step_warning.png') no-repeat;
        background-size: cover;
      }
    }
  }

  .step-2 {
    text-align: center;
    width: 450px;
    margin: 50px auto;
    .find-text {
      font-size: 12px;
      font-weight: 400;
      color: #999999;
      line-height: 17px;
      margin-bottom: 10px;
      text-align: left;
      span {
        color: #4da1ff;
        margin-left: 5px;
        cursor: pointer;
      }
    }
    /deep/.el-form-item {
      margin-bottom: 32px;
      &:last-child {
        margin-bottom: 0;
      }
      /deep/.el-input__inner {
        height: 40px;
        line-height: 40px;
      }
    }
    /deep/.el-input-group__append {
      border: 0;
      position: absolute;
      bottom: 1px;
      right: 1px;
      cursor: pointer;
      span {
        border: 0;
        position: absolute;
        bottom: 0;
        right: 0;
        // width: 103px;
        padding: 10px 12px;
        line-height: 18px;
        text-align: center;
        background: #e8e8e8;
        border-radius: 2px;
        font-size: 12px;
        font-weight: 400;
        color: #222222;
        vertical-align: bottom;
        cursor: not-allowed;
        &.isLoginActive {
          background: #fb3a32;
          color: #ffffff;
          cursor: pointer;
          &:hover {
            color: #fff;
            background: #fc615b;
          }
          &:active {
            color: #ffffff;
            background: #e2332c;
          }
        }
        &.isSend {
          background: #e8e8e8;
          color: #666666;
        }
      }
    }
    .login-btn {
      text-align: center;
      margin-top: 50px;
    }
  }

  .step-3 {
    text-align: center;
    width: 450px;
    margin: 50px auto;
    /deep/.el-form-item {
      margin-bottom: 32px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .login-btn {
      text-align: center;
      margin-top: 50px;
    }
  }

  .step-4 {
    .icon-set-success {
      display: block;
      width: 40px;
      height: 40px;
      background: url('./images/step_result_success.png') no-repeat;
      background-size: cover;
      margin: 88px auto 23px auto;
    }
    h3 {
      text-align: center;
      font-size: 24px;
      font-weight: 400;
      color: #222222;
      line-height: 26px;
      margin-bottom: 10px;
    }
    p {
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      color: #222222;
      line-height: 20px;
      strong {
        color: #fb3a32;
      }
    }
  }
</style>
