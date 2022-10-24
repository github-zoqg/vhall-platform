<template>
  <!-- 设置密码 -->
  <div class="vmp-user-account-pwd">
    <el-dialog
      :visible.sync="dialogShow"
      width="365px"
      :title="pwdData.type == 'add' ? $t('account.account_1017') : $t('account.account_1016')"
      :class="pwdData.type == 'edit' ? 'vmp-user-account-pwd pwd-edit' : 'vmp-user-account-pwd'"
      :close-on-click-modal="false"
      @opened="dialogOpened"
      append-to-body
      @close="onDialogClose"
      :destroy-on-close="true"
    >
      <div class="vmp-user-account-pwd-wrap">
        <el-form ref="pwdForm" :model="pwdForm" :rules="pwdFormRules" label-width="0">
          <div v-if="pwdData.type == 'edit'" class="vmp-user-account-pwd__eTitle">
            <span>{{ $t('account.account_1038') }}</span>
            <el-button type="text" @click="toForgetPwd">
              {{ $t('login.login_1012') + '?' }}
            </el-button>
          </div>
          <p v-else class="vmp-user-account-pwd__sTitle">{{ $t('account.account_1038') }}</p>
          <el-form-item v-if="pwdData.type == 'edit'" key="old_pwd" prop="old_pwd">
            <el-input
              type="password"
              v-model.trim="pwdForm.old_pwd"
              clearable
              :placeholder="!pwdCaptVo.old_pwd_focus ? $t('account.account_1039') : ''"
              :maxlength="30"
              auto-complete="off"
              onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
              style="ime-mode: disabled"
              :isPasswordVisible="!pwdCaptVo.old_pwd_show"
              @focus="handleFocus('old_pwd_focus')"
              @blur="handleBlur('old_pwd_focus')"
            >
              <span slot="suffix" class="closePwd" @click="changePwdType('old_pwd_show')">
                <i
                  v-show="pwdCaptVo.old_pwd_show"
                  slot="suffix"
                  style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
                  class="vh-iconfont vh-line-hidden"
                ></i>
                <i
                  v-show="!pwdCaptVo.old_pwd_show"
                  slot="suffix"
                  style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
                  class="vh-iconfont vh-line-view"
                ></i>
              </span>
            </el-input>
          </el-form-item>
          <el-form-item key="pasword" prop="password">
            <el-input
              type="password"
              v-model.trim="pwdForm.password"
              clearable
              :placeholder="
                !pwdCaptVo.pwd_focus
                  ? pwdData.type == 'edit'
                    ? $t('account.account_1040')
                    : $t('account.account_1041')
                  : ''
              "
              :maxlength="30"
              auto-complete="off"
              onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
              style="ime-mode: disabled"
              :isPasswordVisible="!pwdCaptVo.pwd_show"
              @focus="handleFocus('pwd_focus')"
              @blur="handleBlur('pwd_focus')"
            >
              <span slot="suffix" class="closePwd" @click="changePwdType('pwd_show')">
                <i
                  v-show="pwdCaptVo.pwd_show"
                  slot="suffix"
                  style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
                  class="vh-iconfont vh-line-hidden"
                ></i>
                <i
                  v-show="!pwdCaptVo.pwd_show"
                  slot="suffix"
                  style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
                  class="vh-iconfont vh-line-view"
                ></i>
              </span>
            </el-input>
          </el-form-item>
          <el-form-item key="new_password" prop="new_password">
            <el-input
              type="password"
              v-model.trim="pwdForm.new_password"
              clearable
              :placeholder="
                !pwdCaptVo.new_pwd_focus
                  ? pwdData.type == 'edit'
                    ? $t('account.account_1042')
                    : $t('account.account_1043')
                  : ''
              "
              :maxlength="30"
              auto-complete="off"
              onkeyup="this.value=this.value.replace(/[\u4E00-\u9FA5]/g,'')"
              style="ime-mode: disabled"
              :isPasswordVisible="!pwdCaptVo.new_pwd_show"
              @focus="handleFocus('new_pwd_focus')"
              @blur="handleBlur('new_pwd_focus')"
            >
              <span slot="suffix" class="closePwd" @click="changePwdType('new_pwd_show')">
                <i
                  v-show="pwdCaptVo.new_pwd_show"
                  slot="suffix"
                  style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
                  class="vh-iconfont vh-line-hidden"
                ></i>
                <i
                  v-show="!pwdCaptVo.new_pwd_show"
                  slot="suffix"
                  style="display: inline-block; font-size: 14px; margin-right: 5px; cursor: pointer"
                  class="vh-iconfont vh-line-view"
                ></i>
              </span>
            </el-input>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button
            v-preventReClick
            class="vmp-user-account-pwd__red__button vmp-user-account-pwd__length-max"
            @click="editPwdHandler"
          >
            {{ $t('account.account_1037') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  // import PwdInput from './pwd-input.vue';
  import { useUserServer } from 'middle-domain';
  export default {
    // components: {
    //   PwdInput
    // },
    props: {
      value: {
        type: Boolean,
        default: false
      },
      pwdData: {
        type: Object,
        default: () => ({
          type: 'add'
        })
      }
    },
    data() {
      const verifyEnterPwd = (rule, value, callback) => {
        const pattern = /^([0-9a-zA-Z_`!~@#$%^*+=,.?;'":)(}{/\\|<>&[-]|]){6,30}$/;
        if (value === '') {
          callback(new Error(this.$t('appointment.appointment_1022')));
        } else if (!pattern.exec(value)) {
          callback(new Error(this.$t('account.account_1072')));
        } else {
          callback();
        }
      };
      const verifyAgainEnterPwd = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('account.account_1073')));
          // this.isReset = true;
        } else if (value !== this.pwdForm.password) {
          callback(new Error(this.$t('account.account_1074')));
          // this.isReset = true;
        } else {
          callback();
          // this.isReset = false;
        }
      };
      return {
        pwdForm: {
          old_pwd: '',
          password: '',
          new_password: ''
        },
        pwdFormRules: {
          old_pwd: [
            { required: true, trigger: 'blur', validator: verifyEnterPwd, min: 6, max: 30 }
          ],
          password: [
            { required: true, trigger: 'blur', validator: verifyEnterPwd, min: 6, max: 30 }
          ],
          new_password: [
            { required: true, trigger: 'blur', validator: verifyAgainEnterPwd, min: 6, max: 30 }
          ]
        },
        pwdCaptVo: {
          old_pwd_show: true,
          pwd_show: true,
          new_pwd_show: true,
          old_pwd_focus: false,
          pwd_focus: false,
          new_pwd_focus: false
        },
        dialogShow: false,
        useUserServer: {}
      };
    },
    watch: {
      value(val) {
        this.dialogShow = val;
        this.$emit('input', val);
      }
    },
    created() {
      this.useUserServer = useUserServer();
    },
    methods: {
      // 修改密码
      editPwdHandler() {
        this.$refs.pwdForm.validate(async valid => {
          if (valid) {
            console.log(this.useUserServer.state);
            const params = {
              old_password: this.pwdForm.old_pwd || '',
              password: this.pwdForm.password,
              confirm_password: this.pwdForm.new_password,
              scene_id: this.pwdData.type === 'add' ? 9 : 10 // 1账户信息-修改密码  4忘记密码-邮箱方式找回 5忘记密码-短信方式找回 9设置密码（密码不存在情况）10账户信息-修改密码(不需要发送验证码)
            };
            this.useUserServer
              .resetPassword(params)
              .then(res => {
                if (res && res.code == 200) {
                  this.$message({
                    message: this.$t('account.account_1059'),
                    showClose: true,
                    // duration: 0,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  // 密码修改完成后，刷新页面
                  window.localStorage.clear();
                  window.sessionStorage.clear();
                  // this.setIsLogin(false); // 更新登录状态
                  this.$nextTick(() => {
                    window.location.reload();
                  });
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
                console.log(res);
                this.$message({
                  message: this.$tec(res.code) || res.msg,
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        });
      },
      handleFocus(key) {
        this.pwdCaptVo[key] = true;
      },
      handleBlur(key) {
        this.pwdCaptVo[key] = false;
      },
      changePwdType(key) {
        console.log(`当前changePwdType==>>>key${key}`);
        this.pwdCaptVo[key] = !this.pwdCaptVo[key];
      },
      toForgetPwd() {
        const { href } = this.$router.resolve({ path: '/forgetPwd' });
        window.open(href, '_blank');
      },
      dialogOpened() {
        // this.$refs['pwdForm'].clearValidate();
        console.log('warn: 重置方法在关闭事件重写了');
      },
      // 关闭弹窗重置表单
      onDialogClose() {
        this.$refs['pwdForm'].resetFields();
        this.dialogShow = false;
        this.$emit('input', false);
      }
    }
  };
</script>

<style lang="less">
  /* 设置密码 or 修改密码 */
  .vmp-user-account-pwd {
    .el-input__inner {
      padding-right: 65px !important; // 覆盖输入框样式
    }
    .vmp-user-account-pwd-wrap {
      .el-dialog {
        max-height: 480px;
        height: auto;
        padding-bottom: 32px;
        border-radius: 4px;
      }
      .el-dialog__body {
        height: 196px;
      }
      &.pwd-edit {
        .el-dialog__body {
          height: 252px;
        }
      }
      .el-form-item {
        margin-bottom: 22px;
      }
      @phone-color: #1a1a1a;
      @phone-notice: #fb3a32;
      .vmp-user-account-pwd__sTitle {
        font-size: 14px;
        font-weight: 400;
        color: @phone-color;
        line-height: 20px;
        margin-bottom: 24px;
      }
      .vmp-user-account-pwd__eTitle {
        font-size: 14px;
        font-weight: 400;
        color: @phone-color;
        line-height: 20px;
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .el-button--text {
          color: #3562fa;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;
          padding: 0 0;
        }
      }

      .vmp-user-account-pwd__length-max {
        width: 100%;
        height: 40px;
        border-radius: 20px;
      }
      .vmp-user-account-pwd__red__button {
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
    .iconxianshi {
      width: 32px;
    }
  }
</style>
