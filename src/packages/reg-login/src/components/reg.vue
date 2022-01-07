<template>
  <div class="vmp-register">
    <div class="vmp-reg-login__son__tab">
      <span>注册新用户</span>
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
          placeholder="请输入手机号"
          :maxlength="11"
          clearable
          auto-complete="off"
          @blur="codeBtnDisabledCheck"
        ></el-input>
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item>
        <div id="regCaptcha" class="vmp-yundun-captcha"></div>
      </el-form-item>
      <!-- 短信验证码 -->
      <el-form-item prop="captchas" class="vmp-wrap-code">
        <el-input
          v-model.trim="ruleForm.captchas"
          clearable
          type="captcha"
          :maxlength="6"
          placeholder="动态验证码"
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
            'vmp-code-btn show-border',
            {
              start: !btnDisabled && !isDownTime,
              disabled: btnDisabled,
              pending: !btnDisabled && isDownTime
            }
          ]"
          @click.stop.prevent="handleSendCode"
        >
          {{ isDownTime ? `${time}s` : '获取验证码' }}
        </span>
      </el-form-item>
      <el-form-item prop="password" class="vmp-register__pwd__box">
        <el-input
          type="password"
          v-model.trim="ruleForm.password"
          clearable
          placeholder="设置密码（选填，6-30个字符）"
        ></el-input>
        <a
          href="javascript:void(0)"
          class="vmp-register__login__link"
          @click.stop.prevent="handleToLogin"
        >
          去登录
        </a>
      </el-form-item>
      <!-- 注册密码
      <el-form-item :class="['vhsaas-box__pwd', 'vhsaas-box__msg__error']" prop="password">
        <pwd-input
          v-model.trim="ruleForm.password"
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
        <a href="javascript:void(0)" class="vhsaas-reg__login" @click.stop.prevent="handleToLogin">
          登录
        </a>
      </el-form-item> -->
      <el-button class="vmp-red-button length-max vmp-register-btn" round @click="handleRegister">
        {{ isMobile ? '注册' : '立即注册' }}
      </el-button>
      <div class="register-checked" v-if="!isMobile">
        <el-checkbox v-model="checked">
          我已阅读并同意
          <a
            href="https://t.e.vhall.com/home/vhallapi/serviceterms"
            target="_blank"
            class="vmp-register__to__link"
            rel="noopener noreferrer"
          >
            服务条款及隐私协议
          </a>
        </el-checkbox>
      </div>
      <div class="register-checked" v-else>
        <el-checkbox v-model="checked">
          同意并遵守
          <a
            href="https://t.e.vhall.com/home/vhallapi/serviceterms"
            target="_blank"
            class="vmp-register__to__link"
            rel="noopener noreferrer"
          >
            《服务条款》
          </a>
        </el-checkbox>
      </div>
    </el-form>
  </div>
</template>
<script>
  // import PwdInput from './pwd-input.vue';
  export default {
    name: 'VmpRegister',
    components: {
      // PwdInput
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
                account: this.ruleForm.phone,
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
        cap: null, // 云盾本身
        captchaKey: null, // 云盾key b7982ef659d64141b7120a6af27e19a0
        captchaVal: null, // 图片验证码值
        regPwdShow: true, // 注册 - 密码框的显示
        timeInterval: null,
        time: 60, // 验证码倒计时
        checked: false, // 是否勾选注册协议
        loginKeyVo: null,
        btnDisabled: true, // 手机号 & 图形验证码 校验，控制发送验证码是否可以点击。默认不可点击
        isDownTime: false // 倒计时计时情况下，isDownTime为true。否则为false。
      };
    },
    watch: {
      'ruleForm.phone': function () {
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
        if (this.ruleForm.phone) {
          let phoneFlag = false;
          this.$refs.ruleForm.validateField('phone', function (res) {
            phoneFlag = !res;
          });
          if (phoneFlag && this.captchaVal) {
            // 如果当前手机号验证通过，并且图形验证码已选取，获取验证码按钮可点击
            this.btnDisabled = false;
          } else {
            this.btnDisabled = true; // 获取验证码不可点击
          }
        } else {
          this.btnDisabled = true; // 获取验证码不可点击
        }
      },
      resetForm() {
        // 数据重置
        this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
        this.reloadCaptha();
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
          if (!document.getElementById('regCaptcha')) {
            return;
          }
          this.callCaptcha(
            '#regCaptcha',
            function (that, err, data) {
              if (data) {
                that.captchaVal = data.validate;
                that.codeBtnDisabledCheck();
              } else {
                console.log('#regCaptcha --- call-success图片验证码', err);
              }
            },
            function (that, err) {
              console.log('#regCaptcha --- call-failure图片验证码', err);
            }
          );
        } catch (e) {
          console.warn('Dom元素不存在情况下未渲染', e);
        }
      },
      // 获取图形验证码key
      getCapthaId() {
        /* TODO 真实逻辑
        // const getCapthaId = ['/v4/ucenter-login-reg/code/get-captchaid', 'GET', true] // Mock地址配置举例，需headers里biz_id根据业务线区分。
        this.$fetch('getCapthaId', {})
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
      },
      // 发送验证码
      handleSendCode() {
        let phoneFlag = false;
        this.$refs.ruleForm.validateField('phone', function (res) {
          // console.log('手机号校验结果：', !res);
          phoneFlag = !res;
        });
        if (!phoneFlag) {
          console.log('手机号校验失败');
          return;
        }
        if (!this.captchaVal) {
          this.$message({
            message: '图片验证码错误',
            showClose: true,
            // duration: 0,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          this.reloadCaptha();
          return;
        }
        // TODO 模拟知晓当前biz_id内容，后续待调整！！！
        if (phoneFlag) {
          /*  // TODO 真实逻辑 发送验证码 - 成功倒计时
          // yapi: http://yapi.vhall.domain/project/740/interface/api/45695
          // const sendCode = ['/v4/ucenter-login-reg/code/send', 'GET', true] // Mock地址配置举例，需headers里biz_id根据业务线区分。
          const params = {
            type: 1, // 1手机  2邮箱
            data: this.ruleForm.phone,
            validate: this.captchaVal, // 图形验证码数据
            scene_id: 7 // scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
          };
          // biz_id 区分业务线：2=SaaS直播，4=知客，8=其他
          const biz_id = 4;
          if (biz_id == 4) {
            params.zhike_type = 'CONSUMER_USER_LOGIN'; // CONSUMER_USER_LOGIN - C端账户快捷登录
          }
          this.$fetch('sendCode', params)
            .then(res => {
              if (res.code == 200) {
                if (this.timeInterval) {
                  clearInterval(this.timeInterval);
                  this.timeInterval = null;
                }
                this.timeInterval = setInterval(() => {
                  if (this.time > 0) {
                    this.isDownTime = true;
                    this.time--;
                  } else {
                    if (this.timeInterval) {
                      clearInterval(this.timeInterval);
                      this.timeInterval = null;
                      this.isDownTime = false;
                      // 验证码发送完成后，重置图片选择框
                      if (!this.captchaVal) {
                        this.reloadCaptha();
                      }
                    }
                    this.time = 60;
                  }
                }, 1000);
              } else {
                if (!this.captchaVal) {
                  this.$message({
                    message: '发送失败',
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                  this.reloadCaptha();
                }
              }
            })
            .catch(res => {
              console.warn('发送短信验证码失败', res);
              if (!this.captchaVal) {
                this.$message({
                  message: '发送失败',
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
                this.reloadCaptha();
              }
            }); */
          if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
          }
          this.timeInterval = setInterval(() => {
            if (this.time > 0) {
              this.isDownTime = true;
              this.time--;
            } else {
              if (this.timeInterval) {
                this.isDownTime = false;
                clearInterval(this.timeInterval);
                this.timeInterval = null;
                // 验证码发送完成后，重置图片选择框
                if (!this.captchaVal) {
                  this.reloadCaptha();
                }
              }
              this.time = 60;
            }
          }, 1000);
        }
      },
      // 获取密钥，便于密码计算
      getLoginKey() {
        /*  // TODO 真实逻辑
        const getLoginKey = ['/v4/ucenter-login-reg/safe/get-key-login', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
        this.$fetch('getLoginKey', {})
          .then(async res => {
            if (res.code == 200 && res.data) {
              this.loginKeyVo = res.data;
            } else {
              console.log('获取密码密钥失败', res);
              this.$message({
                message: '登录失败',
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            }
          })
          .catch(res => {
            console.log('获取密码密钥失败', res);
            this.$message({
              message: '登录失败',
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          }); */
        // TODO 模拟数据
        this.loginKeyVo = {
          public_key:
            '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC0O8nqq9sX460V0T6+sQTGZKBWoMUhELEmYDB1rDfvKZ6x4yt0Q6Xna45K/ZQKaRuwPCDqKxjtX/tyL4azLvJl+KWMaPMmsjdO5O8cDgIdoGscDD+jvF/kQdqhpvyz5kVK/8ZWxnyvTDsWHKJz4WO2m+zSxXFEgn1AjZShI6ofVQIDAQAB-----END PUBLIC KEY-----',
          uuid: '972201070353222848'
        };
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
      // 注册
      handleRegister() {
        this.$refs.ruleForm.validate(async valid => {
          if (valid) {
            if (!this.captchaVal) {
              this.$message({
                message: '图片验证码错误',
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
              return;
            }
            if (!this.checked) {
              this.$message({
                message: '请先勾选协议',
                showClose: true,
                // duration: 0,
                type: 'error',
                customClass: 'zdy-info-box'
              });
              return;
            }
            // 验证通过，触发注册
            await this.getLoginKey();
            /* // TODO 真实逻辑
            const retPassword = this.ruleForm.password
              ? this.handleEncryptPassword(this.ruleForm.password)
              : '';
            // C端用户注册 [http://yapi.vhall.domain/project/740/interface/api/45704]
            const cUserRegister = ['/v4/ucenter-login-reg/consumer/register', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
            const params = {
              source: 2,
              way: 2, // （默认2）1=账号密码注册|2=手机号验证码注册
              phone: this.ruleForm.phone,
              code: this.ruleForm.captchas,
              password: retPassword,
              agree: 1
            };
            this.$fetch('cUserRegister', params)
              .then(res => {
                if (res.code == 200) {
                  this.$message({
                    message: '注册成功',
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                  this.handleToLogin();
                } else {
                  console.log('注册失败', res);
                  this.$message({
                    message: '注册失败',
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                console.log('注册失败', res);
                this.$message({
                  message: '注册失败',
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }); */
            this.$message({
              message: '注册成功',
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
            this.handleToLogin();
          }
        });
      },
      async init(params = {}) {
        // 组件加载初始化默认数据
        this.isMobile =
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|wOSBrowser|BrowserNG|WebOS)/i.test(
            navigator.userAgent
          );
        this.options = {
          ...params
        };
        console.log('注册init', this.options);
        await this.$nextTick();
        // 默认图片验证码加载
        this.reloadCaptha();
      }
    },
    async created() {
      await this.getCapthaId();
      this.init();
    }
  };
</script>
<style lang="less" scoped>
  @import url('../less/reset.less');
  .vmp-register {
    padding: 0 32px 24px 32px;
  }
  /deep/.vmp-register__pwd__box {
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
  .vmp-register-btn {
    margin-bottom: 8px;
  }
  .register-checked {
    text-align: left;
    vertical-align: middle;
    line-height: 20px;
    /deep/.el-checkbox__label {
      font-size: 14px;
      font-weight: 400;
      color: #999999;
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
