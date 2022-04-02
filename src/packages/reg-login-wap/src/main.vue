<template>
  <van-popup
    v-model="popupVisible"
    lock-scroll
    round
    safe-area-inset-bottom
    close-on-click-overlay
    teleport="body"
  >
    <section class="vh-login-wap">
      <div v-show="showLoginCard" key="login">
        <header>
          <div class="login-menu">
            <p
              class="span one"
              :class="{ active: showMobileLogin }"
              @click="(showMobileLogin = !showMobileLogin), (errorMsgShow.mobile = false)"
            >
              {{ $t('login.login_1003') }}
              <span class="span line" v-show="showMobileLogin"></span>
            </p>
            <p
              class="span"
              :class="{ active: !showMobileLogin }"
              @click="(showMobileLogin = !showMobileLogin), (errorMsgShow.mobile = false)"
            >
              {{ $t('login.login_1004') }}
              <span class="span line" v-show="!showMobileLogin"></span>
            </p>
          </div>
        </header>
        <ul>
          <li :class="['mobile', { li_check_error: errorMsgShow.mobile }]">
            <div>
              <input
                @blur="checkPhoneNum"
                v-if="showMobileLogin"
                type="number"
                pattern="\d*"
                :placeholder="$t('account.account_1025')"
                v-model.trim="mobile"
                maxlength="11"
              />
              <input
                @blur="checkPhoneNum"
                v-else
                type="text"
                :placeholder="$t('login.login_1022')"
                v-model.trim="mobile"
                maxlength="100"
              />
            </div>
            <p :class="['error-tip', { error: errorMsgShow.mobile }]">
              {{ errorMsgShow.mobile ? errorMsgShow.mobileText : '' }}
            </p>
          </li>
          <!-- 图片滑动 -->
          <li v-show="showMobileLogin || showCaptcha" class="yiyun-vhall">
            <div id="loginCaptcha"></div>
          </li>
          <li :class="['sms', { li_check_error: errorMsgShow.smsCode }]" v-show="showMobileLogin">
            <div>
              <div>
                <input
                  type="number"
                  pattern="[0-9]*"
                  :placeholder="$t('form.form_1020')"
                  v-model.trim="smsCode"
                  oninput="if(value.length>6)value=value.slice(0,6)"
                  maxlength="6"
                />
              </div>
              <button :disabled="!captchaReady || isDownTime" @click="getSmsCode(false)">
                {{
                  isDownTime
                    ? $t('account.account_1031', { n: userServerState.second })
                    : $t('account.account_1030')
                }}
              </button>
            </div>
            <p :class="['error-tip', { error: errorMsgShow.smsCode }]">
              {{ errorMsgShow.smsCode ? $t('cash.cash_1039') : '' }}
            </p>
          </li>
          <li
            :class="['mobile', { li_check_error: errorMsgShow.password }]"
            v-show="!showMobileLogin"
          >
            <div>
              <input
                type="password"
                ref="inputPass"
                :placeholder="$t('account.account_1071')"
                v-model.trim="password"
              />
            </div>
            <p :class="['error-tip', { error: errorMsgShow.password }]">
              {{ errorMsgShow.password ? $t('login.login_1024') : '' }}
            </p>
          </li>
        </ul>
        <footer>
          <div>
            <button @click="loginFun" class="login vhsaas-red-button length-max vhsaas-login-btn">
              {{ $t('nav.nav_1005') }}
            </button>
          </div>
          <div class="registerNow">
            <button @click="showLoginCard = false" class="login">
              {{ $t('register.register_1005') }}
            </button>
          </div>
        </footer>
      </div>
      <!-- 注册 -->
      <div v-show="!showLoginCard" class="registered" key="register">
        <header>
          <p>
            <span class="active">{{ $t('register.register_1002') }}</span>
          </p>
        </header>
        <ul>
          <li :class="['mobile', { li_check_error: errorMsgShow.mobile }]">
            <div>
              <input
                type="tel"
                :placeholder="$t('account.account_1025')"
                v-model.trim="mobile"
                maxlength="11"
                @blur="checkPhoneNum"
              />
            </div>
            <p :class="['error-tip', { error: errorMsgShow.mobile }]">
              {{ errorMsgShow.mobile ? errorMsgShow.mobileText : '' }}
            </p>
          </li>
          <li class="yiyun-vhall">
            <div id="registerCaptcha"></div>
            <p :class="['error-tip', { error: errorMsgShow.mobileKey }]">
              {{ errorMsgShow.mobileKey ? $t('login.login_1023') : '' }}
            </p>
          </li>
          <li :class="['sms', { li_check_error: errorMsgShow.smsCode }]">
            <div>
              <div>
                <input
                  type="number"
                  pattern="[0-9]*"
                  oninput="if(value.length>6) value = value.slice(0,6)"
                  :placeholder="$t('form.form_1020')"
                  v-model.trim="smsCode"
                  maxlength="6"
                />
              </div>
              <button :disabled="!captchaReady || isDownTime" @click="getSmsCode(true)">
                {{
                  isDownTime
                    ? $t('account.account_1031', { n: userServerState.second })
                    : $t('account.account_1030')
                }}
              </button>
            </div>
            <p :class="['error-tip', { error: errorMsgShow.smsCode }]">
              {{ errorMsgShow.smsCode ? $t('cash.cash_1039') : '' }}
            </p>
          </li>
          <li :class="['mobile register', { li_check_error: errorMsgShow.mobileKey }]">
            <div>
              <input
                type="password"
                :placeholder="$t('register.register_1007')"
                v-model.trim="password"
              />
            </div>
            <p :class="['error-tip', { error: errorMsgShow.password }]">
              {{ errorMsgShow.password ? $t('login.login_1024') : '' }}
            </p>
            <span class="go-login" @click="showLoginCard = true">{{ $t('login.login_1026') }}</span>
          </li>
        </ul>
        <footer>
          <div>
            <button @click="register" class="login vhsaas-red-button length-max vhsaas-reg-btn">
              {{ $t('register.register_1013') }}
            </button>
          </div>
          <li class="switch">
            <div>
              <van-checkbox
                v-model="checked"
                checked-color="#FB3A32"
                shape="square"
                icon-size="14px"
              ></van-checkbox>
            </div>
            <span @click="checked = !checked">{{ $t('login.login_1030') }}</span>
            <a href="/home/vhallapi/serviceterms">{{ $t('login.login_1031') }}</a>
          </li>
          <p :class="['error-tip', { error: loginErrorMsg != '' }]">{{ loginErrorMsg }}</p>
        </footer>
      </div>
    </section>
  </van-popup>
</template>
<script>
  import { useUserServer } from 'middle-domain';
  export default {
    name: 'VmpRegLoginWap',
    data() {
      const userServerState = this.userServer.state; // 响应式注入
      return {
        userServerState,
        popupVisible: false, // 外框是否可见(弹出)
        actionType: 'code', // code 验证码登录, pwd密码登录, reg 注册
        showMobileLogin: true, // true - 手机登录  false - 账号密码登录
        showLoginCard: true, // true - 登录  false - 注册
        showCaptcha: false, // 专门用于 校验登录次数 接口返回 需要显示图形验证码时使用(密码登录可能关闭)
        checked: false,
        mobile: '', // 输入的手机号
        smsCode: '', // 输入的验证码
        password: '', // 输入的密码
        errorMsgShow: {
          // 控制错误显示与隐藏的字段
          mobile: false, // 手机号
          smsCode: false, // 验证码
          password: false, // 密码
          mobileText: '' // 手机号的错误提示
        },
        loginErrorMsg: ''
      };
    },
    computed: {
      captchaReady() {
        return !!this.userServerState.captchaVal;
      },
      isDownTime() {
        return this.userServerState.second >= 0;
      }
    },
    watch: {
      async showLoginCard() {
        this.loginErrorMsg = '';
        this.mobile = this.smsCode = this.password = this.checked = '';
        for (const key in this.errorMsgShow) {
          if (Object.prototype.hasOwnProperty.call(this.errorMsgShow, key)) {
            this.errorMsgShow[key] = false;
          }
        }
        await this.$nextTick();
        await this.initCaptcha();
      },
      // 跟新易盾的初始化
      async showMobileLogin() {
        await this.$nextTick();
        await this.initCaptcha();
      }
    },
    beforeCreate() {
      this.userServer = useUserServer();
    },
    methods: {
      // 打开弹窗
      async open() {
        this.popupVisible = true;
        await this.$nextTick();
        this.reloadCaptha();
      },
      reloadCaptha() {
        if (this.captchaReady) {
          this.userServer.refreshNECaptha();
        } else {
          this.initCaptcha();
        }
      },
      // 检查手机号
      async checkPhoneNum() {
        // showLoginCard 登录
        // showMobileLogin 手机号登录
        if (this.showLoginCard) {
          if (this.showMobileLogin) {
            this.checkMobile();
          } else {
            this.errorMsgShow.mobile = false;
          }
        } else {
          if (this.mobile.length == 11) {
            await this.userServer
              .loginCheck(this.mobile)
              .then(async res => {
                // 检测结果：check_result 0账号未锁定 1账号锁定; account_exist 账号是否存在：1存在 0不存在
                if (res.code == 200 && res.data && res.data.account_exist > 0) {
                  this.errorMsgShow.mobile = true;
                  this.errorMsgShow.mobileText = this.$t('register.register_1006');
                } else {
                  this.errorMsgShow.mobile = false;
                  this.errorMsgShow.mobileText = '';
                }
              })
              .catch(res => {
                this.$toast(this.$tec(res.code) || this.$t('login.login_1029'));
              });
          } else {
            this.errorMsgShow.mobile = true;
            this.errorMsgShow.mobileText = this.$t('account.account_1069');
          }
        }
      },
      /**
       * 校验手机号
       */
      checkMobile() {
        console.log('checkMobile');
        const valid = /^1[0-9]{10}$/.test(this.mobile);
        if (valid) {
          this.errorMsgShow.mobile = false;
        } else {
          this.errorMsgShow.mobile = true;
          this.errorMsgShow.mobileText = this.$t('account.account_1025');
        }
        return valid;
      },
      /**
       * 获取短信验证码(登录)
       */
      getSmsCode(isReg = false) {
        if (!this.checkMobile()) return false;
        if (!this.captchaReady) {
          this.errorMsgShow.mobileKey = true;
          return false;
        }
        const sceneId = isReg ? 8 : 7;
        this.userServer.sendCode(this.mobile, sceneId); // 相应与异常已在domain处理
      },
      /**
       * 登录函数，优先校验是手机登录还是账号登录，如果是账号登录先去调接口校验登录次数，再正常登录。如果是手机登录则正则校验完成可以正常登录
       * 账号登录不需要校验手机，只需校验是否为空即可，有可能用邮箱登录    showMobileLogin  为true  手机登录      false 账号登录
       */
      loginFun() {
        if (!this.checkMobile()) return false;
        if (this.showMobileLogin) {
          this.codeLogin();
        } else {
          this.pwdLogin();
        }
      },
      /**
       * @description 验证码登录
       */
      async codeLogin() {
        const params = {
          way: 2, // 手机号验证码登录
          phone: this.mobile,
          dynamic_code: this.smsCode // 动态密码【快捷登录（短信验证码登录）必传】
        };
        this.userServer.userLogin(params).then(res => {
          if (res.code === 200) {
            // 刷新页面
            window.location.reload();
          } else {
            this.$toast(this.$tec(res.code) || this.$t('login.login_1021'));
          }
        });
      },
      /**
       * @description 验证码登录
       */
      async pwdLogin() {
        const snedLogin = async () => {
          let relt = await this.userServer.handlePassword(this.password);
          if (!relt.pass) {
            this.$toast(this.$tec(relt.code) || this.$t('register.register_1010'));
            return false;
          }
          const params = {
            way: 1, // 账号密码登录
            account: this.mobile,
            password: relt.retPassword,
            uuid: relt.uuid
          };
          if (this.showCaptcha) {
            params.captcha = this.userServerState.captchaVal;
            // TODO: zhike有可能是 2 需要看v4对接的情况
            params.validate_type = 1; // 1=图片交互方式校验|2=点击交互校验，【账号密码方式登录并且账号被锁定情况下校验，默认是图片交互方式】
          }
          this.userServer.userLogin(params).then(res => {
            if (res.code === 200) {
              // 刷新页面
              window.location.reload();
            } else {
              if (this.showCaptcha && !this.captchaReady) {
                this.reloadCaptha();
              }
              this.$toast(this.$tec(res.code) || this.$t('login.login_1021'));
            }
          });
        };
        if (this.showCaptcha && !this.captchaReady) {
          this.$toast(this.$t('account.account_1028'));
          // 开启了图片验证码展示，但是当前未选择图形码
        } else if (this.captchaReady) {
          // 如果选择的图形码有值，表示触发了账号锁定，再次登录需要图片验证码逻辑。这个时候直接往下走。
          await snedLogin();
        } else {
          // 如果没有选择过图形码，走账号检测判断
          const failure = err => {
            console.log('获取账号检测接口结果错误', err);
            this.$toast(this.$tec(err.code) || this.$t('login.login_1021'));
          };
          this.userServer
            .loginCheck(this.mobile)
            .then(async res => {
              if (res.code == 200 && res.data?.check_result === 1) {
                this.showCaptcha = true;
                // 账号被锁定 再次登录需要图片验证)
                // 默认图片验证码加载
                this.reloadCaptha();
              } else if (res.code == 200) {
                this.showCaptcha = false;
                // 非异常情况下，触发登录逻辑
                await snedLogin();
              } else {
                failure(res);
              }
            })
            .catch(err => {
              failure(err);
            });
        }
      },
      /**
       * 注册
       */
      async register() {
        // 勾选协议
        if (!this.checked) return this.$toast(this.$t('register.register_1012'));
        if (!this.captchaReady) return (this.errorMsgShow.mobileKey = true);
        if (!this.checkPassWord()) return (this.errorMsgShow.password = true);
        if (this.checkMobile()) {
          const failure = err => {
            this.$toast(this.$tec(err.code) || this.$t('register.register_1010'));
          };
          const relt = await this.userServer.handlePassword(this.password);
          if (!relt.pass) {
            return this.$toast(this.$tec(relt.code) || this.$t('register.register_1010'));
          }
          const params = {
            source: 2,
            way: 2, // （默认2）1=账号密码注册|2=手机号验证码注册
            phone: this.mobile,
            code: this.smsCode,
            password: relt.retPassword,
            uuid: relt.uuid,
            agree: 1
          };
          this.userServer
            .register(params)
            .then(res => {
              if (res.code == 200) {
                this.$toast(this.$t('register.register_1009'));
                this.showLoginCard = true;
              } else {
                failure(res);
              }
            })
            .catch(err => {
              failure(err);
            });
        }
      },
      /**
       * 初始化网易易盾图
       */
      initCaptcha() {
        const selector = this.showLoginCard ? '#loginCaptcha' : '#registerCaptcha';
        this.userServer.initNECaptcha(selector);
      },
      checkPassWord() {
        return /^([0-9a-zA-Z_`!~@#$%^*+=,.?;'":)(}{/\\|<>&[-]|]){6,30}$/.test(this.password);
      }
    }
  };
</script>
<style lang="less">
  .vh-login-wap {
    .yiyun-vhall {
      margin-bottom: 32px;
      .yidun_control,
      .yidun_slide_indicator,
      .yidun_tips {
        height: 80px !important;
        line-height: 80px !important;
        .yidun_tips__text {
          vertical-align: super;
          line-height: 76px;
        }
      }
      .yidun_slider__icon {
        margin-top: -8px !important;
      }
    }
  }
</style>
<style lang="less" scoped>
  .vh-login-wap {
    width: 670px;
    background: #ffffff;
    border-radius: 32px;
    padding: 80px 64px;
  }
  .length-max {
    width: 100%;
    height: 80px;
    border-radius: 40px;
  }
  button.vhsaas-red-button {
    background: #fb3a32;
    color: #ffffff;
    border: 1px solid #fb3a32;
    font-size: 28px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #ffffff;
    line-height: 40px;
    &:hover,
    &:focus,
    &:active {
      background: #fb3a32;
      border: 1px solid #fb3a32;
    }
    &::before {
      background-color: transparent;
      color: #ffffff;
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
    .van-button__text {
      color: #ffffff;
    }
  }
  header {
    .login-menu {
      padding-bottom: 11px;
      display: flex;
      .span .line {
        position: absolute;
        bottom: -4px;
        display: block;
        width: 40px;
        height: 5px;
        background: #fb2626;
        border-radius: 3px;
        left: 50%;
        transform: translate(-50%);
        margin-right: 0;
      }
    }
    .span {
      position: relative;
      font-size: 32px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #262626;
      line-height: 45px;
      margin-right: 32px;
      &.active {
        height: 45px;
        font-size: 32px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #fb2626;
        line-height: 45px;
      }
    }
  }
  .registered {
    header {
      p {
        padding-bottom: 0;
      }
      span.active {
        font-size: 32px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #262626;
        line-height: 45px;
        margin-right: 32px;
      }
    }

    .mobile.li_check_error {
      > div::after {
        border-bottom: 1px solid #fb3a32;
      }
    }
  }
  ul {
    margin-top: 40px;
    .error-tip {
      height: 32px;
      &.error {
        height: 48px;
        font-size: 24px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #fb3a32;
        line-height: 33px;
        padding: 8px 0;
      }
    }
    .mobile {
      > div {
        width: 100%;
        height: 90px;
        border-radius: 8px;
        //  @include border-1px-direction("bottom", #979797);
        position: relative;
        border-width: 0;
        input {
          background-color: transparent;
          position: relative;
          z-index: 1;
        }
        &::after {
          content: ' ';
          width: 200%;
          height: 200%;
          position: absolute;
          top: 0;
          left: 0;
          border-bottom: 1px solid #979797;
          border-radius: unset;
          transform: scale(0.5);
          transform-origin: 0 0;
          box-sizing: border-box;
        }
        input {
          width: 100%;
          height: 100%;
          line-height: 45px;
        }
      }
      &.li_check_error {
        > div::after {
          border-bottom: 1px solid #fb3a32;
        }
      }
      &.register {
        position: relative;
        padding-bottom: 52px;
        .go-login {
          position: absolute;
          right: 0;
          top: 114px;
          font-size: 28px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #3562fa;
          line-height: 28px;
        }
      }
    }
    .sms {
      > div {
        display: flex;
        justify-content: space-between;
        > div {
          flex-grow: 1;
          position: relative;
          border-width: 0;
          input {
            background-color: transparent;
            position: relative;
            z-index: 1;
          }
          &::after {
            content: ' ';
            width: 200%;
            height: 200%;
            position: absolute;
            top: 0;
            left: 0;
            border-bottom: 1px solid #979797;
            border-radius: unset;
            transform: scale(0.5);
            transform-origin: 0 0;
            box-sizing: border-box;
          }
          input {
            width: 100%;
            height: 100%;
            line-height: 90px;
          }
        }
      }

      button {
        padding: 0;
        margin-left: 20px;
        background: #fb2626;
        border-radius: 4px;
        width: 206px;
        height: 68px;
        background: #fb2626;
        border-radius: 4px;
        font-size: 26px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #f5f5f5;
        line-height: 37px;
        &[disabled] {
          background: #f0f0f0;
          color: #262626;
        }
      }
    }
  }

  .registerNow {
    text-align: center;
    padding-top: 32px;
    button {
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #3562fa;
      line-height: 28px;
      background-color: transparent;
    }
  }

  .switch {
    padding-top: 14px;
    display: flex;
    align-items: center;
    font-size: 28px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #bfbfbf;
    line-height: 40px;
    .van-checkbox {
      margin-right: 12px;
    }
    a {
      color: #0a7ff5;
    }
  }

  .otherLogin {
    > p {
      text-align: center;
      font-size: 30px;
      font-family: PingFangSC;
      font-weight: 400;
      color: rgba(56, 56, 56, 1);
    }
    > div {
      text-align: center;
      padding-top: 30px;
      display: flex;
      justify-content: center;
      a {
        width: 80px;
        height: 80px;
        img {
          width: 100%;
        }
      }
      a:first-child {
        margin-right: 58px;
      }
    }
  }
  .captcha {
    margin-bottom: 60px;
  }

  .is-iPhoneX {
    padding-bottom: 300px;
  }
  .err-title {
    height: 80px !important;
    line-height: 80px !important;
  }
  // 底部横线
  .border-1px-direction {
    position: relative;
    border-width: 0;
    input {
      background-color: transparent;
      position: relative;
      z-index: 1;
    }
    &::after {
      content: ' ';
      width: 200%;
      height: 200%;
      position: absolute;
      top: 0;
      left: 0;
      border-bottom: 1px solid #979797;
      border-radius: unset;
      transform: scale(0.5);
      transform-origin: 0 0;
      box-sizing: border-box;
    }
  }
</style>
