<template>
  <el-dialog
    width="365px"
    append-to-body
    :visible.sync="phoneData.dialogShow"
    :title="phoneData.type == 'add' ? $t('account.account_1024') : $t('account.account_1026')"
    :class="
      phoneData.type == 'edit' && phoneData.step == 1
        ? 'vmp-user-account-phone phone-edit'
        : 'vmp-user-account-phone'
    "
    :close-on-click-modal="false"
    @close="dialogClose"
  >
    <div class="vmp-user-account-phone-wrap">
      <!-- 未绑定手机号 绑定手机号表单 -->
      <el-form ref="setPhoneForm" :model="setPhoneForm" :rules="setFormRules" label-width="0">
        <p v-if="phoneData.type == 'add'" class="vmp-user-account__sTitle">
          {{ $t('account.account_1027') }}
        </p>
        <p v-if="phoneData.type == 'edit' && phoneData.step === 1" class="vmp-user-account__eTitle">
          {{ $t('account.account_1032') }}
        </p>
        <p
          v-if="phoneData.type == 'edit' && phoneData.step === 1"
          class="vmp-user-account__eNotice"
        >
          {{ $t('account.account_1033') }}
        </p>
        <p v-if="phoneData.type == 'edit' && phoneData.step === 2" class="vmp-user-account__eTitle">
          {{ $t('account.account_1034') }}
        </p>
        <el-form-item
          v-if="phoneData.type == 'edit' && phoneData.step === 1"
          class="vmp-user-account-redonly"
        >
          <span>{{ phoneData.phone || '' }}</span>
        </el-form-item>
        <el-form-item
          v-if="!(phoneData.type == 'edit' && phoneData.step === 1)"
          key="phone"
          prop="phone"
        >
          <el-input
            v-model.trim="setPhoneForm.phone"
            auto-complete="off"
            clearable
            :placeholder="$t('account.account_1025')"
            :maxlength="11"
          />
        </el-form-item>
        <el-form-item id="captcha-box">
          <NECaptcha ref="NECaptcha" v-model="setPhoneForm.imgCode" />
        </el-form-item>
        <el-form-item prop="code" class="vmp-user-account-wrap__code">
          <el-input
            v-model.trim="setPhoneForm.code"
            clearable
            type="captcha"
            :maxlength="6"
            :placeholder="$t('account.account_1029')"
          ></el-input>
          <span
            type="danger"
            :disabled="setPhoneForm.code ? '' : 'disabled'"
            :class="[
              'vmp-user-account-wrap__code__btn',
              setPhoneForm.imgCode && !timer ? 'start' : 'disabled'
            ]"
            @click.stop.prevent="getCaptha"
          >
            {{ timer ? $t('account.account_1031', { n: countTime }) : $t('account.account_1030') }}
          </span>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button
          v-if="phoneData.type == 'add'"
          v-preventReClick
          class="vmp-user-account-phone__red__button vmp-user-account-phone__length-max"
          @click="setPhoneHandler"
        >
          {{ $t('account.account_1035') }}
        </el-button>
        <el-button
          v-if="phoneData.type == 'edit' && phoneData.step === 1"
          v-preventReClick
          class="vmp-user-account-phone__red__button vmp-user-account-phone__length-max"
          @click="checkOldPhoneHandler"
        >
          {{ $t('account.account_1036') }}
        </el-button>
        <el-button
          v-if="phoneData.type == 'edit' && phoneData.step === 2"
          v-preventReClick
          class="vmp-user-account-phone__red__button vmp-user-account-phone__length-max"
          @click="editPhoneHandler"
        >
          {{ $t('account.account_1037') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import NECaptcha from '../NECaptcha/index.vue';
  import { useUserServer } from 'middle-domain';

  export default {
    name: 'PhoneBind',
    components: {
      NECaptcha
    },
    props: {
      value: {
        type: Object,
        default: () => ({
          dialogShow: false,
          type: 'add',
          step: '1',
          phone: ''
        })
      }
    },
    computed: {
      phoneData: {
        get() {
          return { ...this.value };
        },
        set(val) {
          this.$emit('input', { ...val });
        }
      }
    },
    data() {
      // 手机号校验
      const validatePhone = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('account.account_1025')));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            callback(new Error(this.$t('account.account_1069')));
          } else {
            callback();
          }
        }
      };

      // 易盾校验
      const validateImgCode = (rule, value, callback) => {
        if (!value) {
          callback(new Error(this.$t('account.account_1028')));
        } else {
          callback();
        }
      };

      // 验证码校验
      const validateCode = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('account.account_1070')));
        } else {
          callback();
        }
      };

      return {
        useUserServer: {},
        setPhoneForm: {
          phone: '', // 手机号
          imgCode: null, // 易盾验证码
          code: '', // 验证码
          scene_id: 2 // 场景id
        }, // 未设置手机号的表单
        setFormRules: {
          phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
          imgCode: [{ required: true, validator: validateImgCode, trigger: 'change' }],
          code: [{ required: true, validator: validateCode, trigger: 'blur' }]
        }, // 未设置手机号的表单校验规则
        timer: null, // 倒计时定时器
        countTime: 60 // 倒计时的时间
      };
    },
    created() {
      this.useUserServer = useUserServer();
    },
    methods: {
      // 弹窗关闭
      dialogClose() {
        this.phoneData.dialogShow = false;
        this.$emit('input', { ...this.phoneData });
        this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
        this.$refs.setPhoneForm?.resetFields(); // 重置表单
        this.initInterval(); // 初始化定时器
      },
      // 获取验证码
      getCaptha() {
        const validateList = [];
        const validateProps = this.phoneData.step === 1 ? ['imgCode'] : ['phone', 'imgCode'];
        this.$refs.setPhoneForm.validateField(validateProps, valid => {
          validateList.push(valid);
        });
        if (validateList.every(item => item === '')) {
          const data = !(this.phoneData.type == 'edit' && this.phoneData.step === 1)
            ? this.setPhoneForm.phone
            : this.phoneData.phone;
          const validate = this.setPhoneForm.imgCode;
          const scene_id = this.setPhoneForm.scene_id;
          // scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
          this.useUserServer
            .sendPhoneCode({
              type: 1,
              scene_id,
              data,
              validate
            })
            .then(res => {
              if (res && res.code === 200) {
                this.initInterval();
                this.timer = setInterval(() => {
                  this.countTime--;
                  if (this.countTime === 0) {
                    this.initInterval();
                  }
                }, 1000);
              } else {
                this.$message({
                  message: this.$tec(res.code) || this.$t('account.account_1051'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
                this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
              }
            })
            .catch(res => {
              this.$message({
                message: this.$tec(res.code) || this.$t('account.account_1051'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
              // 图片验证码重置
              this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
            });
        }
      },
      // 未绑定手机号 立即设置按钮
      setPhoneHandler() {
        this.$refs.setPhoneForm.validate(valid => {
          if (valid) {
            this.useUserServer
              .codeCheck({
                type: 1,
                data: this.setPhoneForm.phone,
                code: this.setPhoneForm.code,
                scene_id: this.setPhoneForm.scene_id
              })
              .then(res => {
                if (res && res.code == 200 && res.data.check_result === 1) {
                  this.bindPhoneSave(res.data.key);
                } else {
                  this.$message({
                    message: this.$tec(res.code) || this.$t('account.account_1052'),
                    showClose: true,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                this.$message({
                  message: this.$tec(res.code) || this.$t('account.account_1052'),
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        });
      },

      // 下一步按钮
      checkOldPhoneHandler() {
        this.$refs.setPhoneForm.validate(valid => {
          if (valid) {
            const params = {
              type: 1,
              data: this.phoneData.phone,
              code: this.setPhoneForm.code,
              scene_id: this.setPhoneForm.scene_id
            };
            this.useUserServer
              .codeCheck(params)
              .then(async res => {
                if (res && res.code == 200 && res.data.check_result === 1) {
                  this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
                  this.$refs.setPhoneForm?.resetFields(); // 重置表单
                  this.initInterval(); // 初始化定时器
                  // 验证码第一步，继续下一步
                  this.phoneData.step = 2;
                  this.$emit('input', { ...this.phoneData });
                } else {
                  this.$message({
                    message: this.$tec(res.code) || this.$t('account.account_1054'),
                    showClose: true,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                this.$message({
                  message: this.$tec(res.code) || this.$t('account.account_1054'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        });
      },

      // 完成按钮
      editPhoneHandler() {
        this.$refs.setPhoneForm.validate(valid => {
          if (valid) {
            const params = {
              type: 1,
              data: this.setPhoneForm.phone,
              code: this.setPhoneForm.code,
              scene_id: this.setPhoneForm.scene_id
            };
            this.useUserServer
              .codeCheck(params)
              .then(res => {
                if (res && res.code == 200 && res.data.check_result === 1) {
                  this.bindPhoneSave(res.data.key);
                } else {
                  this.$message({
                    message: this.$tec(res.code) || this.$t('account.account_1052'),
                    showClose: true,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                this.$message({
                  message: this.$tec(res.code) || this.$t('account.account_1052'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        });
      },

      // 绑定手机号事件
      bindPhoneSave(key) {
        this.useUserServer
          .bindInfo({
            type: 1,
            account: this.setPhoneForm.phone,
            code: this.setPhoneForm.code,
            scene_id: this.setPhoneForm.scene_id,
            key
          })
          .then(res => {
            if (res && res.code == 200) {
              this.$message({
                message: this.$t('account.account_1053'),
                showClose: true,
                type: 'success',
                customClass: 'zdy-info-box'
              });
              if (this.phoneData.type === 'edit') {
                // 修改手机号，重新登录
                window.localStorage.clear();
                window.sessionStorage.clear();
                this.$nextTick(() => {
                  window.location.reload();
                });
              } else {
                // 关闭当前弹出框
                this.phoneData.dialogShow = false;
                this.$emit('input', { phone: this.setPhoneForm.phone, ...this.phoneData });
                this.$emit('bound');
              }
            } else {
              this.$message({
                message: this.$tec(res.code) || this.$t('account.account_1054'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            }
          })
          .catch(res => {
            this.$message({
              message: this.$tec(res.code) || this.$t('account.account_1054'),
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          });
      },

      // 初始化定时器
      initInterval() {
        clearInterval(this.timer);
        this.timer = null;
        this.countTime = 60;
      }
    }
  };
</script>

<style lang="less">
  /* 设置手机号 or 修改手机号 */
  .vmp-user-account-phone {
    .vmp-user-account-phone-wrap {
      .el-form-item.is-success .el-input__inner {
        border-color: #cccccc;
        &:hover {
          border-color: @phone-color;
        }
      }
      .el-dialog {
        max-height: 480px;
        height: auto;
        padding-bottom: 32px;
        border-radius: 4px;
      }
      .el-dialog__body {
        height: auto;
      }
      &.phone-edit {
        .el-dialog__body {
          height: auto;
        }
      }
      .el-form-item {
        margin-bottom: 16px;
        &.vhsaas-box__msg__error__bottom {
          margin-bottom: 30px;
        }
        &.is-error {
          margin-bottom: 30px;
        }
        &.vhsaas-box__msg__error {
          margin-bottom: 30px;
        }
      }
      @phone-color: #1a1a1a;
      @phone-notice: #fb3a32;
      .vmp-user-account__sTitle {
        font-size: 14px;
        font-weight: 400;
        color: @phone-color;
        line-height: 20px;
        margin-bottom: 24px;
      }
      .vmp-user-account__eTitle {
        font-size: 14px;
        font-weight: 400;
        color: @phone-color;
        line-height: 20px;
        margin-bottom: 12px;
      }
      .vmp-user-account__eNotice {
        font-size: 14px;
        font-weight: 400;
        color: #fb3a32;
        line-height: 20px;
        height: 47px;
      }
      .vmp-user-account-redonly {
        .el-form-item__content {
          font-size: 14px;
          font-weight: 400;
          color: @phone-color;
          line-height: 20px;
        }
      }
      .vmp-user-account-wrap__code {
        position: relative;
        .el-input__suffix {
          margin-right: 80px;
        }
      }
      .vmp-user-account-wrap__code__btn {
        position: absolute;
        right: 10px;
        top: 0;
        border-radius: 4px;
        border: none;
        outline: none;
        height: 40px;
        font-size: 14px;
        font-weight: 400;
        line-height: 40px;
        text-align: right;
        &.disabled {
          cursor: not-allowed;
          color: #999999;
        }
        &.start {
          cursor: pointer;
          color: #fb3a32;
        }
        &.pending {
          cursor: not-allowed;
          color: #999999;
        }
      }

      .vmp-user-account-phone__length-max {
        width: 100%;
        height: 40px;
        border-radius: 20px;
      }
      .vmp-user-account-phone__red__button {
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
    }
  }
</style>
