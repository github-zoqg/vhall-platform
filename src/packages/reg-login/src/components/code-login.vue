<template>
  <div class="vmp-code-login">
    <el-form
      ref="ruleForm"
      key="codeLoginForm"
      :model="ruleForm"
      :rules="ruleFormRules"
      label-width="0"
      class="vmp-login__form__common"
    >
      <!-- 手机号 -->
      <el-form-item prop="usernames">
        <el-input
          v-model.trim="ruleForm.usernames"
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
        ></el-input>
        <span
          type="danger"
          :disabled="buttonControl == 'disabled'"
          :class="['vmp-code-btn show-border', buttonControl]"
          @click.stop.prevent="handleSendCode"
        >
          获取验证码 {{ time }}
        </span>
      </el-form-item>
      <!-- 其它  -->
      <el-form-item>
        <div
          :class="[
            'vmp-box__link',
            'vmp-box__msg__error',
            { 'vmp-box__link__error': captchaError }
          ]"
        >
          <el-checkbox v-model="autoLoginStatus" class="vmp-box-checkbox"></el-checkbox>
          <span class="vmp-box__auto vmp-box__checked" @click="handleSetAutoStatus">自动登录</span>
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
      const validatePhone = (rule, value, callback) => {
        this.phoneError = value === '' || !/^1[0-9]{10}$/.test(value);
        this.isShowPhoneErr = value === '' || !/^1[0-9]{10}$/.test(value);
        if (value === '') {
          this.buttonControl = 'disabled'; // 验证失败，禁用
          callback('请输入手机号');
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            this.buttonControl = 'disabled'; // 验证失败，禁用
            callback(new Error('请输入正确的手机号'));
          } else {
            if (this.phoneKey) {
              this.buttonControl = 'start'; // 验证成功，启用
            } else {
              this.buttonControl = 'disabled';
            }
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
      return {
        isMobile: false, // 是否是手机端展示(true - 手机端；false - PC浏览器)
        options: {},
        ruleForm: {
          usernames: '', // 验证码登录时，表示手机号
          captchas: '' // 短信验证码
        },
        ruleFormRules: {
          usernames: [{ required: true, validator: validatePhone, trigger: 'blur' }],
          captchas: [{ required: true, validator: validateCaptchas, trigger: 'blur' }]
        },
        cap: null, // 云盾本身
        captchaKey: null, // 云盾key b7982ef659d64141b7120a6af27e19a0
        captchaVal: null, // 图片验证码值
        timeInterval: null,
        time: 60, // 验证码倒计时
        autoLoginStatus: false // 账户的自动登录
      };
    },
    methods: {
      // 切换至注册面板
      handleToReg() {
        this.$emit('handleLink', 'reg');
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
      // 自动登录状态切换
      handleSetAutoStatus() {
        this.autoLoginStatus = !this.autoLoginStatus;
      },
      reloadCaptha() {
        // 每次初始化之前，先把原有值清除
        this.captchaVal = '';
        this.callCaptcha(
          '#codeLoginCaptcha',
          function (that, err, data) {
            if (data) {
              that.captchaVal = data.validate;
            } else {
              console.log('#codeLoginCaptcha --- call-success图片验证码', err);
            }
          },
          function (that, err) {
            console.log('#codeLoginCaptcha --- call-failure图片验证码', err);
          }
        );
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
        this.$refs.ruleForm.validateField('usernames', function (res) {
          console.log('校验结果：', !res);
          phoneFlag = !res;
        });
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
        const biz_id = 4;
        if (phoneFlag) {
          /*  // TODO 真实逻辑 发送验证码 - 成功倒计时
          // yapi: http://yapi.vhall.domain/project/740/interface/api/45695
          // const sendCode = ['/v4/ucenter-login-reg/code/send', 'GET', true] // Mock地址配置举例，需headers里biz_id根据业务线区分。
          const params = {
            type: 1, // 1手机  2邮箱
            data: this.ruleForm.usernames,
            validate: this.captchaVal, // 图形验证码数据
            scene_id: 7 // scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
          };
          // biz_id 区分业务线：2=SaaS直播，4=知客，8=其他
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
                    this.time--;
                  } else {
                    if (this.timeInterval) {
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
              this.time--;
            } else {
              if (this.timeInterval) {
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
      handleCodeLogin() {},
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
            showThirdLogin: this.showThirdLogin
          },
          ...params
        };
        console.log('验证码登录', this.options);
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
    padding: 0 32px;
  }
</style>
