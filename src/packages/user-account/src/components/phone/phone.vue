<template>
  <!-- 设置手机号 -->
  <el-dialog
    :visible.sync="dialogShow"
    width="365px"
    :title="phoneData.type == 'add' ? $t('account.account_1024') : $t('account.account_1026')"
    :class="
      phoneData.type == 'edit' && phoneData.step == 1
        ? 'vmp-user-account-phone phone-edit'
        : 'vmp-user-account-phone'
    "
    :close-on-click-modal="false"
    @opened="dialogOpened"
    append-to-body
    @close="onDialogClose"
    :destroy-on-close="true"
  >
    <div class="vmp-user-account-phone-wrap">
      <template v-if="phoneData.type == 'add'">
        <el-form ref="setPhoneForm" :model="setPhoneForm" :rules="setFormRules" label-width="0">
          <!-- 设置手机号 (手机号、图形码、动态密码)-->
          <p class="vmp-user-account__sTitle">{{ $t('account.account_1027') }}</p>
          <el-form-item key="phone" prop="phone">
            <el-input
              v-model.trim="setPhoneForm.phone"
              auto-complete="off"
              :placeholder="$t('account.account_1025')"
              :maxlength="11"
            />
          </el-form-item>
          <el-form-item id="captcha-box">
            <div id="captcha_add_1" class="vhsaas-yundun-captcha">
              <el-input v-model.trim="setPhoneForm.imgCode"></el-input>
            </div>
            <span v-if="phoneCaptVo.eMsg_add_1" class="vhsaas-form-error">
              {{ $t('account.account_1028') }}
            </span>
          </el-form-item>
          <el-form-item
            key="code"
            prop="code"
            :class="[
              'vmp-user-account-wrap__code',
              { 'vhsaas-box__msg__error': phoneCaptVo.codeErr_add_1 != '' }
            ]"
          >
            <el-input
              v-model.trim="setPhoneForm.code"
              clearable
              type="captcha"
              :maxlength="6"
              :placeholder="$t('account.account_1029')"
            ></el-input>
            <span
              type="danger"
              :disabled="phoneCaptVo.btnCtrl_add_1 == 'disabled'"
              :class="['vmp-user-account-wrap__code__btn', phoneCaptVo.btnCtrl_add_1]"
              @click.stop.prevent="getCaptha('setPhoneForm', 'code')"
            >
              {{
                phoneCaptVo.sendCode_add_1
                  ? $t('account.account_1031', { n: phoneCaptVo.time_add_1 })
                  : $t('account.account_1030')
              }}
            </span>
            <!-- TODO 可能注释掉 -->
            <span v-if="phoneCaptVo.codeErr_add_1 != ''" class="vhsaas-form-error">
              {{ phoneCaptVo.codeErr_add_1 }}
            </span>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="phoneData.type == 'edit'">
        <template v-if="phoneData.step == 1">
          <el-form ref="checkForm" :model="checkForm" :rules="checkFormRules" label-width="0">
            <!-- 设置手机号第一步 -->
            <p class="vmp-user-account__eTitle">{{ $t('account.account_1032') }}</p>
            <p class="vmp-user-account__eNotice">{{ $t('account.account_1033') }}</p>
            <el-form-item key="phone" prop="phone" class="vmp-user-account-redonly">
              <span>{{ phoneData.phone || '' }}</span>
            </el-form-item>
            <el-form-item
              id="captcha-box"
              :class="phoneCaptVo.eMsg_edit_1 ? 'vhsaas-box__msg__error__bottom' : ''"
            >
              <div id="captcha_edit_1" class="vhsaas-yundun-captcha">
                <el-input v-model.trim="checkForm.imgCode"></el-input>
              </div>
              <span v-if="phoneCaptVo.eMsg_edit_1" class="vhsaas-form-error">
                {{ $t('account.account_1028') }}
              </span>
            </el-form-item>
            <el-form-item
              key="code"
              prop="code"
              :class="[
                'vmp-user-account-wrap__code',
                { 'vhsaas-box__msg__error': phoneCaptVo.codeErr_edit_1 != '' }
              ]"
            >
              <el-input
                v-model.trim="checkForm.code"
                clearable
                type="captcha"
                :maxlength="6"
                :placeholder="$t('account.account_1029')"
              ></el-input>
              <span
                type="danger"
                :disabled="phoneCaptVo.btnCtrl_edit_1 == 'disabled'"
                :class="['vmp-user-account-wrap__code__btn', phoneCaptVo.btnCtrl_edit_1]"
                @click.stop.prevent="getCaptha('checkForm', 'code')"
              >
                {{
                  phoneCaptVo.sendCode_edit_1
                    ? $t('account.account_1031', { n: phoneCaptVo.time_edit_1 })
                    : $t('account.account_1030')
                }}
              </span>
              <!-- TODO 可能注释掉 -->
              <span v-if="phoneCaptVo.codeErr_edit_1 != ''" class="vhsaas-form-error">
                {{ phoneCaptVo.codeErr_edit_1 }}
              </span>
            </el-form-item>
          </el-form>
        </template>
        <template v-if="phoneData.step == 2">
          <el-form
            ref="editPhoneForm"
            :model="editPhoneForm"
            :rules="editFormRules"
            label-width="0"
          >
            <!-- 设置手机号第二步 -->
            <p class="vmp-user-account__eTitle">{{ $t('account.account_1034') }}</p>
            <el-form-item key="phone2" prop="phone">
              <el-input
                v-model.trim="editPhoneForm.phone"
                auto-complete="off"
                clearable
                :placeholder="$t('account.account_1025')"
                :maxlength="11"
              />
            </el-form-item>
            <el-form-item
              id="captcha-box"
              :class="phoneCaptVo.eMsg_edit_2 ? 'vhsaas-box__msg__error__bottom' : ''"
            >
              <div id="captcha_edit_2" class="vhsaas-yundun-captcha">
                <el-input v-model.trim="editPhoneForm.imgCode"></el-input>
              </div>
              <span v-if="phoneCaptVo.eMsg_edit_2" class="vhsaas-form-error">
                {{ $t('account.account_1028') }}
              </span>
            </el-form-item>
            <el-form-item
              key="code2"
              prop="code"
              :class="[
                'vmp-user-account-wrap__code',
                { 'vhsaas-box__msg__error': phoneCaptVo.codeErr_edit_2 != '' }
              ]"
            >
              <el-input
                v-model.trim="editPhoneForm.code"
                clearable
                type="captcha"
                :maxlength="6"
                :placeholder="$t('account.account_1029')"
              ></el-input>
              <span
                type="danger"
                :disabled="phoneCaptVo.btnCtrl_edit_2 == 'disabled'"
                :class="['vmp-user-account-wrap__code__btn', phoneCaptVo.btnCtrl_edit_2]"
                @click.stop.prevent="getCaptha('editPhoneForm', 'code')"
              >
                {{
                  phoneCaptVo.sendCode_edit_2
                    ? $t('account.account_1031', { n: phoneCaptVo.time_edit_2 })
                    : $t('account.account_1030')
                }}
              </span>
              <!-- TODO 可能注释掉 -->
              <span v-if="phoneCaptVo.codeErr_edit_2 != ''" class="vhsaas-form-error">
                {{ phoneCaptVo.codeErr_edit_2 }}
              </span>
            </el-form-item>
          </el-form>
        </template>
      </template>
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
          v-if="phoneData.type == 'edit' && phoneData.step == 1"
          v-preventReClick
          class="vmp-user-account-phone__red__button vmp-user-account-phone__length-max"
          @click="checkOldPhoneHandler"
        >
          {{ $t('account.account_1036') }}
        </el-button>
        <el-button
          v-if="phoneData.type == 'edit' && phoneData.step == 2"
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
  import { useUserServer } from 'middle-domain';
  export default {
    props: {
      value: {
        type: Boolean,
        default: false
      },
      phoneData: {
        type: Object,
        default: () => ({
          type: 'add',
          step: 1,
          phone: ''
        })
      }
    },
    data() {
      const validatePhone = (rule, value, callback) => {
        // this.phoneError = value === '' || !(/^1[0-9]{10}$/.test(value))
        // this.isShowPhoneErr = value === '' || !(/^1[0-9]{10}$/.test(value))
        if (value === '') {
          this.phoneCaptVo.btnCtrl_add_1 = 'disabled'; // 验证失败，禁用
          callback(new Error(this.$t('account.account_1025')));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            this.phoneCaptVo.btnCtrl_add_1 = 'disabled'; // 验证失败，禁用
            callback(new Error(this.$t('account.account_1069')));
          } else {
            if (this.phoneCaptVo.mKey_add_1) {
              this.phoneCaptVo.btnCtrl_add_1 = 'start'; // 验证成功，启用
            } else {
              this.phoneCaptVo.btnCtrl_add_1 = 'disabled';
            }
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

      const validateCaptchasEdit = (rule, value, callback) => {
        if (value === '') {
          if (this.phoneCaptVo.codeErr_edit_2 != '') {
            callback();
          } else {
            callback(new Error(this.$t('account.account_1070')));
          }
        } else {
          callback();
        }
      };

      const validateEditPhone = (rule, value, callback) => {
        // this.phoneError = value === '' || !(/^1[0-9]{10}$/.test(value))
        // this.isShowPhoneErr = value === '' || !(/^1[0-9]{10}$/.test(value))
        if (value === '') {
          this.phoneCaptVo.btnCtrl_edit_2 = 'disabled'; // 验证失败，禁用
          callback(new Error(this.$t('account.account_1025')));
        } else {
          if (!/^1[0-9]{10}$/.test(value)) {
            this.phoneCaptVo.btnCtrl_edit_2 = 'disabled'; // 验证失败，禁用
            callback(new Error(this.$t('account.account_1069')));
          } else {
            if (this.phoneCaptVo.mKey_edit_2) {
              this.phoneCaptVo.btnCtrl_edit_2 = 'start'; // 验证成功，启用
            } else {
              this.phoneCaptVo.btnCtrl_edit_2 = 'disabled';
            }
            callback();
          }
        }
      };
      return {
        captchaKey: 'b7982ef659d64141b7120a6af27e19a0', // 云盾key
        phoneCaptVo: {
          capDom_add_1: '', // 云盾实例（设置手机号）
          capDom_edit_1: '', // 云盾实例（修改手机号-第一步）
          capDom_edit_2: '', // 云盾实例（修改手机号-第二步）
          eMsg_add_1: '', // 是否提示图片验证码错误（设置手机号）
          eMsg_edit_1: '', // 是否提示图片验证码错误（修改手机号-第一步）
          eMsg_edit_2: '', // 是否提示图片验证码错误（修改手机号-第二步）
          mKey_add_1: '', // 选择图片验证码后的key值（设置手机号）
          mKey_edit_1: '', // 选择图片验证码后的key值（修改手机号-第一步）
          mKey_edit_2: '', // 选择图片验证码后的key值（修改手机号-第二步）
          checkKey_add_1: '', // 短信验证码校验通过后的回调key（设置手机号）
          checkKey_edit_1: '', // 短信验证码校验通过后的回调key（设置手机号）
          checkKey_edit_2: '', // 短信验证码校验通过后的回调key（设置手机号）
          time_add_1: 60, // 验证码倒计时（设置手机号）
          time_edit_1: 60, // 验证码倒计时（修改手机号-第一步）
          time_edit_2: 60, // 验证码倒计时（修改手机号-第二步）
          timeInterval_add_1: null, // 验证码-计时器（设置手机号）
          timeInterval_edit_1: null, // 验证码-计时器（修改手机号-第一步）
          timeInterval_edit_2: null, // 验证码-计时器（修改手机号-第二步）
          codeErr_add_1: '', // 验证码发送前，手机号验证异常文案（设置手机号）
          codeErr_edit_1: '', // 验证码发送前，手机号验证异常文案（修改手机号-第一步）
          codeErr_edit_2: '', // 验证码发送前，手机号验证异常文案（修改手机号-第二步）
          btnCtrl_add_1: 'disabled', // 按钮的置灰 disabled - 禁用；start - 待发送；pending - 发送中（设置手机号）
          btnCtrl_edit_1: 'disabled', // 按钮的置灰 disabled - 禁用；start - 待发送；pending - 发送中（修改手机号-第一步）
          btnCtrl_edit_2: 'disabled', // 按钮的置灰 disabled - 禁用；start - 待发送；pending - 发送中（修改手机号-第二步）
          sendCode_add_1: false, // 是否是发送验证码（设置手机号）
          sendCode_edit_1: false, // 是否是发送验证码（修改手机号-第一步）
          sendCode_edit_2: false // 是否是发送验证码（修改手机号-第二步）
        },
        /** *********设置手机号相关-start***************/
        setPhoneForm: {
          phone: '',
          imgCode: '',
          code: '',
          scene_id: 2
        },
        setPhoneTime: 60,
        setFormRules: {
          phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
          code: [{ required: true, validator: validateCaptchas, trigger: 'blur' }]
        },
        /** *********设置手机号相关-end***************/
        /** *********修改绑定手机号-start***************/
        checkForm: {
          phone: '',
          imgCode: '',
          code: '',
          scene_id: 2
        },
        checkFormRules: {
          code: [{ required: true, validator: validateCaptchas, trigger: 'blur' }]
        },
        editPhoneForm: {
          phone: '',
          imgCode: '',
          code: '',
          scene_id: 2
        },
        ePhoneTime: 60,
        editFormRules: {
          phone: [{ required: true, validator: validateEditPhone, trigger: 'blur' }],
          code: [{ required: true, validator: validateCaptchasEdit, trigger: 'blur' }]
        },
        /** *********修改绑定手机号-end***************/
        dialogShow: false, // 控制弹窗显示隐藏
        useUserServer: {}
      };
    },
    created() {
      this.useUserServer = useUserServer()
    },
    watch: {
      value(val) {
        this.dialogShow = val;
        this.$emit('input', val);
      }
    },
    methods: {
      // 发送验证码
      getCaptha(formName, codeKey) {
        console.log(`PC-account-dialog>>>${formName},${codeKey}`);
        // 发送验证码状态
        const btnCtrlKey = `btnCtrl_${this.phoneData.type}_${this.phoneData.step}`;
        // 是否可以发送验证码
        const sendCodeDisabledKey = `sendCode_${this.phoneData.type}_${this.phoneData.step}`;
        // 验证码倒计时
        const timeKey = `time_${this.phoneData.type}_${this.phoneData.step}`;
        // 验证码计时器
        const timeIntervalKey = `timeInterval_${this.phoneData.type}_${this.phoneData.step}`;
        // 验证码发送前，手机号验证
        const codeErrKey = `codeErr_${this.phoneData.type}_${this.phoneData.step}`;
        // 验证码发送前，图片验证码
        const successMsgCodeKey = `mKey_${this.phoneData.type}_${this.phoneData.step}`;
        // 图片验证码ID
        const keyName = `captcha_${this.phoneData.type}_${this.phoneData.step}`;
        if (this.phoneCaptVo[btnCtrlKey] === 'disabled') {
          return;
        }
        if (!(this.phoneData.type == 'edit' && this.phoneData.step == 1)) {
          const mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
          if (!this[formName].phone) {
            this.phoneCaptVo[codeErrKey] = this.$t('account.account_1049');
            // 清空表单验证码错误提示
            this.$nextTick(() => {
              this.$refs[formName].clearValidate([codeKey]);
            });
            return;
          } else if (!mobileReg.test(this[formName].phone)) {
            this.phoneCaptVo[codeErrKey] = this.$t('account.account_1050');
            // 清空表单验证码错误提示
            this.$nextTick(() => {
              this.$refs[formName].clearValidate([codeKey]);
            });
            return;
          } else {
            this.phoneCaptVo[codeErrKey] = '';
          }
        } else {
          this.phoneCaptVo[codeErrKey] = '';
        }
        if (this.phoneCaptVo[timeIntervalKey]) {
          clearInterval(this.phoneCaptVo[timeIntervalKey]);
          this.phoneCaptVo[timeIntervalKey] = null;
        }

        // 获取验证码
        this.useUserServer.state.captchaVal = this.phoneCaptVo[successMsgCodeKey];
        this.useUserServer.sendCode(this.phoneData.type === 'edit' ? this.phoneData.phone : this[formName].phone, 2)
          .then(res => {
            if (res && res.code == 200) {
              this.phoneCaptVo[btnCtrlKey] = 'pending';
              this.phoneCaptVo[sendCodeDisabledKey] = true;
              if (this.phoneCaptVo[timeIntervalKey]) {
                clearInterval(this.phoneCaptVo[timeIntervalKey]);
                this.phoneCaptVo[timeIntervalKey] = null;
              }
              this.phoneCaptVo[timeIntervalKey] = setInterval(() => {
                if (this.phoneCaptVo[timeKey] > 0) {
                  this.phoneCaptVo[timeKey]--;
                } else {
                  if (this.phoneCaptVo[timeIntervalKey]) {
                    clearInterval(this.phoneCaptVo[timeIntervalKey]);
                    this.phoneCaptVo[timeIntervalKey] = null;
                  }
                  this.phoneCaptVo[sendCodeDisabledKey] = false;
                  this.phoneCaptVo[timeKey] = 60;
                  this.phoneCaptVo[btnCtrlKey] = 'start';
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
              this.phoneCaptVo[btnCtrlKey] = 'disabled';
              // 图片验证码重置
              this.callCaptcha(formName, `${keyName}`);
            }
          })
          .catch(res => {
            this.$message({
              message: this.$tec(res.code) || res.msg || this.$t('account.account_1051'),
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
            this.phoneCaptVo[btnCtrlKey] = 'disabled';
            // 图片验证码重置
            this.callCaptcha(formName, `${keyName}`);
          });
      },
      // 初始化网易-易盾图片验证码
      callCaptcha(formName, elementKey = null) {
        try {
          const that = this;
          const keyName =
            elementKey == null
              ? `captcha_${that.phoneData.type}_${that.phoneData.step}`
              : elementKey;
          // 发送验证码状态
          const btnCtrlKey = `btnCtrl_${that.phoneData.type}_${that.phoneData.step}`;
          const catp = document.getElementById(keyName);
          if (!catp) {
            // 若是初始化不了图片验证码，图片验证码设置为空
            that.phoneCaptVo[`capDom_${that.phoneData.type}_${that.phoneData.step}`] = '';
            that.phoneCaptVo[`eMsg_${that.phoneData.type}_${that.phoneData.step}`] = true;
            return;
          }
          // eslint-disable-next-line
          initNECaptcha({
            captchaId: that.captchaKey,
            element: `#${keyName}`,
            mode: 'float',
            //  lang: this.languages.lang, TODO
            onReady(instance) {
              console.log('instance', instance);
            },
            onVerify(err, data) {
              if (data) {
                that.phoneCaptVo[btnCtrlKey] = 'start'; // 验证失败，禁用
                that[formName].imgCode = data.validate;
                that.phoneCaptVo[`mKey_${that.phoneData.type}_${that.phoneData.step}`] =
                  data.validate;
                that.phoneCaptVo[`eMsg_${that.phoneData.type}_${that.phoneData.step}`] = false;
              } else {
                that.phoneCaptVo[`capDom_${that.phoneData.type}_${that.phoneData.step}`] = '';
                console.log('errr>>>', err);
                that.phoneCaptVo[`eMsg_${that.phoneData.type}_${that.phoneData.step}`] = true;
              }
            },
            onload(instance) {
              console.log('onload', instance);
              that.phoneCaptVo[`capDom_${that.phoneData.type}_${that.phoneData.step}`] = instance;
            }
          });
        } catch (e) {
          console.log(e);
        }
      },
      // 立即设置手机号
      setPhoneHandler() {
        const checkKey = `checkKey_${this.phoneData.type}_${this.phoneData.step}`;
        this.$refs.setPhoneForm.validate(valid => {
          if (valid) {
            // 先验证验证码结果，再实际绑定为新手机号
            this.useUserServer
              .codeCheck({
                type: 1,
                data: this.setPhoneForm.phone,
                code: this.setPhoneForm.code,
                scene_id: this.setPhoneForm.scene_id
              })
              .then(res => {
                if (res && res.code == 200 && res.data.check_result > 0) {
                  this.phoneCaptVo[checkKey] = res.data.key;
                  this.bindPhoneSave('setPhoneForm');
                } else {
                  this.$message({
                    message: this.$tec(res.code) || res.msg || this.$t('account.account_1052'),
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
                  message: this.$tec(res.code) || res.msg || this.$t('account.account_1052'),
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        });
      },
      // 设置手机号 / 修改手机号 =>> （绑定）
      bindPhoneSave(formName) {
        const checkKey = `checkKey_${this.phoneData.type}_${this.phoneData.step}`;
        // 确认绑定新功能
        this.useUserServer
          .bindInfo({
            type: 1,
            account: this[formName].phone,
            code: this[formName].code,
            scene_id: this[formName].scene_id,
            key: this.phoneCaptVo[checkKey]
          })
          .then(res => {
            if (res && res.code == 200) {
              this.$message({
                message: this.$t('account.account_1053'),
                showClose: true,
                // duration: 0,
                type: 'success',
                customClass: 'zdy-info-box'
              });
              if (formName == 'editPhoneForm') {
                // 修改手机号，重新登录
                window.localStorage.clear();
                window.sessionStorage.clear();
                // this.setIsLogin(false); // 更新登录状态
                this.$nextTick(() => {
                  window.location.reload();
                });
              } else {
                // 关闭当前弹出框
                this.phoneData.visible = false;
                this.initComp();
              }
            } else {
              this.$message({
                message: this.$tec(res.code) || res.msg || this.$t('account.account_1054'),
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
              message: this.$tec(res.code) || res.msg || this.$t('account.account_1054'),
              showClose: true,
              // duration: 0,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          });
      },
      // 修改绑定手机号 - 验证原有手机号
      checkOldPhoneHandler() {
        const checkKey = `checkKey_${this.phoneData.type}_${this.phoneData.step}`;
        this.$refs.checkForm.validate(valid => {
          if (valid) {
            // 第一步，验证码，获取验证码是否正确得到key，验证通过，继续下一步
            const params = {
              type: 1,
              data: this.phoneData.phone,
              code: this.checkForm.code,
              scene_id: 2
            };
            this.useUserServer
              .codeCheck(params)
              .then(async res => {
                if (res && res.code == 200 && res.data.check_result > 0) {
                  console.log('checkKey', checkKey)
                  this.phoneCaptVo[checkKey] = res.data.key;
                  // 验证码第一步，继续下一步
                  this.phoneData.step = 2;
                  // 初始化网易云盾-图片验证码
                  setTimeout(() => {
                    this.$nextTick(() => {
                      this.callCaptcha('editPhoneForm', 'captcha_edit_2');
                    });
                  }, 500);
                  // 表单校验还原
                  if (this.$refs.editPhoneForm) {
                    this.$nextTick(() => {
                      this.$refs.editPhoneForm && this.$refs.editPhoneForm.clearValidate();
                    });
                  }
                } else {
                  this.$message({
                    message: this.$tec(res.code) || res.msg || this.$t('account.account_1054'),
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
                  message: this.$tec(res.code) || res.msg || this.$t('account.account_1054'),
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        });
      },
      // 修改绑定手机号 - 设置新手机号
      editPhoneHandler() {
        const checkKey = `checkKey_${this.phoneData.type}_${this.phoneData.step}`;
        this.$refs.editPhoneForm.validate(valid => {
          if (valid) {
            // 先验证验证码结果，再实际绑定为新手机号 或 新邮箱
            const params = {
              type: 1,
              data: this.editPhoneForm.phone,
              code: this.editPhoneForm.code,
              scene_id: 2
            };
            this.useUserServer
              .codeCheck(params)
              .then(res => {
                if (res && res.code == 200 && res.data.check_result > 0) {
                  this.phoneCaptVo[checkKey] = res.data.key;
                  this.bindPhoneSave('editPhoneForm');
                } else {
                  this.$message({
                    message: this.$tec(res.code) || res.msg || this.$t('account.account_1052'),
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
                  message: this.$tec(res.code) || res.msg || this.$t('account.account_1052'),
                  showClose: true,
                  // duration: 0,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              });
          }
        });
      },
      dialogOpened() {
        // this.$refs['setPhoneForm'] && this.$refs['setPhoneForm'].clearValidate();
        // this.$refs['checkForm'] && this.$refs['checkForm'].clearValidate();
        // this.reset();
        this.$nextTick(() => {
          if (this.phoneData.type === 'edit') {
            this.callCaptcha('checkForm');
          } else {
            this.callCaptcha('setPhoneForm');
          }
        });
      },
      // 错误信息清空，验证码和图片验证码清空，短信验证码状态还原
      reset() {
        this.checkForm.code = '';
        this.checkForm.imgCode = '';
        if (this.phoneCaptVo.timeInterval_edit_1) {
          clearInterval(this.phoneCaptVo.timeInterval_edit_1);
          this.phoneCaptVo.timeInterval_edit_1 = null;
        }
        this.phoneCaptVo.eMsg_edit_1 = '';
        this.phoneCaptVo.btnCtrl_edit_1 = 'disabled';
        this.phoneCaptVo.sendCode_edit_1 = false;
        this.phoneCaptVo.time_edit_1 = 60;
        this.phoneData.step = 1;
      },
      onDialogClose() {
        this.dialogShow = false;
        this.$emit('input', false);
        // 重置表单
        this.$refs['setPhoneForm'] && this.$refs['setPhoneForm'].clearValidate();
        this.$refs['checkForm'] && this.$refs['checkForm'].clearValidate();
        this.$refs['editPhoneForm'] && this.$refs['editPhoneForm'].clearValidate();
        this.reset();
        this.$nextTick(() => {
          if (this.phoneData.type === 'edit') {
            this.callCaptcha('checkForm');
          } else {
            this.callCaptcha('setPhoneForm');
          }
        });
      }
    }
  };
</script>
<style lang="less">
  /* 设置手机号 or 修改手机号 */
  .vmp-user-account-phone {
    .vmp-user-account-phone-wrap {
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
          margin-bottom: 24px;
        }
        &.is-error {
          margin-bottom: 24px;
        }
        &.vhsaas-box__msg__error {
          margin-bottom: 24px;
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
