<template>
  <div class="vmp-cash">
    <el-dialog
      v-if="dialogVisible"
      class="vmp-cash-dialog"
      width="365px"
      :title="$t('cash.cash_1001')"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <div class="vmp-cash-wrap">
        <!-- 第一段，文案展示 -->
        <div class="vmp-cash-wrap-top">
          <div>
            <p class="vmp-cash-wrap-top__title">{{ $t('cash.cash_1002') }}</p>
            <p class="vmp-cash-wrap-top__money">
              ¥{{ cashServerState.cashInfo.red_packet_balance || '0.00' }}
            </p>
          </div>
          <div>
            <!-- 提现按钮 -->
            <el-button
              class="vmp-cash-red-button vmp-cash-length-middle"
              round
              :disabled="
                cashServerState.cashInfo.red_packet_balance < 1 ||
                cashServerState.cashInfo.in_red_withdraw
              "
              :style="{ visibility: step === 0 ? 'visible' : 'hidden' }"
              @click="checkPhoneToWx"
            >
              {{
                cashServerState.cashInfo.in_red_withdraw
                  ? $t('cash.cash_1004')
                  : $t('cash.cash_1005')
              }}
              <div
                v-if="cashServerState.cashInfo.red_packet_balance < 1"
                class="vmp-cash_btn_hover"
              >
                {{ $t('cash.cash_1006') }}
              </div>
            </el-button>
            <!-- 提现说明 -->
            <div v-if="step !== 3" class="vmp-cash__question">
              <p>{{ $t('cash.cash_1007') }}</p>
              <div class="vmp-cash__question__box">
                <p class="vmp-cash__question__padding"></p>
                <div class="vmp-cash__question__ctx">
                  <p>Q1: {{ $t('cash.cash_1008') }}</p>
                  <p>A1: {{ $t('cash.cash_1009') }}</p>
                  <br />
                  <p>
                    <span>●</span>
                    {{ $t('cash.cash_1010') }}
                  </p>
                  <p>
                    <span>●</span>
                    {{ $t('cash.cash_1011') }}
                  </p>
                  <p>*{{ $t('cash.cash_1012') }}</p>
                  <br />
                  <p>Q2:{{ $t('cash.cash_1013') }}</p>
                  <p>A2: {{ $t('cash.cash_1014') }}</p>
                  <br />
                  <p>Q3: {{ $t('cash.cash_1015') }}</p>
                  <p>A3: {{ $t('cash.cash_1016') }}</p>
                  <br />
                  <p>Q4: {{ $t('cash.cash_1017') }}</p>
                  <p>A4: {{ $t('cash.cash_1018') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二段-00， 200条数据 -->
        <div v-show="step === 0" class="vmp-cash-list-box">
          <div v-if="cashServerState.cashList.length > 0" class="vmp-cash-list">
            <ul>
              <li v-for="(item, index) in cashServerState.cashList" :key="index">
                <div>
                  <p>{{ item.type == 0 ? $t('cash.cash_1019') : $t('cash.cash_1005') }}</p>
                  <p>{{ item.time }}</p>
                </div>
                <div :class="item.type == 0 ? 'tag-green' : 'tag-red'">
                  <span>{{ item.type == 0 ? '+' : '-' }}</span>
                  <span>¥{{ item.money }}</span>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="vmp-cash-null-list">
            {{ $t('cash.cash_1020') }}
          </div>
        </div>

        <!-- 第二段-01， 绑定手机号 和 提现 -->
        <div v-show="step === 1 || step === 3" class="vmp-cash__bind-phone vmp-cash__submit-wx">
          <el-form ref="bindForm" :model="bindForm" :rules="bindFormRules" label-width="0">
            <p v-if="step === 1" class="cash-bind-notice">{{ $t('cash.cash_1021') }}</p>
            <el-form-item v-if="step === 1" prop="phone">
              <el-input
                v-model.trim="bindForm.phone"
                auto-complete="off"
                :placeholder="$t('account.account_1025')"
                :maxlength="30"
              />
            </el-form-item>
            <el-form-item v-if="step === 3" prop="money">
              <el-input
                v-model.trim="bindForm.money"
                clearable
                :placeholder="$t('cash.cash_1025')"
              ></el-input>
            </el-form-item>
            <el-form-item id="captcha-box" prop="imgCode">
              <NECaptcha ref="NECaptcha" v-model="bindForm.imgCode" />
            </el-form-item>
            <el-form-item key="code" prop="code" class="vmp-cash-wrap-code">
              <el-input
                v-model.trim="bindForm.code"
                clearable
                type="captcha"
                :maxlength="6"
                :placeholder="$t('account.account_1029')"
              ></el-input>
              <span
                type="danger"
                :disabled="bindForm.imgCode ? '' : 'disabled'"
                :class="['vmp-cash-code-btn', bindForm.imgCode && !timer ? 'start' : 'disabled']"
                @click.stop.prevent="getCaptha"
              >
                {{
                  timer ? $t('account.account_1031', { n: countTime }) : $t('account.account_1030')
                }}
              </span>
            </el-form-item>
            <el-form-item v-if="step === 3">
              <div class="vmp-wrap-cash-wx">
                <label class="vmp-wrap-cash__title">{{ $t('cash.cash_1026') }}</label>
                <div class="vmp-wrap-cash__avatar">
                  <img
                    v-show="!cashServerState.wxInfo.wechat_profile"
                    src="./images/my-dark@2x.png"
                    alt=""
                  />
                  <img
                    v-show="cashServerState.wxInfo.wechat_profile"
                    :src="cashServerState.wxInfo.wechat_profile"
                    alt=""
                  />
                </div>
                <label class="vmp-wrap-cash__name">
                  {{
                    (cashServerState.wxInfo.wechat_name_wap
                      ? cashServerState.wxInfo.wechat_name_wap
                      : '') | overHidden(6)
                  }}
                  {{
                    cashServerState.wxInfo.wechat_name_wap
                      ? `（${$t('account.account_1019')}）`
                      : `（${$t('account.account_1020')}）`
                  }}
                </label>
                <el-button
                  v-preventReClick
                  class="vmp-wrap-cash__btn"
                  type="text"
                  @click="changeWx"
                >
                  {{ $t('account.account_1004') }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
          <el-button
            v-if="step === 1"
            v-preventReClick
            class="vmp-cash-red-button vmp-cash__length-max"
            @click="cashPhoneToWx()"
          >
            {{ $t('cash.cash_1022') }}
          </el-button>
          <el-button
            v-if="step === 3"
            v-preventReClick
            class="vmp-cash-red-button vmp-cash__length-max"
            @click="cashFormSubmit()"
          >
            {{ $t('cash.cash_1027') }}
          </el-button>
          <p v-if="step === 3" class="vmp-cash-protol">
            <span>{{ $t('cash.cash_1028') }}</span>
            <span class="vmp-cash-link" @click="toCashProtol">{{ $t('cash.cash_1029') }}</span>
          </p>
        </div>

        <!-- 第三段-02， 绑定提现微信 -->
        <div v-show="step === 2" class="vmp-cash__bind-wx">
          <div class="vmp-share__img__box">
            <img
              v-if="qrcode"
              :src="`//aliqr.e.vhall.com/qr.png?s=7&t=${encodeURIComponent(qrcode)}`"
              alt=""
            />
            <div
              class="vmp-qr-reload"
              v-if="countPoll === 12"
              @click="goBangWeixin(cashServerState.wxInfo.is_oauth === 1 ? 2 : 1)"
            >
              <i class="vh-iconfont vh-a-line-clockwiserotation"></i>
            </div>
          </div>
          <p>{{ $t('cash.cash_1023') }}</p>
          <p>{{ $t('cash.cash_1024') }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { useUserServer, useCashServer } from 'middle-domain';
  import NECaptcha from './components/NECaptcha/index.vue';
  export default {
    name: 'VmpCash',
    components: {
      NECaptcha
    },
    data() {
      // 提现金额校验
      const validateMoney = (rule, value, callback) => {
        if (!/^\d+$|^\d*\.\d+$/g.test(value)) {
          callback(new Error(this.$t('cash.cash_1030')));
        } else {
          if (value < 1) {
            this.handleInputChange(value);
            callback(new Error(this.$t('cash.cash_1031')));
          } else if (value - this.cashServerState.cashInfo.red_packet_balance > 0) {
            this.handleInputChange(value);
            callback(new Error(this.$t('cash.cash_1032')));
          } else if (value - 800 > 0) {
            if (value > 800) {
              this.bindForm.money = 800;
            }
            callback();
          } else {
            this.handleInputChange(value);
            callback();
          }
        }
      };

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

      const cashServerState = this.useCashServer.state;
      return {
        cashServerState,
        dialogVisible: false, // 组件是否显示
        // useUserServer: {}, // 用户相关的接口
        // useCashServer: {}, // 提现相关的接口
        step: 0, // 当前步骤
        bindForm: {
          money: '',
          phone: '',
          imgCode: null,
          code: ''
        }, // 绑定手机号表单
        bindFormRules: {
          phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
          imgCode: [{ required: true, validator: validateImgCode, trigger: 'change' }],
          code: [{ required: true, validator: validateCode, trigger: 'blur' }],
          money: [{ required: true, validator: validateMoney, trigger: 'blur' }]
        }, // 表单校验规则
        qrcode: '', // 绑定微信的二维码
        timer: null, // 倒计时定时器
        countTime: 60, // 倒计时的时间
        pollTimer: null, // 轮询定时器
        countPoll: 0 // 轮询执行次数
      };
    },
    filters: {
      splitLenStr: function (name, len) {
        return name && name.length > len ? name.substring(0, len) + '...' : name;
      }
    },
    beforeCreate() {
      this.useUserServer = useUserServer();
      this.useCashServer = useCashServer();
    },
    beforeDestroy() {
      this.initInterval(); // 初始化定时器
      this.initPollTimer(); // 初始化微信绑定情况的轮询
    },
    watch: {
      'bindForm.money'(val) {
        // eslint-disable-next-line no-useless-escape
        this.bindForm.money = `${val}`.replace(/[^\d^\.]+/g, '');
      }
    },
    methods: {
      // 关闭弹窗初始化事件
      closeDialog() {
        this.dialogVisible = false;
        this.step = 0;
        this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
        this.$refs.bindForm?.resetFields(); // 重置表单
        this.initInterval(); // 初始化定时器
        this.initPollTimer(); // 初始化微信绑定情况的轮询
      },

      // 打开弹窗
      openCashDialog() {
        this.dialogVisible = true;
        this.useCashServer.getCashInfo();
        this.useCashServer.getCashList();
      },

      // 提现按钮 判断是否绑定手机号
      //     未绑定: 执行绑定操作 -> 判断手机号是否可以绑定 -> 执行绑定操作 -> 再次判断是否绑定手机号
      //     已绑定: 获取微信绑定信息判断绑定微信
      //         未绑定: 获取绑定微信二维码key值 && 生成二维码 -> 轮询绑定情况 -> 获取微信绑定信息判断绑定微信
      //         已绑定: 提现表单
      // 提现按钮
      async checkPhoneToWx() {
        // 获取用户的基本信息 如绑定的手机号
        await this.useUserServer.getUserInfo({ scene_id: 2 });
        // 获取微信的绑定信息 返回是否绑定 头像 昵称
        await this.useCashServer.checkWithDrawal().catch(res => {
          this.$message({
            message: this.$tec(res.code) || this.$t('cash.cash_1040'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        });
        if (!this.useUserServer.state.userInfo.phone) {
          console.log('手机号未绑定进入... ...');
          this.step = 1;
        } else if (this.cashServerState.wxInfo.is_oauth === 1) {
          console.log('手机号已绑定、微信已绑定(昵称和头像都有)进入... ...');
          this.step = 3;
        } else if (this.cashServerState.wxInfo.is_oauth !== 1) {
          console.log('手机号已绑定、（微信未绑定or绑定无头像or绑定无昵称）进入... ...');
          await this.goBangWeixin(1);
          this.step = 2;
        } else {
          console.log('手机号已绑定、（cash_wechat其它异常返回）进入... ...');
        }
      },

      // 获取验证码
      getCaptha() {
        if (this.timer) return; // 防止倒计时过程中触发事件
        // scene_id场景ID：1账户信息-修改密码  2账户信息-修改密保手机 3账户信息-修改关联邮箱 4忘记密码-邮箱方式找回
        // 5忘记密码-短信方式找回 6提现绑定时手机号验证 7快捷方式登录（短信验证码登录） 8注册-验证码
        const validateList = []; // 数据项校验的错误信息
        let params = {}; // 提交参数
        let fnName = 'withdrawSendCode'; // 触发方法名
        if (this.step === 1) {
          // 绑定手机号的验证码
          this.$refs.bindForm.validateField(['phone', 'imgCode'], valid => {
            validateList.push(valid);
          });
          params = {
            type: 1, // 1 手机号 2 邮箱
            data: this.bindForm.phone,
            validate: this.bindForm.imgCode,
            scene_id: 2
          };
          fnName = 'sendCode';
        } else if (this.step === 3) {
          // 提现的验证码
          this.$refs.bindForm.validateField(['imgCode'], valid => {
            validateList.push(valid);
          });
          params = {
            captcha: this.bindForm.imgCode,
            user_type: 2
          };
          fnName = 'withdrawSendCode';
        }

        // 若没有错误信息则请求接口
        if (validateList.every(item => item === '')) {
          this.useCashServer[fnName](params)
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
              this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
            });
        }
      },

      // 绑定手机号 -- 验证手机号绑定情况
      cashPhoneToWx() {
        this.$refs.bindForm.validate(valid => {
          if (valid) {
            // 先验证验证码结果，再实际绑定为新手机号
            this.useUserServer
              .codeCheck({
                type: 1,
                data: this.bindForm.phone,
                code: this.bindForm.code,
                scene_id: 2
              })
              .then(res => {
                if (res && res.code == 200 && res.data.check_result === 1) {
                  // 执行绑定手机号操作
                  this.bindPhoneSave(res.data.key);
                } else {
                  this.$message({
                    message: this.$tec(res.code) || this.$t('cash.cash_1033'),
                    showClose: true,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(res => {
                console.log(res);
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

      // 绑定手机号 -- 执行绑定手机号操作 成功后判断微信绑定情况
      bindPhoneSave(key) {
        // 确认绑定新功能
        this.useUserServer
          .bindInfo({
            type: 1,
            account: this.bindForm.phone,
            code: this.bindForm.code,
            scene_id: 2,
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
              this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
              this.$refs.bindForm?.resetFields(); // 重置表单
              this.initInterval(); // 初始化定时器
              // 再次执行提现按钮
              this.checkPhoneToWx();
            } else {
              this.$message({
                message: this.$tec(res.code) || this.$t('account.account_1054'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            }
          })
          .catch(err => {
            this.$message({
              message: this.$tec(err.code) || this.$t('account.account_1054'),
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          });
      },

      // 打开用户兑换协议
      toCashProtol() {
        window.open('https://e.vhall.com/home/vhallapi/exchangeagreement', '_blank');
      },

      // 更换账户绑定的微信
      async changeWx() {
        await this.goBangWeixin(2);
        this.step = 2;
      },

      // 绑定微信 --- 获取绑定微信二维码 1初次绑定 2更换绑定
      goBangWeixin(type) {
        // 获取微信绑定key值
        this.useCashServer
          .getBindKey()
          .then(res => {
            if (res.code == 200) {
              console.log(res.data);
              const jump_url = `https:${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/bind/${res.data.mark}`;
              this.qrcode = `https:${process.env.VUE_APP_BIND_BASE_URL}/v3/commons/auth/weixin?source=wap&jump_url=${jump_url}`;
              console.log(`二维码请求地址: ${this.qrcode}`);
              // 轮询微信扫码绑定情况
              this.startPolling(type);
            } else {
              this.$message({
                message: this.$tec(res.code) || this.$t('message.message_1026'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            }
          })
          .catch(err => {
            this.$message({
              message: this.$tec(err.code) || this.$t('message.message_1026'),
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          });
      },

      // 轮询微信扫码绑定情况
      async startPolling(type) {
        this.initPollTimer();
        await this.withdrawIsBind(true);
        const pollingFn = async () => {
          // 微信扫码绑定情况
          const bindData = await this.withdrawIsBind();
          if (type == 1 && bindData.data.is_bind == 1) {
            console.log('第一次绑定, 当前已经授权过...');
            this.initPollTimer();
            // 获取微信的绑定信息 返回是否绑定 头像 昵称
            await this.useCashServer.checkWithDrawal().catch(res => {
              this.$message({
                message: this.$tec(res.code) || this.$t('cash.cash_1040'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
            this.step = 3;
          } else if (type == 2 && bindData.data.is_change == 1) {
            console.log('更换绑定, 当前已经授权过...');
            this.initPollTimer();
            // 获取微信的绑定信息 返回是否绑定 头像 昵称
            await this.useCashServer.checkWithDrawal().catch(res => {
              this.$message({
                message: this.$tec(res.code) || this.$t('cash.cash_1040'),
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
            this.step = 3;
          }
          // v3组件老逻辑 1min 自动重置一次二维码 后续可以改成用户手动
          this.countPoll++;
          if (this.countPoll % 12 === 0) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
          }
        };
        this.pollTimer = setInterval(pollingFn, 5000);
      },

      // 获取当前的微信绑定状态 1初次绑定 2更换绑定
      withdrawIsBind(isInit = false) {
        const params = {};
        isInit && (params.is_change = 1); // 告知后端初始化更换状态的查询
        return this.useCashServer.withdrawIsBind(params);
      },

      // 立即提现按钮
      cashFormSubmit() {
        this.$refs.bindForm.validate(valid => {
          if (valid) {
            this.useCashServer
              .withdraw({
                verification_code: this.bindForm.code,
                fee: this.bindForm.money,
                type: 1,
                user_type: 2
              })
              .then(res => {
                if (res && res.code == 200) {
                  this.$message({
                    message: this.$t('cash.cash_1036'),
                    showClose: true,
                    type: 'success',
                    customClass: 'zdy-info-box'
                  });
                  this.closeDialog();
                } else {
                  this.$message({
                    message: this.$tec(res.code) || this.$t('cash.cash_1037'),
                    showClose: true,
                    type: 'error',
                    customClass: 'zdy-info-box'
                  });
                }
              })
              .catch(err => {
                this.$message({
                  message: this.$tec(err.code) || this.$t('cash.cash_1037'),
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              })
              .finally(() => {
                this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
                this.$refs.bindForm?.resetFields(); // 重置表单
                this.initInterval(); // 初始化定时器
              });
          }
        });
      },

      // 初始化定时器
      initInterval() {
        clearInterval(this.timer);
        this.timer = null;
        this.countTime = 60;
      },

      // 初始化微信绑定情况的轮询
      initPollTimer() {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
        this.countPoll = 0;
      },

      /**
       * 价格格式限制 v3复制来的
       * 只能输入数字和小数点；
       * 小数点只能有1个
       * 第一位不能是小数点
       * 第一位如果输入0，且第二位不是小数点，则去掉第一位的0
       * 小数点后保留2位
       */
      handleInputChange(value) {
        if (value != '') {
          let str = value + '';
          const len1 = str.substr(0, 1);
          const len2 = str.substr(1, 1);
          // 如果第一位是0，第二位不是点，就用数字把点替换掉
          if (str.length > 1 && len1 == 0 && len2 != '.') {
            str = str.substr(1, 1);
          }
          // 第一位不能是.
          if (len1 == '.') {
            str = '';
          }
          // 限制只能输入一个小数点
          if (str.indexOf('.') != -1) {
            const str_ = str.substr(str.indexOf('.') + 1);
            if (str_.indexOf('.') != -1) {
              str = str.substr(0, str.indexOf('.') + str_.indexOf('.') + 1);
            }
          }
          // 正则替换，保留数字和小数点
          // eslint-disable-next-line no-useless-escape
          str = str.replace(/[^\d^\.]+/g, '');
          // 如果需要保留小数点后两位，则用下面公式
          if (str.indexOf('.') > -1 && str.length - str.indexOf('.') > 3) {
            str = str.slice(0, str.indexOf('.') + 3);
            this.$message({
              message: this.$t('cash.cash_1034'),
              showClose: true,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
          }
          this.bindForm.money = str;
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-cash {
    .vmp-cash-dialog {
      .el-dialog__header {
        padding: 24px 32px;
      }
      .el-dialog__body {
        height: auto;
        padding: 0 0 24px 0;
      }
    }
    .vmp-cash-wrap {
      .vmp-cash-length-middle {
        width: 92px;
        background: #fb3a32;
        border-radius: 20px;
        text-align: center;
        position: relative;
        height: 38px;
        font-weight: 500;
        .vmp-cash_btn_hover {
          display: none;
          height: 38px;
        }
        &.is-disabled:hover {
          opacity: 1;
          .vmp-cash_btn_hover {
            display: block;
            position: absolute;
            top: -1px;
            border-radius: 4px;
            word-break: break-all;
            line-height: 38px;
            background: rgba(26, 26, 26, 0.8);
            font-size: 12px;
            color: #fff;
            padding: 0 12px;
            text-align: left;
            right: 0;
          }
        }
      }
      .vmp-cash-form-error {
        position: absolute;
        left: 0;
        top: 43px;
        font-size: 12px;
        font-weight: 400;
        color: #fb3a32;
        line-height: 17px;
      }
      .vmp-cash__length-max {
        width: 100%;
        height: 40px;
        border-radius: 20px;
      }
      button.el-button.vmp-cash-red-button {
        background: #fb3a32;
        color: #ffffff;
        padding: 8px 12px;
        text-align: center;
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
      .vmp-cash-wrap-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 13px;
        border-bottom: 1px solid #e6e6e6;
        margin: 0 32px;
        .vmp-cash-wrap-top__title {
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 20px;
        }
        .vmp-cash-wrap-top__money {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 35px;
          font-family: Gilroy;
          span {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: normal;
          }
        }
        .vmp-cash__question {
          text-align: center;
          margin-top: 12px;
          font-size: 14px;
          font-weight: 400;
          color: #3562fa;
          line-height: 20px;
          position: relative;
          cursor: pointer;
          .vmp-cash__question__box {
            display: none;
          }
          &:hover {
            .vmp-cash__question__box {
              display: block;
            }
          }
        }
        .vmp-cash__question__box {
          position: absolute;
          right: 0;
          top: 20px;
          background: transparent;
          z-index: 20;
          .vmp-cash__question__padding {
            height: 6px;
          }
        }
        .vmp-cash__question__ctx {
          width: 247px;
          height: 213px;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 4px;
          padding: 23px 27px;
          overflow-y: auto;
          p {
            font-size: 12px;
            font-weight: 400;
            color: #ffffff;
            text-align: justify;
            line-height: 17px;
            span {
              font-size: 20px;
            }
          }
        }
        .vmp-cash__question__ctx::-webkit-scrollbar {
          width: 6px;
          height: 71px;
          background: #7f7f7f;
          border-radius: 3px;
        }
        .vmp-cash__question__ctx::-webkit-scrollbar-thumb {
          background: #7f7f7f;
        }
        .vmp-cash__question__ctx::-webkit-scrollbar-track {
          background-color: rgba(0, 0, 0, 0.9);
        }
      }
      .vmp-cash-null-list {
        text-align: center;
        padding-top: 129px;
        font-size: 14px;
        font-weight: 400;
        color: #999999;
        line-height: 20px;
      }
      .vmp-cash-list-box {
        padding: 0 29px;
        overflow: auto;
        height: 260px;
        margin: 0 3px;
      }
      .vmp-cash-list-box::-webkit-scrollbar {
        width: 6px;
        height: 71px;
        background: #7f7f7f;
        border-radius: 3px;
      }
      .vmp-cash-list-box::-webkit-scrollbar-thumb {
        background: #7f7f7f;
      }
      .vmp-cash-list-box::-webkit-scrollbar-track {
        background-color: #ffffff;
      }
      .vmp-cash-list {
        li {
          list-style-type: none;
          border-bottom: 1px solid #e6e6e6;
          padding: 8px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          span:first-child {
            padding-right: 4px;
          }
          p {
            font-size: 14px;
            font-weight: 400;
            color: #1a1a1a;
            line-height: 20px;
            &:last-child {
              font-size: 14px;
              font-weight: 400;
              color: #999999;
              line-height: 14px;
            }
          }
          .tag-green {
            font-size: 14px;
            font-weight: 400;
            color: #14ba6a;
            line-height: 20px;
          }
          .tag-red {
            font-size: 14px;
            font-weight: 400;
            color: #fb3a32;
            line-height: 20px;
          }
        }
      }
      /* 验证手机号 */
      .vmp-cash__bind-phone {
        padding: 0 32px 8px 32px;
        .el-form-item {
          margin-bottom: 16px;
          &.vmp-cash-box__msg__error__bottom {
            margin-bottom: 24px;
          }
          &.is-error {
            margin-bottom: 30px;
          }
          &.vmp-cash-box__msg__error {
            margin-bottom: 24px;
          }
        }
        .cash-bind-notice {
          height: 47px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          color: #fb3a32;
          line-height: 20px;
          margin-top: 12px;
        }
      }
      .vmp-cash-wrap-code {
        position: relative;
        .el-input__suffix {
          margin-right: 80px;
        }
      }
      .vmp-cash-code-btn {
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
      .vmp-cash__bind-wx {
        text-align: center;
        .vmp-share__img__box {
          padding: 12px 0 7px 0;
          position: relative;
          img {
            width: 215px;
            height: 215px;
          }
          .vmp-qr-reload {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 220px;
            height: 220px;
            background: rgba(225, 225, 225, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            .vh-a-line-clockwiserotation {
              font-size: 20px;
              color: #333333;
            }
          }
        }
        p {
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 20px;
        }
      }
      .vmp-cash__submit-wx {
        padding: 16px 32px 8px 32px;
        .el-form-item {
          margin-bottom: 16px;
          &.vmp-cash-box__msg__error__bottom {
            margin-bottom: 24px;
          }
          &.is-error {
            margin-bottom: 30px;
          }
          &.vmp-cash-box__msg__error {
            margin-bottom: 24px;
          }
        }
        .vmp-cash-protol {
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          line-height: 20px;
          text-align: center;
          margin-top: 16px;
          .vmp-cash-link {
            color: #5cb8ff;
            cursor: pointer;
          }
        }
        .vmp-wrap-cash-wx {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          .vmp-wrap-cash__title {
            height: 20px;
            font-size: 14px;
            font-weight: 400;
            color: #1a1a1a;
            line-height: 20px;
            margin-right: 12px;
          }
          .vmp-wrap-cash__avatar {
            width: 24px;
            height: 24px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 4px;
            border-radius: 100%;
            overflow: hidden;
            img {
              display: block;
              width: 100%;
              height: 100%;
              -o-object-fit: cover;
              object-fit: cover;
            }
          }
          label.vmp-wrap-cash__name {
            font-size: 14px;
            font-weight: 400;
            color: #1a1a1a;
            line-height: 20px;
          }
          .vmp-wrap-cash__btn {
            margin-left: auto;
            color: #3562fa;
          }
        }
      }
    }
  }
</style>
