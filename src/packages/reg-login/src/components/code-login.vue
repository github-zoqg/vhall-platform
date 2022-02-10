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
          :placeholder="$t('account.account_1025')"
        ></el-input>
      </el-form-item>
      <!-- 图片验证码 -->
      <el-form-item>
        <div id="codeLoginCaptcha" class="vhsaas-yundun-captcha"></div>
      </el-form-item>
      <!-- 短信验证码 -->
      <el-form-item prop="captchas" class="vmp-reg-login__wrap__code">
        <el-input
          v-model.trim="ruleForm.captchas"
          clearable
          type="captcha"
          :maxlength="6"
          :placeholder="$t('account.account_1029')"
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
              ? $t('account.account_1031', { n: loginServerState.second })
              : $t('account.account_1030')
          }}
        </span>
      </el-form-item>
      <!-- 其它  -->
      <el-form-item>
        <div
          :class="[
            'vmp-reg-login-box__link vmp-reg-login-box__code__link',
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
        </div>
        <el-button
          type="primary"
          round
          class="length-max vmp-reg-login__login__btn"
          @click="handleCodeLogin"
        >
          {{ $t('nav.nav_1005') }}
        </el-button>
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
  /**
   * @description 验证码登录
   */
  import ThirdLoginLink from './third-login-link.vue';
  import { useLoginServer } from 'middle-domain';
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
        // type: Boolean,
        default() {
          /* showThirdLogin 取值范围
             0 -- 不开启第三方登录功能；
             1 -- 开启第三方登录功能。
          */
          return 0;
        }
      },
      visitorId: {
        // visitorId 游客ID
        type: String,
        default() {
          return '';
        }
      }
    },
    data() {
      const validatePhone = (rule, value, callback) => {
        if (value === '') {
          callback(this.$t('account.account_1025'));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            callback(new Error(this.$t('account.account_1069')));
          } else {
            callback();
          }
        }
      };
      const validateCaptchas = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('account.account_1070')));
        } else {
          callback();
        }
      };
      const loginServerState = this.loginServer.state; // 响应式注入
      return {
        loginServerState,
        ruleForm: {
          phone: '', // 验证码登录时，表示手机号
          captchas: '' // 短信验证码
        },
        ruleFormRules: {
          phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
          captchas: [{ required: true, validator: validateCaptchas, trigger: 'blur' }]
        },
        autoLoginStatus: false, // 账户的自动登录
        isMaxHeight: false, // 样式控制 - 若验证码通过，或者未输入情况下，自动登录跟其间距只需要8px;
        btnDisabled: true // 手机号 & 图形验证码 校验，控制发送验证码是否可以点击。默认不可点击
      };
    },
    watch: {
      'ruleForm.captchas': function () {
        this.autoLoginSetMargin();
      },
      // 输入手机号
      'ruleForm.phone': function () {
        this.codeBtnDisabledCheck();
      },
      captchaReady() {
        this.codeBtnDisabledCheck();
      }
    },
    computed: {
      captchaReady() {
        return !!this.loginServerState.captchaVal;
      },
      isDownTime() {
        return this.loginServerState.second >= 0;
      }
    },
    methods: {
      // 切换至注册面板
      handleToReg() {
        this.$emit('handleLink', 'reg');
      },
      // 间距设定
      autoLoginSetMargin() {
        this.$refs.ruleForm.validateField('captchas', res => {
          console.log('🚀 ~ file: code-login.vue ~ line 198 ~ autoLoginSetMargin ~ res', res);
          this.isMaxHeight = !!res;
        });
      },
      // 控制发送验证码是否禁用状态
      codeBtnDisabledCheck() {
        if (!this.captchaReady) return (this.btnDisabled = true);
        if (this.ruleForm.phone) {
          this.$refs.ruleForm.validateField('phone', err => {
            this.btnDisabled = !!err;
          });
        }
      },
      // 发送验证码 - 按钮点击
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
            this.loginServer.sendCode(this.ruleForm.phone); // 相应与异常已在domain处理
          }
        });
      },
      // 点击登录 - 验证码登录
      // handleCodeLogin() {
      //   this.loginServer.refreshNECaptha();
      // },
      handleCodeLogin() {
        this.$refs.ruleForm.validate(valid => {
          if (valid) {
            const params = {
              way: 2, // 手机号验证码登录
              phone: this.ruleForm.phone,
              dynamic_code: this.ruleForm.captchas, // 动态密码【快捷登录（短信验证码登录）必传】
              remember: this.autoLoginStatus ? 1 : ''
            };
            if (this.visitorId) {
              params.visitor_id = this.visitorId; // 游客id 登录方式为账号密码或者手机号验证码方式，如果传入游客ID会将访客和登录账户进行绑定
            }
            this.loginServer.userLogin(params).then(res => {
              console.log(
                '🚀 ~ file: code-login.vue ~ line 257 ~ this.loginServer.userLogin ~ res',
                res
              );
              if (res.code === 200) {
                this.resetForm();
                this.$emit('handleClose', 'code');
                // 刷新页面
                // this.$router.go(0);
                window.location.reload();
              } else {
                this.$message({
                  message: res.msg || this.$t('login.login_1021'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }
            });
          }
        });
      },
      // 获取C端登录后用户信息
      // getCUserInfo() {
      //   /* // TODO 真实逻辑 C端用户信息 [http://yapi.vhall.domain/project/740/interface/api/45707] ??? 不确定参数如何传递  */
      //   // const cUserInfo = ['/v4/ucenter-c/consumer/get-info', 'POST', true]; // Mock地址配置举例，需headers里biz_id根据业务线区分。
      //   this.$fetch('cUserInfo', {})
      //     .then(res => {
      //       if (res.code == 200) {
      //         localStorage.setItem('userInfo', JSON.stringify(res.data));
      //         // TODO exp_time 做token失效机制的内容，在PC端是否还需要处理？需要的话需要后端返回？
      //         // TODO 登录成功，事件派发 或者修改登录状态等，待书写。
      //       } else {
      //         localStorage.setItem('userInfo', '');
      //       }
      //     })
      //     .catch(res => {
      //       console.warn('获取C端登录后用户信息失败', res);
      //       localStorage.setItem('userInfo', '');
      //     });
      //   this.resetForm();
      //   this.$emit('closeParent', 'code');
      // },
      // 重置当前表单 - 通用api
      resetForm() {
        // 数据重置
        this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
      }
    },
    beforeCreate() {
      this.loginServer = useLoginServer();
    },
    async mounted() {
      await this.loginServer.initNECaptcha();
    }
  };
</script>
<style lang="less">
  @import url('../styles/reset.less');
  .vmp-code-login {
    padding: 0 32px 24px 32px;
  }
</style>
