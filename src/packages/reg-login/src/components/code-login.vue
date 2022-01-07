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
      <el-form-item prop="phone">
        <el-input
          v-model.trim="ruleForm.phone"
          clearable
          :maxlength="11"
          placeholder="请输入手机号"
        ></el-input>
      </el-form-item>
      <!-- 图片验证码 -->
      <el-form-item>
        <div id="codeLoginCaptcha" class="vmp-yundun-captcha"></div>
      </el-form-item>
      <!-- 短信验证码 -->
      <el-form-item prop="captchas" class="vmp-wrap-code">
        <el-input
          v-model.trim="ruleForm.captchas"
          clearable
          type="captcha"
          :maxlength="6"
          placeholder="动态验证码"
          @blur="autoLoginSetMargin"
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
      <!-- 其它  -->
      <el-form-item>
        <div
          :class="[
            'vmp-box__link vmp-box__code__link',
            {
              'vmp-box__height__max': isMaxHeight
            }
          ]"
        >
          <el-checkbox v-model="autoLoginStatus" class="vmp-box-checkbox"></el-checkbox>
          <span class="vmp-box__auto vmp-box__checked" @click="autoLoginStatus = !autoLoginStatus">
            自动登录
          </span>
        </div>
        <el-button class="vmp-red-button length-max vmp-login-btn" @click="handleCodeLogin">
          登录
        </el-button>
        <a
          href="javascript:void(0)"
          class="vmp-reg__link"
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
  import ThirdLoginLink from './third-login-link.vue';
  export default {
    name: 'VmpCodeLogin',
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
      const validatePhone = (rule, value, callback) => {
        if (value === '') {
          callback('请输入手机号');
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            callback(new Error('请输入正确的手机号'));
          } else {
            callback();
          }
        }
      };
      const validateCaptchas = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入动态验证码'));
        } else {
          callback();
        }
      };
      return {
        isMobile: false, // 是否是手机端展示(true - 手机端；false - PC浏览器)
        options: {},
        ruleForm: {
          phone: '', // 验证码登录时，表示手机号
          captchas: '' // 短信验证码
        },
        ruleFormRules: {
          phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
          captchas: [{ required: true, validator: validateCaptchas, trigger: 'blur' }]
        },
        cap: null, // 云盾本身
        captchaKey: null, // 云盾key b7982ef659d64141b7120a6af27e19a0
        captchaVal: null, // 图片验证码值
        timeInterval: null,
        time: 60, // 验证码倒计时
        autoLoginStatus: false, // 账户的自动登录
        isMaxHeight: false, // 样式控制 - 若验证码通过，或者未输入情况下，自动登录跟其间距只需要8px;
        btnDisabled: true, // 手机号 & 图形验证码 校验，控制发送验证码是否可以点击。默认不可点击
        isDownTime: false // 倒计时计时情况下，isDownTime为true。否则为false。
      };
    },
    watch: {
      'ruleForm.captchas': function () {
        this.autoLoginSetMargin();
      },
      'ruleForm.phone': function () {
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
        let captchasFlag = false;
        this.$refs.ruleForm.validateField('captchas', function (res) {
          captchasFlag = !res;
        });
        this.isMaxHeight = !captchasFlag;
      },
      // 控制发送验证码是否禁用状态
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
          if (!document.getElementById('codeLoginCaptcha')) {
            return;
          }
          this.callCaptcha(
            '#codeLoginCaptcha',
            function (that, err, data) {
              if (data) {
                that.captchaVal = data.validate;
                that.codeBtnDisabledCheck();
              } else {
                console.log('#codeLoginCaptcha --- call-success图片验证码', err);
              }
            },
            function (that, err) {
              console.log('#codeLoginCaptcha --- call-failure图片验证码', err);
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
      // 发送验证码 - 按钮点击
      handleSendCode() {
        let phoneFlag = false;
        this.$refs.ruleForm.validateField('phone', function (res) {
          console.log('校验结果：', !res);
          phoneFlag = !res;
        });
        if (!phoneFlag) {
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
        }
      },
      // 点击登录 - 验证码登录
      handleCodeLogin() {
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            /*// TODO 真实逻辑 验证码登录 [http://yapi.vhall.domain/project/740/interface/api/45707]
            const cUserLogin = ['/v4/ucenter-login-reg/consumer/login', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
            const params = {
              way: 2, // 手机号验证码登录
              phone: this.ruleForm.phone,
              code: this.ruleForm.captchas, // 动态密码【快捷登录（短信验证码登录）必传】
              remember: Number(this.autoLoginStatus)
            };
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
                    message: '登录失败',
                    showClose: true,
                    // duration: 0,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                  localStorage.setItem('token', '');
                  if (!this.captchaVal) {
                    this.reloadCaptha();
                  }
                }
              })
              .catch(res => {
                console.warn('登录失败', res);
                this.$message({
                  message: '登录失败',
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
                localStorage.setItem('token', '');
                if (!this.captchaVal) {
                  this.reloadCaptha();
                }
              }); */
            // TODO 模拟数据
            const token =
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDE0ODc1MDgsImV4cCI6MTY0NDA3OTUwOCwidXNlcl9pZCI6IjEwMjI3NyIsInBsYXRmb3JtIjoiNyIsImNoIjoiYyIsImJ1c2luZXNzX2FjY291bnRfaWQiOiIifQ.H5g0DDCzTDKQirrwu33-CtZcHwIxrD8kkqDEyp0_iM8';
            localStorage.setItem('token', token || '');
            this.getCUserInfo();
          }
        });
      },
      // 获取C端登录后用户信息
      getCUserInfo() {
        /* // TODO 真实逻辑 C端用户信息 [http://yapi.vhall.domain/project/740/interface/api/45707] ??? 不确定参数如何传递
        const cUserInfo = ['/v4/ucenter-c/consumer/get-info', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
        this.$fetch('cUserInfo', {})
          .then(res => {
            if (res.code == 200) {
              localStorage.setItem('userInfo', JSON.stringify(res.data));
              // TODO exp_time 做token失效机制的内容，在PC端是否还需要处理？需要的话需要后端返回？
              // TODO 登录成功，事件派发 或者修改登录状态等，待书写。
              this.resetForm();
              this.$emit('handleClose', 'code');
              // 刷新页面
              // this.$router.go(0);
            } else {
              localStorage.setItem('userInfo', '');
            }
          })
          .catch(res => {
            console.warn('获取C端登录后用户信息失败', res);
            localStorage.setItem('userInfo', '');
          }); */
        // 模拟逻辑
        localStorage.setItem(
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
        this.$emit('closeParent', 'code');
      },
      // 重置当前表单 - 通用api
      resetForm() {
        // 数据重置
        this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
        this.reloadCaptha();
      },
      // init组件入口 - 通用api
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
        console.log('验证码登录init', this.options);
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
  .vmp-code-login {
    padding: 0 32px 24px 32px;
  }
</style>
