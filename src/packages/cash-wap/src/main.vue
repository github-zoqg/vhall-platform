<template>
  <div>
    <!-- 提现数据展示 -->
    <van-popup v-model="visible" position="bottom" class="vmp-user-cash-popup" get-container="body">
      <div class="user-info-title">
        <i class="vh-iconfont vh-line-arrow-left" @click="closePopup"></i>
        {{ $t('nav.nav_1028') }}
      </div>

      <div class="vmp-cash-content">
        <!-- 第一段，文案展示 -->
        <div class="vmp-cash-base">
          <!-- 提现说明按钮 -->
          <div class="notice" @click="openCashNotice">
            {{ $t('cash.cash_1007') }}
          </div>
          <div class="money-title">{{ $t('cash.cash_1002') }}</div>
          <div class="money-num">
            ¥{{ useCashServer.state.cashInfo.red_packet_balance || '0.00' }}
          </div>
          <!-- TODO:支付牌照问题 -->
          <van-button
            v-if="false"
            class="vmp-cash-draw-button"
            round
            :disabled="
              useCashServer.state.cashInfo.red_packet_balance < 1 ||
              useCashServer.state.cashInfo.in_red_withdraw
            "
            @click="checkPhoneToWx"
          >
            {{
              useCashServer.state.cashInfo.in_red_withdraw
                ? $t('cash.cash_1004')
                : $t('cash.cash_1005')
            }}
          </van-button>
        </div>

        <!-- 第二段-00， 200条数据 -->
        <div class="vmp-cash-list">
          <div
            class="vmp-cash-list-item"
            v-for="(item, index) in useCashServer.state.cashList"
            :key="index"
          >
            <div class="item-msg">
              <p class="item-msg-title">
                {{ item.type == 0 ? $t('cash.cash_1019') : $t('cash.cash_1005') }}
              </p>
              <p class="item-msg-time">{{ item.time }}</p>
            </div>
            <div class="tag-base" :class="item.type == 0 ? 'tag-green' : 'tag-red'">
              {{ item.type == 0 ? '+' : '-' }}￥{{ item.money }}
            </div>
          </div>
          <div v-if="useCashServer.state.cashList.length === 0" class="vmp-cash-list-none">
            {{ $t('cash.cash_1020') }}
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 提现说明弹出框 -->
    <van-popup v-model="cashNoticeVisible" class="vmp-cash-question" get-container="body">
      <div class="vmp-cash-question-content">
        <i class="vh-iconfont vh-line-close" @click="cashNoticeVisible = false"></i>
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
        <p>Q2: {{ $t('cash.cash_1013') }}</p>
        <p>A2: {{ $t('cash.cash_1014') }}</p>
        <br />
        <p>Q3: {{ $t('cash.cash_1015') }}</p>
        <p>A3: {{ $t('cash.cash_1016') }}</p>
        <br />
        <p>Q4: {{ $t('cash.cash_1017') }}</p>
        <p>A4: {{ $t('cash.cash_1018') }}</p>
      </div>
    </van-popup>

    <!-- 提现流程面板框 -->
    <van-popup
      v-model="cashVisible"
      class="vmp-cash-draw"
      get-container="body"
      @close="cashDrawClose"
    >
      <div v-if="step === 1 || step === 2" class="cash-form">
        <div class="cash-form-title">
          <p class="title-text">
            {{ $t('cash.cash_1002') }}
            <i class="vh-iconfont vh-line-close" @click="cashVisible = false"></i>
          </p>
          <p class="title-money">
            {{ useCashServer.state.cashInfo.red_packet_balance || '0.00' }}
            <span>{{ $t('cash.cash_1003') }}</span>
          </p>
        </div>
        <p v-if="step === 1" class="cash-bind-notice">{{ $t('cash.cash_1021') }}</p>
        <div v-if="step === 1" class="vmp-input-base">
          <van-field
            class="input-base"
            v-model="cashForm.phone"
            name="code"
            :placeholder="$t('account.account_1025')"
            autocomplete="off"
            @blur="validtorPhone"
          />
          <p :class="['error-tip', { 'error-tip-mini': !errorTip.phone }]">{{ errorTip.phone }}</p>
        </div>
        <div v-if="step === 2" class="vmp-input-base">
          <van-field
            class="input-base"
            v-model="cashForm.money"
            type="number"
            name="code"
            :placeholder="$t('cash.cash_1025')"
            autocomplete="off"
            @blur="validtorMoney"
          />
          <p :class="['error-tip', { 'error-tip-mini': !errorTip.money }]">{{ errorTip.money }}</p>
        </div>
        <div class="vmp-input-base">
          <NECaptcha ref="NECaptcha" v-model="cashForm.imgCode" />
          <p :class="['error-tip', { 'error-tip-mini': !errorTip.imgCode }]">
            {{ errorTip.imgCode }}
          </p>
        </div>
        <div class="vmp-input-base">
          <van-field
            class="input-base"
            v-model="cashForm.code"
            name="code"
            :placeholder="$t('account.account_1029')"
            autocomplete="off"
            @blur="validtorCode"
          >
            <template #button>
              <van-button
                size="small"
                :class="cashForm.imgCode && !timer ? 'input-button-disable' : 'input-button'"
                :disabled="cashForm.imgCode === '' || !!timer"
                @click.stop.prevent="getCaptha"
              >
                {{
                  timer ? $t('account.account_1031', { n: countTime }) : $t('account.account_1030')
                }}
              </van-button>
            </template>
          </van-field>
          <p :class="['error-tip', { 'error-tip-mini': !errorTip.code }]">{{ errorTip.code }}</p>
        </div>
        <van-button v-if="step === 1" class="vmp-cash-draw-submit" @click="setPhoneHandler">
          {{ $t('cash.cash_1022') }}
        </van-button>
        <van-button v-if="step === 2" class="vmp-cash-draw-submit" @click="drawMoney">
          {{ $t('cash.cash_1027') }}
        </van-button>
        <p v-if="step === 2" class="cash-protol">
          <span class="cash-txt">{{ $t('cash.cash_1028') }}</span>
          <span class="cash-link" @click="toCashProtol">{{ $t('cash.cash_1029') }}</span>
        </p>
      </div>

      <div v-if="step === 3 || step === 4" class="cash-result">
        <i v-show="step === 3" class="vh-iconfont vh-full-success"></i>
        <i v-show="step === 4" class="vh-iconfont vh-full-error"></i>
        <p class="result-text">{{ drawErrorTip || '' }}</p>
        <van-button class="finish-button" @click="cashDrawClose()">
          {{ $t('account.account_1037') }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script>
  import { useUserServer, useCashServer } from 'middle-domain';
  import { boxEventOpitons, isWechat } from '@/packages/app-shared/utils/tool';
  import { authWeixinAjax, buildPayUrl } from '@/packages/app-shared/utils/wechat';
  import NECaptcha from './components/NECaptcha';
  const defaltCashForm = {
    phone: '',
    money: '',
    imgCode: null,
    code: '',
    scene_id: 2
  };
  const defaultErrorTip = {
    phone: '',
    money: '',
    imgCode: null,
    code: ''
  };
  export default {
    name: 'VmpCashWap',
    components: { NECaptcha },
    data() {
      return {
        visible: false, // 提现信息组件
        cashNoticeVisible: false, // 提现说明
        cashVisible: false, // 提现表单
        useUserServer: {}, // 用户相关的接口
        useCashServer: {}, // 提现相关的接口
        countTime: 60,
        timer: null,
        cashForm: Object.assign({}, defaltCashForm),
        errorTip: Object.assign({}, defaultErrorTip),
        step: 1, // 1 绑定手机号 2 提现 3 提现成功 4 提现失败
        drawErrorTip: '' // 提现成功失败的文案
      };
    },
    created() {
      this.useUserServer = useUserServer();
      this.useCashServer = useCashServer();
    },
    watch: {
      step(val) {
        if (val === 1 || val === 2) {
          defaltCashForm.money =
            this.useCashServer.state?.cashInfo.red_packet_balance * 1 > 800
              ? 800
              : this.useCashServer.state?.cashInfo.red_packet_balance;
          this.cashForm = Object.assign({}, defaltCashForm);
          this.errorTip = Object.assign({}, defaultErrorTip);
          this.initInterval(); // 初始化定时器
          this.$refs.NECaptcha?.refreshNECaptha(); // 重置易盾
        }
      }
    },
    methods: {
      // 打开组件
      openCashWap() {
        this.visible = true;
        this.useCashServer.getCashInfo();
        this.useCashServer.getCashList();
      },

      // 关闭组件
      closePopup() {
        this.visible = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitCloseUserCenterWap'));
      },

      // 打开提现问题
      openCashNotice() {
        this.cashNoticeVisible = true;
      },

      // 提现按钮
      async checkPhoneToWx() {
        // 当前若非微信内打开，提示用户微信内打开
        if (!isWechat()) {
          this.$toast(this.$t('cash.cash_1035'));
          return;
        }
        // 校验是否有open_id,若没有重新微信登录授权
        const open_id = sessionStorage.getItem('open_id');
        let payAuthStatus = 0; //默认支付流程为非授权或授权后
        // 重新微信授权
        if (isWechat()) {
          // 微信正常授权过
          if (open_id) {
            console.log('checkPhoneToWx-------->');
          } else {
            //重新授权
            payAuthStatus = 1;
            const payUrl = buildPayUrl(this.$route);
            authWeixinAjax(this.$route, payUrl, () => {});
          }
        }

        if (payAuthStatus == 0) {
          try {
            await this.useUserServer.getUserInfo();
            if (!this.useUserServer.state.userInfo.phone) {
              console.log('手机号未绑定进入... ...');
              this.cashVisible = true;
              this.step = 1;
            } else {
              console.log('手机号已绑定进入--- ---');
              this.cashVisible = true;
              this.step = 2;
            }
          } catch (err) {
            this.$toast(this.$t('cash.cash_1040'));
          }
        }
      },

      // 获取验证码按钮
      getCaptha() {
        if (this.step === 1) {
          this.validtorPhone() && this.cashForm.imgCode && this.getCapthaServe();
        } else {
          this.getCapthaServe();
        }
      },

      // 获取验证码走接口
      getCapthaServe() {
        const data =
          this.step === 1 ? this.cashForm.phone : this.useUserServer.state.userInfo.phone;
        const validate = this.cashForm.imgCode;
        const scene_id = this.cashForm.scene_id;
        const failure = err => {
          this.$toast(this.$tec(err.code) || this.$t('account.account_1051'));
          // 图片验证码重置
          this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
        };
        const callback = res => {
          if (res && res.code == 200) {
            this.initInterval();
            this.timer = setInterval(() => {
              this.countTime--;
              if (this.countTime === 0) {
                this.initInterval();
              }
            }, 1000);
          } else {
            failure(res);
          }
        };
        if (this.step === 1) {
          this.useUserServer
            .sendPhoneCode({
              type: 1,
              scene_id,
              data,
              validate
            })
            .then(res => {
              callback(res);
            })
            .catch(err => {
              failure(err);
            });
        } else {
          this.useCashServer
            .withdrawSendCode({
              captcha: validate,
              user_type: 2
            })
            .then(res => {
              callback(res);
            })
            .catch(err => {
              failure(err);
            });
        }
      },
      // 校验手机号
      validtorPhone() {
        if (/^1\d{10}$/.test(this.cashForm.phone)) {
          this.errorTip.phone = '';
          return true;
        } else {
          this.errorTip.phone = this.$t('account.account_1069');
          return false;
        }
      },

      // 校验金额
      validtorMoney() {
        if (this.cashForm.money === '') {
          this.errorTip.money = this.$t('cash.cash_1030');
          return false;
        } else if (!/^\d+$|^\d*\.\d{1,2}$/g.test(this.cashForm.money)) {
          this.errorTip.money = this.$t('cash.cash_1034');
          return false;
        } else {
          if (1 - this.cashForm.money > 0) {
            this.errorTip.money = this.$t('cash.cash_1031');
            return false;
          } else if (this.cashForm.money - 800 > 0) {
            this.cashForm.money =
              this.useCashServer.state?.cashInfo.red_packet_balance * 1 > 800
                ? 800
                : this.useCashServer.state?.cashInfo.red_packet_balance;
            this.errorTip.money = '';
            return true;
          } else if (
            this.cashForm.money - this.useCashServer.state?.cashInfo.red_packet_balance >
            0
          ) {
            this.errorTip.money = this.$t('cash.cash_1032');
            return false;
          } else {
            this.errorTip.money = '';
            return true;
          }
        }
      },

      // 校验验证码
      validtorCode() {
        if (this.cashForm.code === '') {
          this.errorTip.code = this.$t('cash.cash_1038');
          return false;
        } else if (/^\d{4,6}$/.test(this.cashForm.code)) {
          this.errorTip.code = '';
          return true;
        } else {
          this.errorTip.code = this.$t('cash.cash_1039');
          return false;
        }
      },

      // 打开协议
      toCashProtol() {
        window.open('https://e.vhall.com/home/vhallapi/exchangeagreement', '_blank');
      },

      // 初始化定时器
      initInterval() {
        clearInterval(this.timer);
        this.timer = null;
        this.countTime = 60;
      },

      // 提现表单关闭
      cashDrawClose() {
        this.cashVisible = false;
        this.step = 1;
        this.$refs.NECaptcha.refreshNECaptha(); // 重置易盾
        this.initInterval(); // 初始化定时器
        this.cashForm = Object.assign({}, defaltCashForm);
        this.errorTip = Object.assign({}, defaultErrorTip);
      },

      // 绑定手机号 -> 验证手机号
      setPhoneHandler() {
        if (this.validtorPhone() && this.validtorCode()) {
          this.useUserServer
            .codeCheck({
              type: 1,
              data: this.cashForm.phone,
              code: this.cashForm.code,
              scene_id: this.cashForm.scene_id
            })
            .then(res => {
              if (res && res.code == 200 && res.data.check_result === 1) {
                this.bindPhoneSave(res.data.key);
              } else {
                this.$toast(this.$tec(res.code) || this.$t('account.account_1052'));
              }
            })
            .catch(err => {
              this.$toast(this.$tec(err.code) || this.$t('account.account_1052'));
            });
        }
      },

      // 绑定手机号事件 -> 执行绑定操作
      bindPhoneSave(key) {
        this.useUserServer
          .bindInfo({
            type: 1,
            account: this.cashForm.phone,
            code: this.cashForm.code,
            scene_id: this.cashForm.scene_id,
            key
          })
          .then(res => {
            if (res && res.code == 200) {
              this.$toast(this.$t('account.account_1053'));
              // 关闭当前弹出框
              this.checkPhoneToWx();
            } else {
              this.$toast(this.$tec(res.code) || this.$t('account.account_1054'));
            }
          })
          .catch(err => {
            console.log(err);
            this.$toast(this.$tec(err.code) || this.$t('account.account_1054'));
          });
      },

      // 提现 测试验证码是8888
      async drawMoney() {
        if (this.validtorMoney() && this.validtorCode()) {
          const bindCheck = await this.withdrawalWap();
          console.log('drawMoney 自动绑定提现结果查看--------->', bindCheck);
          if (bindCheck && bindCheck.code == 200) {
            this.useCashServer
              .withdraw({
                verification_code: this.cashForm.code,
                fee: this.cashForm.money,
                type: 1, // 0-直播收益提现，1-红包收益提现
                user_type: 2 // 用户类型 1-B端用户(默认) 2-C端用户
              })
              .then(res => {
                if (res && res.code == 200) {
                  this.step = 3;
                  this.drawErrorTip = this.$t('cash.cash_1036');
                  this.useCashServer.getCashInfo();
                  this.useCashServer.getCashList();
                } else {
                  console.log(res);
                  this.step = 4;
                  this.drawErrorTip = this.$tec(res.code) || this.$t('cash.cash_1037');
                }
              })
              .catch(err => {
                this.step = 4;
                this.drawErrorTip = this.$tec(err.code) || this.$t('cash.cash_1037');
              });
          }
        }
      },

      // 自动绑定提现结果查看
      withdrawalWap() {
        return new Promise((resolve, reject) => {
          const open_id = sessionStorage.getItem('open_id');
          this.useCashServer
            .withdrawalWap({
              open_id: open_id
            })
            .then(
              res => {
                if (res.code == 200) {
                  resolve(res);
                } else {
                  this.$toast(this.$tec(res.code) || this.$t('cash.cash_1040'));
                  reject(res);
                }
              },
              err => {
                this.$toast(this.$tec(err.code) || this.$t('cash.cash_1040'));
                reject(err);
              }
            );
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-user-cash-popup {
    width: 100%;
    height: 100%;

    .user-info-title {
      width: 100%;
      height: 72px;
      background: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      font-size: 32px;
      font-weight: 600;
      color: #262626;

      .vh-line-arrow-left {
        width: 176px;
        height: 100%;
        display: flex;
        align-items: center;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        font-size: 32px;
        padding-left: 40px;
      }
    }

    .vmp-cash-content {
      .vmp-cash-base {
        height: 432px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        padding-top: 112px;

        .notice {
          height: 104px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          position: absolute;
          right: 0;
          top: 0;
          font-size: 28px;
          color: #3562fa;
        }

        .money-title {
          height: 66px;
          display: flex;
          align-items: center;
          font-size: 28px;
          color: #1a1a1a;
          padding-bottom: 26px;
        }

        .money-num {
          height: 140px;
          font-size: 72px;
          font-weight: bold;
          color: #1a1a1a;
          padding-bottom: 52px;
        }
        .vmp-cash-draw-button {
          width: 360px;
          height: 80px;
          background: #fb3a32;
          font-size: 28px;
          color: #ffffff;
        }
      }

      .vmp-cash-list {
        padding: 0 32px 32px;
        overflow: auto;
        height: 635px;
        height: calc(100vh - 504px);

        .vmp-cash-list-item {
          height: 128px;
          padding: 23px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e6e6e6;

          .item-msg {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .item-msg-title {
              line-height: 40px;
              font-size: 30px;
              color: #262626;
            }
            .item-msg-time {
              line-height: 32px;
              font-size: 26px;
              color: #999999;
            }
          }

          .tag-base {
            font-size: 30px;
            font-weight: 600;
            &.tag-green {
              color: #14ba6a;
            }
            &.tag-red {
              color: #fb3a32;
            }
          }
        }

        .vmp-cash-list-none {
          text-align: center;
          padding-top: 200px;
          font-size: 28px;
          color: #999999;
          line-height: 40px;
        }
      }
    }
  }

  // 提现问题文案弹出框
  .vmp-cash-question {
    width: 680px;
    padding: 60px 40px;
    border-radius: 32px;
    .vmp-cash-question-content {
      width: 100%;
      position: relative;
      font-size: 28px;
      color: #1a1a1a;
      text-align: justify;
      line-height: 40px;

      .vh-line-close {
        position: absolute;
        top: -20px;
        right: -10px;
        color: #c8c9cc;
        width: 44px;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      p {
        span {
          font-size: 32px;
        }
      }
    }
  }

  // 提现表单组件
  .vmp-cash-draw {
    width: 680px;
    padding: 60px 40px;
    border-radius: 32px;

    .cash-form {
      .cash-form-title {
        .title-text {
          height: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 28px;
          color: #1a1a1a;

          .vh-line-close {
            color: #c8c9cc;
          }
        }
        .title-money {
          height: 76px;
          display: flex;
          align-items: baseline;
          font-size: 56px;
          font-weight: 800;
          color: #1a1a1a;

          span {
            font-size: 28px;
            font-weight: normal;
          }
        }
      }
      .cash-bind-notice {
        height: 80px;
        display: flex;
        align-items: center;
        margin: 40px 0 8px;
        color: #fb3a32;
        font-size: 28px;
      }
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

    .vmp-cash-draw-submit {
      width: 100%;
      height: 80px;
      border-radius: 40px;
      background: #fb3a32;
      color: #ffffff;
      font-size: 28px;
    }

    .cash-protol {
      margin-top: 32px;
      height: 40px;
      text-align: left;
      font-size: 28px;

      .cash-link {
        margin-left: 8px;
        color: #3562fa;
      }
    }
  }

  .cash-result {
    height: 640px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .vh-iconfont {
      font-size: 140px;
      padding-top: 172px;
    }

    .vh-full-success {
      color: #14ba6a;
    }

    .vh-full-error {
      color: #fb3a32;
    }

    .result-text {
      width: 100%;
      height: 260px;
      padding-top: 10px;
      text-align: center;
      word-break: break-all;
      line-height: 40px;
      font-size: 28px;
      color: #262626;
    }

    .finish-button {
      width: 360px;
      height: 80px;
      border-radius: 40px;
      background: #fb3a32;
      font-size: 28px;
      color: #ffffff;
    }
  }
</style>
