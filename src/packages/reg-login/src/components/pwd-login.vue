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
      <el-form-item prop="account">
        <el-input
          v-model.trim="ruleForm.account"
          clearable
          :placeholder="$t('login.login_1010')"
        ></el-input>
      </el-form-item>
      <!-- 图片验证码 -->
      <el-form-item v-show="captchaIsShow">
        <div id="pwdLoginCaptcha" class="vhsaas-yundun-captcha"></div>
      </el-form-item>
      <!-- 请输入登录密码 -->
      <el-form-item prop="password">
        <el-input
          type="password"
          v-model.trim="ruleForm.password"
          clearable
          :placeholder="$t('login.login_1011')"
          @blur="autoLoginSetMargin"
        ></el-input>
      </el-form-item>
      <!-- 其它 -->
      <el-form-item>
        <div
          :class="[
            'vmp-reg-login-box__link vmp-reg-login-box__pwd__link',
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
        <el-button
          type="primary"
          round
          class="length-max vmp-reg-login__login__btn"
          @click="handlePwdLogin"
        >
          {{ $t('nav.nav_1005') }}
        </el-button>
        <a
          href="javascript:void(0)"
          class="vmp-reg-login__reg__link"
          v-if="options.showToReg == 1"
          @click="handleToReg"
        >
          {{ $t('register.register_1005') }}
        </a>
      </el-form-item>
      <!-- 第三方登录 -->
      <third-login-link v-if="options.showThirdLogin"></third-login-link>
    </el-form>
  </div>
</template>
<script>
  import ThirdLoginLink from './third-login-link.vue';
  export default {
    name: 'VmpPwdLogin',
    components: {
      ThirdLoginLink
    },
    props: {
      sonTitle: {
        required: false,
        default() {
          return '';
        }
      },
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
      },
      visitorId: {
        required: false,
        default() {
          // visitorId 游客ID
          return 0;
        }
      }
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
        isMobile: false, // 是否是手机端展示(true - 手机端；false - PC浏览器)
        options: {},
        ruleForm: {
          account: '', // 密码登录时，表示账号
          password: '' // 密码
        },
        ruleFormRules: {
          account: [{ required: true, validator: validAccount, trigger: 'blur' }],
          password: [{ required: true, validator: validPwd, trigger: 'blur' }]
        },
        loginPwdShow: true, // 登录-密码框的显示,
        captchaIsShow: false, // 是否触发图形验证码展示
        isLoginPwdFocus: false, // handleFocus / handleBlur 会更改此参
        cap: null, // 云盾本身
        captchaKey: null, // 云盾key b7982ef659d64141b7120a6af27e19a0
        captchaVal: null, // 图片验证码值
        timeInterval: null,
        time: 60, // 验证码倒计时
        autoLoginStatus: false, // 账户的自动登录
        forgetUrl: 'javascript:void(0);', // 忘记密码链接入口
        loginKeyVo: null, // 对象
        isMaxHeight: false // 样式控制 - 若验证码通过，或者未输入情况下，自动登录跟其间距只需要8px;
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
      // 调起图片验证码
      callCaptcha(element, success, failure) {
        const that = this;
        if (this.captchaKey) {
          // 若拿到了图形验证码的key，在调用云盾图形验证码
          window.initNECaptcha({
            captchaId: this.captchaKey,
            element: element,
            mode: 'float',
            width: 270,
            // TODO 网易易顿多语言字段 lang
            lang: window.$globalConfig.currentLang,
            onReady(instance) {
              console.log('instance', instance);
            },
            onVerify(err, data) {
              console.log(err);
              success(that, err, data);
            },
            onload(instance) {
              console.log('load...', instance);
              failure(that, instance);
            }
          });
        } else {
          failure(that, '当前未获取到图形验证captchaId的值，需要后端人员协助');
        }
      },
      // 重置图形验证码
      reloadCaptha() {
        // 每次初始化之前，先把原有值清除
        this.captchaVal = '';
        try {
          if (!document.getElementById('pwdLoginCaptcha')) {
            return;
          }
          this.callCaptcha(
            '#pwdLoginCaptcha',
            function (that, err, data) {
              if (data) {
                that.captchaVal = data.validate;
              } else {
                console.log('#pwdLoginCaptcha --- call-success图片验证码', err);
              }
            },
            function (that, err) {
              console.log('#pwdLoginCaptcha --- call-failure图片验证码', err);
            }
          );
        } catch (e) {
          console.warn('Dom元素不存在情况下未渲染', e);
        }
      },
      // 获取图形验证码key
      getCapthaId() {
        // 若已经获取过图片验证码key，避免重复请求获取key数据
        if (!this.captchaKey) {
          /* TODO 真实逻辑
          // const getCapthaId = ['/v4/ucenter-login-reg/code/get-captchaid', 'GET', true] // Mock地址配置举例，需headers里biz_id根据业务线区分。
          return this.$fetch('getCapthaId', {})
            .then(res => {
              if (res && res.data && res.data.captchaid) {
                this.captchaKey = res.data.captchaid || '';
              } else {
                this.captchaKey = '';
              }
            })
            .catch(res => {
              console.warn('获取图形验证码key失败', res);
              this.captchaKey = '';
            });
          */
          // TODO 模拟数据
          this.captchaKey = 'b7982ef659d64141b7120a6af27e19a0';
        }
      },
      // 密码登录
      handlePwdLogin() {
        if (this.captchaIsShow && !this.captchaVal) {
          // 开启了图片验证码展示，但是当前未选择图形码
          this.$message({
            message: this.$t('account.account_1028'),
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        } else if (this.captchaVal) {
          // 如果选择的图形码有值，表示触发了账号锁定，再次登录需要图片验证码逻辑。这个时候直接往下走。
          this.nextLogin();
        } else {
          // 如果没有选择过图形码，走账号检测判断
          this.$refs.ruleForm.validate(async valid => {
            // 表单验证通过，方才检验，减少多余的请求发送
            if (valid) {
              /* // TODO 真实逻辑 */
              // const loginCheck = ['/v4/ucenter-login-reg/user-check/login-check', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
              this.$fetch('loginCheck', {
                account: this.ruleForm.username,
                channel: 'C' // B端用户还是C端用户
              })
                .then(async res => {
                  if (res.code == 200 && res.data && res.data.check_result == 1) {
                    this.captchaIsShow = true;
                    // 账号被锁定 再次登录需要图片验证)
                    await this.getCapthaId();
                    // 默认图片验证码加载
                    this.reloadCaptha();
                  } else if (res.code == 200) {
                    this.captchaIsShow = false;
                    // 非异常情况下，触发登录逻辑
                    this.nextLogin();
                  } else {
                    console.log('获取账号检测接口结果错误', res);
                    this.$message({
                      message: res.msg || this.$t('login.login_1021'),
                      showClose: true,
                      // duration: 0,
                      type: 'error',
                      customClass: 'zdy-info-box'
                    });
                  }
                })
                .catch(res => {
                  console.log('获取账号检测接口结果错误', res);
                  this.$message({
                    message: res.msg || this.$t('login.login_1021'),
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                });
              /*  // TODO 模拟逻辑
              this.captchaIsShow = false;
              // 非异常情况下，触发登录逻辑
              this.nextLogin(); */
            }
          });
        }
      },
      // 获取密钥，便于密码计算
      getLoginKey() {
        /*  // TODO 真实逻辑  */
        // const getLoginKey = ['/v4/ucenter-login-reg/safe/get-key-login', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
        return this.$fetch('getLoginKey', {})
          .then(async res => {
            if (res.code == 200 && res.data) {
              this.loginKeyVo = res.data;
            } else {
              console.log('获取密码密钥失败', res);
              this.$message({
                message: res.msg || this.$t('login.login_1021'),
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
              if (this.captchaIsShow && !this.captchaVal) {
                this.reloadCaptha();
              }
            }
          })
          .catch(res => {
            console.log('获取密码密钥失败', res);
            this.$message({
              message: res.msg || this.$t('login.login_1021'),
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
            if (this.captchaIsShow && !this.captchaVal) {
              this.reloadCaptha();
            }
          });
        // TODO 模拟数据
        /* this.loginKeyVo = {
          public_key:
            '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0O8nqq9sX460V0T6+sQTGZKBWoMUhELEmYDB1rDfvKZ6x4yt0Q6Xna45K/ZQKaRuwPCDqKxjtX/tyL4azLvJl+KWMaPMmsjdO5O8cDgIdoGscDD+jvF/kQdqhpvyz5kVK/8ZWxnyvTDsWHKJz4WO2m+zSxXFEgn1AjZShI6ofVQIDAQAB-----END PUBLIC KEY-----',
          uuid: '972201070353222848'
        }; */
      },
      handleEncryptPassword(password) {
        let retPassword = '';
        // 新建JSEncrypt对象
        const encryptor = new window.JSEncrypt();
        // 设置公钥
        encryptor.setPublicKey(this.loginKeyVo.public_key);
        // 加密数据
        retPassword = encryptor.encrypt(password);
        retPassword = retPassword.replace(/\+/g, '-').replace(/\//g, '_');
        while (retPassword[retPassword.length - 1] === '=') {
          retPassword = retPassword.substr(0, retPassword.length - 1);
        }
        return retPassword;
      },
      // 触发login表单验证，若验证通过，执行登录
      nextLogin() {
        this.$refs.ruleForm.validate(async valid => {
          if (valid) {
            await this.getLoginKey();
            /* // TODO 真实逻辑  */
            const retPassword = this.handleEncryptPassword(this.ruleForm.password);
            // 账号密码登录 [http://yapi.vhall.domain/project/740/interface/api/45707]
            // const cUserLogin = ['/v4/ucenter-login-reg/consumer/login', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
            const params = {
              way: 1, // 账号密码登录
              account: this.ruleForm.account,
              password: retPassword,
              remember: Number(this.autoLoginStatus)
            };
            if (this.captchaIsShow) {
              params.captcha = this.captchaVal;
              params.validate_type = 1; // 1=图片交互方式校验|2=点击交互校验，【账号密码方式登录并且账号被锁定情况下校验，默认是图片交互方式】
            }
            if (this.options.visitorId) {
              params.visitor_id = this.options.visitorId; // 游客id 登录方式为账号密码或者手机号验证码方式，如果传入游客ID会将访客和登录账户进行绑定
            }
            this.$fetch('cUserLogin', params)
              .then(res => {
                if (res.code == 200) {
                  // TODO 存储登录状态 - 待书写
                  localStorage.setItem('token', res.data.token || '');
                  // TODO 登录成功后，获取用户信息
                  this.getCUserInfo();
                } else {
                  this.$message({
                    message: res.msg || this.$t('login.login_1021'),
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                  localStorage.setItem('token', '');
                  if (this.captchaIsShow && !this.captchaVal) {
                    this.reloadCaptha();
                  }
                }
              })
              .catch(res => {
                console.warn('登录失败', res);
                this.$message({
                  message: res.msg || this.$t('login.login_1021'),
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
                localStorage.setItem('token', '');
                if (this.captchaIsShow && !this.captchaVal) {
                  this.reloadCaptha();
                }
              });
            // TODO 模拟数据
            /*  const token =
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDE0ODc1MDgsImV4cCI6MTY0NDA3OTUwOCwidXNlcl9pZCI6IjEwMjI3NyIsInBsYXRmb3JtIjoiNyIsImNoIjoiYyIsImJ1c2luZXNzX2FjY291bnRfaWQiOiIifQ.H5g0DDCzTDKQirrwu33-CtZcHwIxrD8kkqDEyp0_iM8';
            localStorage.setItem('token', token || '');
            this.getCUserInfo(); */
          }
        });
      },
      // 获取C端登录后用户信息
      getCUserInfo() {
        /* // TODO 真实逻辑 C端用户信息 [http://yapi.vhall.domain/project/740/interface/api/45707] ??? 不确定参数如何传递  */
        // const cUserInfo = ['/v4/ucenter-c/consumer/get-info', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
        this.$fetch('cUserInfo', {})
          .then(res => {
            if (res.code == 200) {
              localStorage.setItem('userInfo', JSON.stringify(res.data));
              // TODO exp_time 做token失效机制的内容，在PC端是否还需要处理？需要的话需要后端返回？
              // TODO 登录成功，事件派发 或者修改登录状态等，待书写。
              this.resetForm();
              this.$emit('handleClose', 'code');
              // 刷新页面
              this.$router.go(0);
            } else {
              localStorage.setItem('userInfo', '');
            }
          })
          .catch(res => {
            console.warn('获取C端登录后用户信息失败', res);
            localStorage.setItem('userInfo', '');
          });
        // 模拟逻辑
        /* localStorage.setItem(
          'userInfo',
          JSON.stringify({
            code: 200,
            msg: '',
            data: {
              current_date: '2022-01-07 00:45:09',
              user_thirds: [],
              user_extends: {
                logo: '',
                wechat_profile: '',
                wechat_name_wap: '',
                logo_jump_url: '',
                extends_remark: 0,
                is_bind_wechat: 0
              },
              name: 's16690403',
              email: '',
              phone: '184****0000',
              avatar: '',
              balance: '0',
              company: '',
              position: '',
              industry: 0,
              country: '',
              province: 0,
              city: '',
              area: '',
              birthday: 0,
              user_id: 102277,
              nick_name: '\u7b28\u732a',
              pay_weixin: '',
              user_type: 0,
              real_name: '',
              education_level: '',
              is_activated: 0,
              wx_union_id: '',
              wx_qr_open_id: '',
              open_id: '',
              wx_open_id: '',
              created_at: '2021-11-16 19:23:18',
              updated_at: '2022-01-07 00:45:00',
              deleted_at: '',
              is_new_regist: 1,
              is_jump_hd: 1,
              has_password: 1
            },
            request_id: 'acd3362a-e24d-28a7-bcdf-1627fcc3fecd'
          })
        );
        this.resetForm();
        this.$emit('closeParent', 'code'); */
      },
      resetForm() {
        // 数据重置
        this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
        this.reloadCaptha();
      },
      // init组件入口
      init(params = {}) {
        // 组件加载初始化默认数据
        this.isMobile =
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|wOSBrowser|BrowserNG|WebOS)/i.test(
            navigator.userAgent
          );
        this.options = {
          ...{
            showToReg: this.showToReg,
            showThirdLogin: this.showThirdLogin,
            visitorId: this.visitorId
          },
          ...params
        };
        console.log('密码登录init', this.options);
        // TODO - C端忘记密码控制，待按照实际逻辑走
        const { href } = this.$router.resolve({ path: '/forgetPwd' });
        this.forgetUrl = href;
      }
    },
    created() {
      this.init();
    }
  };
</script>
<style lang="less">
  @import url('../styles/reset.less');
  .vmp-pwd-login {
    padding: 0 32px 24px 32px;
  }
</style>
