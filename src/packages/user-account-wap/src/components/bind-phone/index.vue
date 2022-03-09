<template>
  <!-- 设置手机号 -->
  <van-popup
    v-model="phoneDialog.visible"
    class="vmp-bind-phone"
    get-container="body"
    :close-on-click-overlay="false"
    @close="dialogClose"
  >
    <h1 class="dialog-title">
      {{ $t('account.account_1024') }}
      <i class="vh-iconfont vh-line-close" @click="phoneDialog.visible = false"></i>
    </h1>
    <div class="vmp-bind-phone-content">
      <div v-if="phoneDialog.type === 'add'" class="edit-title">
        {{ $t('account.account_1027') }}
      </div>
      <div v-if="phoneDialog.type === 'edit' && phoneDialog.step === 1" class="edit-title">
        {{ $t('account.account_1032') }}
      </div>
      <div v-if="phoneDialog.type === 'edit' && phoneDialog.step === 2" class="edit-title">
        {{ $t('account.account_1034') }}
      </div>
      <div v-if="phoneDialog.type === 'edit' && phoneDialog.step === 1" class="edit-tip">
        {{ $t('account.account_1033') }}
      </div>

      <div v-if="phoneDialog.type === 'edit' && phoneDialog.step === 1" class="edit-phone">
        {{ $t('account.account_1002')
        }}{{ (userServer.state.userInfo && userServer.state.userInfo.phone) || '' }}
      </div>
      <div v-if="phoneDialog.type === 'add' || phoneDialog.step === 2" class="vmp-input-base">
        <van-field
          class="input-base"
          v-model="bindForm.phone"
          name="code"
          :placeholder="$t('account.account_1025')"
          autocomplete="off"
          @blur="validtorPhone"
        />
        <p class="error-tip">{{ errorTip.phone }}</p>
      </div>
      <div class="vmp-input-base">
        <NECaptcha ref="NECaptcha" v-model="bindForm.imgCode" />
        <p class="error-tip error-tip-mini"></p>
      </div>
      <div class="vmp-input-base">
        <van-field
          class="input-base"
          v-model="bindForm.code"
          name="code"
          :placeholder="$t('account.account_1029')"
          autocomplete="off"
          @blur="validtorCode"
        >
          <template #button>
            <van-button
              size="small"
              :class="bindForm.imgCode && !timer ? 'input-button-disable' : 'input-button'"
              :disabled="bindForm.imgCode === '' || timer != null"
              @click.stop.prevent="getCaptha"
            >
              {{
                timer ? $t('account.account_1031', { n: countTime }) : $t('account.account_1030')
              }}
            </van-button>
          </template>
        </van-field>
        <p class="error-tip">{{ errorTip.code }}</p>
      </div>

      <div slot="footer">
        <van-button
          v-if="phoneDialog.type == 'add'"
          class="vmp-bind-phone-submit"
          @click="setPhoneHandler"
        >
          {{ $t('account.account_1035') }}
        </van-button>
        <van-button
          v-if="phoneDialog.type == 'edit' && phoneDialog.step == 1"
          class="vmp-bind-phone-submit"
          @click="checkOldPhoneHandler"
        >
          {{ $t('account.account_1036') }}
        </van-button>
        <van-button
          v-if="phoneDialog.type == 'edit' && phoneDialog.step == 2"
          class="vmp-bind-phone-submit"
          @click="editPhoneHandler"
        >
          {{ $t('account.account_1037') }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script>
  import { useUserServer } from 'middle-domain';
  import NECaptcha from '../NECaptcha';

  const defaltBindForm = {
    phone: '',
    imgCode: null,
    code: '',
    scene_id: 2
  };
  const defaultErrorTip = {
    phone: '',
    code: ''
  };
  export default {
    name: 'BindPhone',
    components: { NECaptcha },
    props: {
      value: {
        type: Object,
        default: () => ({
          visible: false,
          step: 1,
          type: 'add',
          phone: ''
        })
      }
    },
    data() {
      return {
        userServer: {},
        bindForm: Object.assign({}, defaltBindForm),
        errorTip: Object.assign({}, defaultErrorTip), // 错误提示
        timer: null,
        countTime: 60
      };
    },
    computed: {
      phoneDialog: {
        set(val) {
          this.$emit('input', val);
        },
        get() {
          return this.value;
        }
      }
    },
    created() {
      this.userServer = useUserServer();
    },
    methods: {
      // 弹窗关闭
      dialogClose() {
        this.phoneDialog.dialogShow = false;
        this.$emit('input', this.phoneDialog);
        this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
        this.initInterval(); // 初始化定时器
        this.bindForm = Object.assign({}, defaltBindForm);
        this.errorTip = Object.assign({}, defaultErrorTip);
      },

      // 获取验证码
      getCaptha() {
        if (this.checkData()) {
          const data =
            this.phoneDialog.type === 'add' || this.phoneDialog.step === 2
              ? this.bindForm.phone
              : this.phoneDialog.phone;
          const validate = this.bindForm.imgCode;
          const scene_id = this.bindForm.scene_id;
          // scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回
          // 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
          this.userServer
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
                this.$toast(this.$tes(res.code) || res.msg);
                this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
              }
            })
            .catch(err => {
              this.$toast(this.$tes(err.code) || err.msg || this.$t('account.account_1051'));
              // 图片验证码重置
              this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
            });
        }
      },

      // 立即设置
      setPhoneHandler() {
        if (this.validtorPhone() && this.validtorCode()) {
          this.userServer
            .codeCheck({
              type: 1,
              data: this.bindForm.phone,
              code: this.bindForm.code,
              scene_id: this.bindForm.scene_id
            })
            .then(res => {
              if (res && res.code == 200 && res.data.check_result === 1) {
                this.bindPhoneSave(res.data.key);
              } else {
                this.$toast(this.$tes(res.code) || res.msg || this.$t('account.account_1052'));
              }
            })
            .catch(err => {
              this.$toast(this.$tes(err.code) || err.msg || this.$t('account.account_1052'));
            });
        }
      },

      // 下一步
      checkOldPhoneHandler() {
        if (this.validtorCode()) {
          const params = {
            type: 1,
            data: this.phoneDialog.phone,
            code: this.bindForm.code,
            scene_id: this.bindForm.scene_id
          };
          this.userServer
            .codeCheck(params)
            .then(async res => {
              if (res && res.code == 200 && res.data.check_result === 1) {
                this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
                this.initInterval(); // 初始化定时器
                this.bindForm = Object.assign({}, defaltBindForm);
                this.errorTip = Object.assign({}, defaultErrorTip);
                this.phoneDialog.step = 2;
                this.$emit('input', { ...this.phoneDialog });
              } else {
                this.$toast(this.$tes(res.code) || res.msg || this.$t('account.account_1054'));
              }
            })
            .catch(err => {
              this.$toast(this.$tes(err.code) || err.msg || this.$t('account.account_1054'));
            });
        }
      },

      // 完成
      editPhoneHandler() {
        if (this.validtorPhone() && this.validtorCode()) {
          const params = {
            type: 1,
            data: this.bindForm.phone,
            code: this.bindForm.code,
            scene_id: this.bindForm.scene_id
          };
          this.userServer
            .codeCheck(params)
            .then(res => {
              if (res && res.code == 200 && res.data.check_result === 1) {
                this.bindPhoneSave(res.data.key);
              } else {
                this.$toast(this.$tes(res.code) || res.msg || this.$t('account.account_1052'));
              }
            })
            .catch(err => {
              this.$toast(this.$tes(err.code) || err.msg || this.$t('account.account_1052'));
            });
        }
      },

      // 绑定手机号事件
      bindPhoneSave(key) {
        this.userServer
          .bindInfo({
            type: 1,
            account: this.bindForm.phone,
            code: this.bindForm.code,
            scene_id: this.bindForm.scene_id,
            key
          })
          .then(res => {
            if (res && res.code == 200) {
              this.$toast(this.$t('account.account_1053'));
              if (this.phoneDialog.type === 'edit') {
                // 修改手机号，重新登录
                window.localStorage.clear();
                window.sessionStorage.clear();
                this.$nextTick(() => {
                  window.location.reload();
                });
              } else {
                // 关闭当前弹出框
                this.phoneDialog.visible = false;
                this.$emit('input', { ...this.phoneDialog });
              }
            } else {
              this.$toast(this.$tes(res.code) || res.msg || this.$t('account.account_1054'));
            }
          })
          .catch(err => {
            this.$toast(this.$tes(err.code) || err.msg || this.$t('account.account_1054'));
          });
      },

      // 数据校验
      checkData() {
        if (this.phoneDialog.type === 'edit' && this.phoneDialog.step === 1) {
          if (!this.bindForm.imgCode) {
            return false;
          }
        } else {
          if (!this.validtorPhone()) {
            return false;
          } else if (!this.bindForm.imgCode) {
            return false;
          }
        }
        return true;
      },

      // 校验手机号
      validtorPhone() {
        if (/^1\d{10}$/.test(this.bindForm.phone)) {
          this.errorTip.phone = '';
          return true;
        } else {
          this.errorTip.phone = this.$t('account.account_1069');
          return false;
        }
      },

      // 校验验证码
      validtorCode() {
        if (/^\d{6}$/.test(this.bindForm.code)) {
          this.errorTip.code = '';
          return true;
        } else {
          this.errorTip.code = this.$t('cash.cash_1038');
          return false;
        }
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
  .vmp-bind-phone {
    width: 680px;
    border-radius: 16px;
    background: #ffffff;
    padding: 60px 40px;

    .dialog-title {
      width: 100%;
      height: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 40px;
      font-weight: 500;
      color: #1a1a1a;

      .vh-line-close {
        color: #c8c9cc;
        font-size: 44px;
      }
    }

    .vmp-bind-phone-content {
      padding-top: 48px;

      .edit-title {
        height: 64px;
        display: flex;
        align-items: center;
        font-size: 28px;
        color: #1a1a1a;
        padding-bottom: 24px;
      }

      .edit-tip {
        line-height: 40px;
        font-size: 28px;
        color: #fb3a32;
      }

      .edit-phone {
        height: 72px;
        display: flex;
        align-items: center;
        font-size: 28px;
        color: #1a1a1a;
      }

      .vmp-input-base {
        .input-base {
          padding: 0;

          .van-field__body {
            width: 100%;
            height: 80px;
            border-radius: 8px;
            border: 1px solid rgba(151, 151, 151, 0.5);
            padding: 0 0 0 20px;

            .van-field__control::placeholder {
              color: #979797;
            }

            .input-button {
              border: none;
              font-size: 28px;
              color: #999999;
            }
            .input-button-disable {
              border: none;
              font-size: 28px;
              color: #fb3a32;
            }
          }
        }
        .error-tip {
          height: 48px;
          display: flex;
          align-items: center;
          font-size: 24px;
          color: #fb3a32;
          &.error-tip-mini {
            height: 32px;
          }
        }
      }
    }

    .vmp-bind-phone-submit {
      width: 100%;
      height: 80px;
      border-radius: 40px;
      background: #fb3a32;
      color: #ffffff;
      font-size: 28px;
    }
  }
</style>
