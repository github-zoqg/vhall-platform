// import { mapMutations, mapState } from 'vuex';
import { useUserServer } from 'middle-domain';
export default {
  name: 'VmpCash',
  data() {
    const validatePhone = (rule, value, callback) => {
      // this.phoneError = value === '' || !(/^1[0-9]{10}$/.test(value))
      // this.isShowPhoneErr = value === '' || !(/^1[0-9]{10}$/.test(value))
      if (value === '') {
        this.cashCaptVo.btnCtrl_bind = 'disabled'; // 验证失败，禁用
        callback(new Error(this.$t('account.account_1025')));
      } else {
        if (!/^1[0-9]{10}$/.test(value)) {
          this.cashCaptVo.btnCtrl_bind = 'disabled'; // 验证失败，禁用
          callback(new Error(this.$t('account.account_1069')));
        } else {
          if (this.cashCaptVo.mKey_bind) {
            this.cashCaptVo.btnCtrl_bind = 'start'; // 验证成功，启用
          } else {
            this.cashCaptVo.btnCtrl_bind = 'disabled';
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
    const validateMoney = (rule, value, callback) => {
      if (!/^\d+$|^\d*\.\d+$/g.test(value)) {
        callback(new Error(this.$t('cash.cash_1030')));
      } else {
        if (value < 1) {
          this.handleInputChange(value);
          callback(new Error(this.$t('cash.cash_1031')));
        } else if (value - 800 > 0) {
          if (value > 800) {
            this.cashForm.money = 800;
          }
          callback();
          // callback(new Error('请输入大于等于1且小于等于800的数字'))
        } else if (value - this.money > 0) {
          this.handleInputChange(value);
          callback(new Error(this.$t('cash.cash_1032')));
        } else {
          this.handleInputChange(value);
          callback();
        }
      }
    };
    return {
      dialogVisible: false,
      isAllowCash: true, // 是否允许提现，默认不允许提现
      cashProcess: false, // 是否处于-提现中状态，默认当前未处于提现中
      step: 0, // 0 表示列表；1 表示当前账号未绑定手机号；2 表示已绑手机号&未设置提现微信号&未授权登录微信号 <=> 已绑手机号&未未设置提现微信号 ；3 表示 已绑手机号&已设提现微信号
      dataList: [], // 收支明细200条
      incomeVo: {}, // 收益结果
      // 提现相关
      captchaKey: 'b7982ef659d64141b7120a6af27e19a0', // 云盾key
      bindForm: {
        phone: '',
        imgCode: '',
        code: '',
        scene_id: 2
      },
      bindFormRules: {
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        code: [{ required: true, validator: validateCaptchas, trigger: 'blur' }]
      },
      cashCaptVo: {
        capDom_bind: '', // 云盾实例（当前账号未绑定手机号）
        eMsg_bind: '', // 是否提示图片验证码错误（当前账号未绑定手机号）
        mKey_bind: '', // 选择图片验证码后的key值（当前账号未绑定手机号）
        checkKey_bind: '', // 短信验证码校验通过后的回调key（当前账号未绑定手机号）
        time_bind: 60, // 验证码倒计时（当前账号未绑定手机号）
        timeInterval_bind: null, // 验证码-计时器（当前账号未绑定手机号）
        codeErr_bind: '', // 验证码发送前，手机号验证异常文案（当前账号未绑定手机号）
        btnCtrl_bind: 'disabled', // 按钮的置灰 disabled - 禁用；start - 待发送；pending - 发送中（当前账号未绑定手机号）
        sendCode_bind: false, // 是否是发送验证码（当前账号未绑定手机号）
        capDom_cash: '', // 云盾实例（已绑手机号&已设提现微信号）
        eMsg_cash: '', // 是否提示图片验证码错误（已绑手机号&已设提现微信号）
        mKey_cash: '', // 选择图片验证码后的key值（已绑手机号&已设提现微信号）
        checkKey_cash: '', // 短信验证码校验通过后的回调key（已绑手机号&已设提现微信号）
        time_cash: 60, // 验证码倒计时（已绑手机号&已设提现微信号）
        timeInterval_cash: null, // 验证码-计时器（已绑手机号&已设提现微信号）
        codeErr_cash: '', // 验证码发送前，手机号验证异常文案（已绑手机号&已设提现微信号）
        btnCtrl_cash: 'disabled', // 按钮的置灰 disabled - 禁用；start - 待发送；pending - 发送中（已绑手机号&已设提现微信号）
        sendCode_cash: false // 是否是发送验证码（已绑手机号&已设提现微信号）
      },
      qrcode: '', // 扫码绑定的二维码
      pollingTimerId: 1,
      pollingTimerVo: {},
      cashTimer: null,
      cashForm: {
        phone: '',
        imgCode: '',
        code: '',
        money: '',
        scene_id: 6
      },
      cashFormRules: {
        code: [{ required: true, validator: validateCaptchas, trigger: 'blur' }],
        money: [{ validator: validateMoney, trigger: 'blur' }]
      },
      cashUserInfo: {},
      accountVo: {},
      useUserServer: null
    };
  },
  created() {
    // 创建
    this.useUserServer = useUserServer();
  },
  computed: {
    // ...mapState('watchBase', ['languages'])
  },
  methods: {
    // ...mapMutations('watchBase', ['setUserInfo']),
    getUserInfo() {
      return this.$vhallapi.nav
        .getInfo({
          scene_id: 2
        })
        .then(res => {
          if (res && res.code == 200) {
            // this.setUserInfo(res.data); TODO
            this.accountVo = res.data;
          } else {
            console.log(res);
            // this.setUserInfo(null); TODO
          }
        })
        .catch(e => {
          console.log(e);
          // this.setUserInfo(null); TODO
        });
    },
    initComp() {
      console.log('每次提现进入当前... ...');
      this.step = 0;
      this.getIncomeInfo();
      this.withdrawRpList();
    },
    getIncomeInfo() {
      this.$vhallapi.nav
        .incomeInfo({})
        .then(res => {
          // res.data.red_packet_income = '5.0'
          this.incomeVo = res && res.code == 200 ? res.data || {} : {};
        })
        .catch(res => {
          this.incomeVo = {
            // red_packet_income: '5.0'
          };
        });
    },
    withdrawRpList() {
      this.$vhallapi.nav
        .withdrawRpList({})
        .then(res => {
          this.dataList = res && res.code == 200 ? res.data.list || [] : [];
        })
        .catch(res => {
          this.dataList = [];
        });
    },
    async checkPhoneToWx() {
      await this.getUserInfo();
      const { data } = await this.checkWithDrawal();
      if (this.accountVo) {
        if (!this.accountVo.phone) {
          console.log('手机号未绑定进入... ...');
          // 若手机号未绑定
          this.step = 1;
          this.$nextTick(() => {
            // 初始化网易云盾-图片验证码
            this.callCaptcha('bindForm');
          });
        } else if (data && data.is_oauth == 1) {
          console.log('手机号已绑定、微信已绑定(昵称和头像都有)进入... ...');
          const newData = await this.checkWithDrawal();
          // 信息反显
          this.cashUserInfo.avatar = newData.data.wechat_profile || '';
          this.cashUserInfo.nick_name = newData.data.wechat_name_wap || '';
          // 表单重置
          this.resetCashForm();
        } else if (data && data.is_oauth != 1) {
          console.log('手机号已绑定、（微信未绑定or绑定无头像or绑定无昵称）进入... ...');
          // 已设置手机号、未绑定过微信
          this.toCodeWxPanel(1);
        } else {
          console.log('手机号已绑定、（cash_wechat其它异常返回）进入... ...');
          // 已设置手机号、未绑定过微信
          this.toCodeWxPanel(1);
        }
      } else {
        console.log('未获取到用户信息');
      }
    },
    resetCashForm() {
      try {
        this.$nextTick(() => {
          if (this.$refs.cashForm) {
            this.$refs.cashForm.resetFields();
            this.$refs.cashForm.clearValidate();
            this.cashCaptVo.capDom_cash = '';
            this.cashCaptVo.eMsg_cash = '';
            this.cashCaptVo.mKey_cash = '';
            this.cashCaptVo.checkKey_cash = '';
            this.cashCaptVo.time_cash = 60;
            this.cashCaptVo.timeInterval_cash = null;
            this.cashCaptVo.codeErr_cash = '';
            this.cashCaptVo.btnCtrl_cash = 'disabled';
            this.cashCaptVo.sendCode_cash = false; // 是
            const autoMoney =
              this.incomeVo.red_packet_balance <= 800 ? this.incomeVo.red_packet_balance : 800;
            this.cashForm.money = autoMoney;
            this.cashForm.code = '';
          }
        });
      } catch (e) {
        console.log(e);
      } finally {
        // 已绑定过微信
        this.step = 3;
        this.$nextTick(() => {
          // 初始化网易云盾-图片验证码
          this.callCaptcha('cashForm');
        });
      }
    },
    // 初始化网易-易盾图片验证码
    callCaptcha(formName, elementKey = null) {
      try {
        const that = this;
        const keyType = ['list', 'bind', 'code', 'cash'][this.step];
        console.log(`当前keyType = ${keyType}`);
        const keyName = elementKey == null ? `captcha_${keyType}` : elementKey;
        // 发送验证码状态
        const btnCtrlKey = `btnCtrl_${keyType}`;
        const catp = document.getElementById(keyName);
        if (!catp) {
          // 若是初始化不了图片验证码，图片验证码设置为空
          that.cashCaptVo[`capDom_${keyType}`] = '';
          that.cashCaptVo[`eMsg_${keyType}`] = true;
          return;
        }
        // eslint-disable-next-line
        initNECaptcha({
          captchaId: that.captchaKey,
          element: `#${keyName}`,
          mode: 'float',
          // lang: this.languages.lang, TODO
          onReady(instance) {
            console.log('instance', instance);
          },
          onVerify(err, data) {
            if (data) {
              that.cashCaptVo[btnCtrlKey] = 'start'; // 验证失败，禁用
              that[formName].imgCode = data.validate;
              that.cashCaptVo[`mKey_${keyType}`] = data.validate;
              that.cashCaptVo[`eMsg_${keyType}`] = false;
            } else {
              that.cashCaptVo[`capDom_${keyType}`] = '';
              console.log('errr>>>', err);
              that.cashCaptVo[`eMsg_${keyType}`] = true;
            }
          },
          onload(instance) {
            console.log('onload', instance);
            that.cashCaptVo[`capDom_${keyType}`] = instance;
          }
        });
      } catch (e) {
        console.log(e);
      }
    },
    // 发送验证码
    getCaptha(formName, codeKey) {
      console.log(`PC-account-dialog>>>${formName},${codeKey}`);
      const keyType = ['list', 'bind', 'code', 'cash'][this.step];
      // 发送验证码状态
      const btnCtrlKey = `btnCtrl_${keyType}`;
      // 是否可以发送验证码
      const sendCodeDisabledKey = `sendCode_${keyType}`;
      // 验证码倒计时
      const timeKey = `time_${keyType}`;
      // 验证码计时器
      const timeIntervalKey = `timeInterval_${keyType}`;
      // 验证码发送前，手机号验证
      const codeErrKey = `codeErr_${keyType}`;
      // 验证码发送前，图片验证码
      const successMsgCodeKey = `mKey_${keyType}`;
      // 图片验证码ID
      const keyName = `captcha_${keyType}`;
      if (this.cashCaptVo[btnCtrlKey] === 'disabled') {
        return;
      }
      if (this.step === 0) {
        const mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/;
        if (!this[formName].phone) {
          this.cashCaptVo[codeErrKey] = this.$t('account.account_1049');
          // 清空表单验证码错误提示
          this.$nextTick(() => {
            this.$refs[formName].clearValidate([codeKey]);
          });
          return;
        } else if (!mobileReg.test(this[formName].phone)) {
          this.cashCaptVo[codeErrKey] = this.$t('account.account_1050');
          // 清空表单验证码错误提示
          this.$nextTick(() => {
            this.$refs[formName].clearValidate([codeKey]);
          });
          return;
        }
      }
      const fName = formName == 'cashForm' ? 'withdrawSendCode' : 'sendCode';
      const params =
        formName == 'cashForm'
          ? {
              captcha: this.cashCaptVo[successMsgCodeKey],
              user_type: 2
            }
          : {
              type: 1, // 手机
              data: this[formName].phone,
              validate: this.cashCaptVo[successMsgCodeKey],
              scene_id: this[formName].scene_id
            };
      this.$vhallapi.nav[fName](params)
        .then(res => {
          if (res && res.code == 200) {
            this.cashCaptVo[btnCtrlKey] = 'pending';
            this.cashCaptVo[sendCodeDisabledKey] = true;
            if (this.cashCaptVo[timeIntervalKey]) clearInterval(this.cashCaptVo[timeIntervalKey]);
            this.cashCaptVo[timeIntervalKey] = setInterval(() => {
              if (this.cashCaptVo[timeKey] > 0) {
                this.cashCaptVo[timeKey]--;
              } else {
                clearInterval(this.cashCaptVo[timeIntervalKey]);
                this.cashCaptVo[sendCodeDisabledKey] = false;
                this.cashCaptVo[timeKey] = 60;
                this.cashCaptVo[btnCtrlKey] = 'start';
              }
            }, 1000);
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg,
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
            this.cashCaptVo[btnCtrlKey] = 'disabled';
            // 图片验证码重置
            this.callCaptcha(formName, `${keyName}`);
          }
        })
        .catch(res => {
          this.$message({
            message: this.$tec(res.code) || res.msg || this.$t('account.account_1051'),
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          this.cashCaptVo[btnCtrlKey] = 'disabled';
          // 图片验证码重置
          this.callCaptcha(formName, `${keyName}`);
        });
    },
    cashPhoneToWx() {
      this.$refs.bindForm.validate(valid => {
        if (valid) {
          // 先验证验证码结果，再实际绑定为新手机号
          this.useUserServer
            .codeCheck({
              type: 1,
              data: this.bindForm.phone,
              code: this.bindForm.code,
              scene_id: this.bindForm.scene_id
            })
            .then(res => {
              if (res && res.code == 200 && res.data.check_result > 0) {
                this.cashCaptVo.checkKey_bind = res.data.key;
                this.bindPhoneSave('bindForm');
              } else {
                this.$message({
                  message: this.$tec(res.code) || res.msg || this.$t('cash.cash_1033'),
                  showClose: true,
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
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
        }
      });
    },
    // 设置手机号 / 修改手机号 =>> （绑定）
    bindPhoneSave(formName) {
      // 确认绑定新功能
      this.$vhallapi.nav
        .bindInfo({
          type: 1,
          account: this[formName].phone,
          code: this[formName].code,
          scene_id: this[formName].scene_id,
          key: this.cashCaptVo.checkKey_bind
        })
        .then(res => {
          if (res && res.code == 200) {
            this.$message({
              message: this.$t('account.account_1053'),
              showClose: true,
              type: 'success',
              customClass: 'zdy-info-box'
            });
            // 继续下一步鉴权判断
            this.checkPhoneToWx();
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg || this.$t('account.account_1054'),
              showClose: true,
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
            type: 'error',
            customClass: 'zdy-info-box'
          });
        });
    },
    // 跳转微信扫码绑定布局
    toCodeWxPanel(type) {
      this.step = 2;
      this.goBangWeixin(type);
    },
    // 绑定微信 ---获取绑定微信二维码
    goBangWeixin(type) {
      const that = this;
      // 获取key值
      this.$vhallapi.nav
        .getBindKey({})
        .then(res => {
          if (res.code == 200) {
            // this.qrcode = `${process.env.VUE_APP_BIND_BASE_URL}/v3/commons/auth/weixin?source=wap&jump_url=${process.env.VUE_APP_WAP_WATCH}/lives/forceBinding/${res.data.mark}`
            const jump_url = `${window.location.protocol}${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_WEB_KEY}/lives/bind/${res.data.mark}`;
            this.qrcode = `${process.env.VUE_APP_BIND_BASE_URL}/v3/commons/auth/weixin?source=wap&jump_url=${jump_url}`;
            console.log(`二维码请求地址：${this.qrcode}`);
            that.startPolling(type);
            if (this.cashTimer) {
              console.log('之前存在计时器，清除');
              clearTimeout(this.cashTimer);
            }
            this.cashTimer = setTimeout(function () {
              clearTimeout(that.cashTimer);
              // 若未得到理想轮询结果，到时间后自动停止轮询
              that.stopPolling();
              // 若当前还停留在第二步，二维码自动更新
              if (that.step == 2) {
                // 重新展示二维码
              }
            }, 60000);
          } else {
            this.$message({
              message: this.$tec(res.code) || res.msg || '获取信息失败',
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          }
        })
        .catch(res => {
          this.$message({
            message: this.$tec(res.code) || res.msg || '获取信息失败',
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          console.log(res);
        });
      console.log(this.qrcode);
    },
    checkWithDrawal() {
      return new Promise((resolve, reject) => {
        this.$vhallapi.nav.checkWithDrawal({}).then(res => {
          resolve(res);
        }, reject);
      });
    },
    withdrawIsBind(type) {
      return new Promise((resolve, reject) => {
        const params = {};
        if (type == 2) {
          // 更换加参数传递
          params.is_change = 1;
        }
        this.$vhallapi.nav.withdrawIsBind(params).then(res => {
          resolve(res);
        }, reject);
      });
    },
    async startPolling(type) {
      const that = this;
      const id = this.pollingTimerId++;
      this.pollingTimerVo[id] = true;
      const pollingFn = async function () {
        // 若发现setTimeout存在，即退出
        if (!that.pollingTimerVo[id]) return;
        const bindData = await that.withdrawIsBind(type); // 模拟请求
        // TODO 需要明确如何判定绑定成功
        if (type == 1 && bindData.data.is_bind == 1) {
          console.log('第一次绑定，当前已经授权过...');
          // 获取一次绑定信息接口
          that.showCashForm(that);
        } else if (type == 2 && bindData.data.is_change == 1) {
          console.log('更换，当前已经授权过...');
          that.showCashForm(that);
        }
        console.log('当前轮询', bindData);
        setTimeout(pollingFn, 10000); // 10秒一轮询
      };
      pollingFn();
    },
    async showCashForm(that) {
      // 重新获取一次绑定信息
      const newData = await that.checkWithDrawal();
      // 信息反显
      that.cashUserInfo.avatar = newData.data.wechat_profile || '';
      that.cashUserInfo.nick_name = newData.data.wechat_name_wap || '';
      // 跳转第三步
      that.step = 3;
      // 初始化网易云盾-图片验证码
      that.$nextTick(() => {
        that.callCaptcha('cashForm');
      });
      that.stopPolling();
      clearTimeout(that.cashTimer);
    },
    stopPolling() {
      this.pollingTimerVo = {};
    },
    /**
     * 价格格式限制
     * 只能输入数字和小数点；
     * 小数点只能有1个
     * 第一位不能是小数点
     * 第一位如果输入0，且第二位不是小数点，则去掉第一位的0
     * 小数点后保留2位
     */
    handleInputChange(value) {
      if (value != '') {
        // this.editParams.price = value.replace(/^[0-9]*$/,'')
        // this.editParams.price = value.replace(/[^\d]/g,'')
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
        this.cashForm.money = str;
      }
    },
    cashFormSubmit() {
      this.$refs.cashForm.validate(valid => {
        if (valid) {
          this.$vhallapi.nav
            .withdraw({
              verification_code: this.cashForm.code,
              fee: this.cashForm.money,
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
                this.initComp();
              } else {
                this.$message({
                  message: this.$tec(res.code) || res.msg || '验证失败，无法操作',
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }
            })
            .catch(res => {
              console.log(res);
              this.$message({
                message: this.$tec(res.code) || res.msg || '验证失败，无法操作',
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
        }
      });
    },
    // 打开用户兑换协议
    toCashProtol() {
      window.open('https://e.vhall.com/home/vhallapi/exchangeagreement', '_blank');
    },
    // 更换账户绑定的微信
    changeWx() {
      this.toCodeWxPanel(2);
    },
    closeDialog() {
      this.stopPolling();
      this.dialogVisible = false;
      if (this.cashTimer) {
        console.log('销毁存在计时器，清除');
        clearTimeout(this.cashTimer);
      }
    }
  },
  filters: {
    splitLenStr: function (name, len) {
      return name && name.length > len ? name.substring(0, len) + '...' : name;
    }
  },
  beforeDestroy() {
    if (this.cashTimer) {
      console.log('销毁存在计时器，清除');
      clearTimeout(this.cashTimer);
    }
  }
};
