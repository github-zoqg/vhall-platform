<template>
  <div class="red-packet">
    <el-dialog :visible.sync="sendDialogVisible" width="450px" title="红包">
      <div class="pay-form">
        <div class="form-group" :class="{ error: redcouponMaxNumError }">
          <label class="label-left">个数</label>
          <input
            type="text"
            v-model="numbers"
            @input="inputNumbers"
            @change="changeNumbers"
            placeholder="填写个数"
          />
          <label class="label-right">个</label>
        </div>
        <p class="envelope-tips">
          当前
          <span class="online">{{ onlineAmount }}</span>
          人在线
        </p>
        <div class="form-group" :class="{ error: redcouponMaxNum }">
          <template v-if="redcouponType === 0">
            <label class="label-left">总金额</label>
            <input
              type="text"
              v-model="inputAmount"
              @change="changeAmount"
              @input="inputAmounts"
              placeholder="填写金额"
            />
            <label class="label-right">元</label>
          </template>
          <template v-if="redcouponType === 1">
            <label class="label-left">单个金额</label>
            <input
              type="text"
              v-model="inputAmount"
              @change="changeAmount"
              @input="inputAmounts"
              placeholder="填写金额"
            />
            <label class="label-right">元</label>
          </template>
        </div>
        <p class="envelope-tips" v-show="redcouponType === 0">
          当前为拼手气红包,
          <span @click="changeType(1)">改为均分红包</span>
        </p>
        <p class="envelope-tips" v-show="redcouponType === 1">
          当前为均分红包,
          <span @click="changeType(0)">改为拼手气红包</span>
        </p>
        <div class="form-group">
          <label class="label-left labal-note">留言</label>
          <input
            type="text"
            class="envelope-note"
            v-model="describe"
            placeholder="多谢大家支持"
            maxlength="15"
          />
        </div>
        <div class="total-money total-algin">
          ￥
          <span>{{ amount }}</span>
        </div>
        <div class="pay-box">
          <el-radio v-model="channel" label="ALIPAY">
            <i class="vh-iconfont vh-zhifubao"></i>
            支付宝
          </el-radio>
          <el-radio v-model="channel" label="WEIXIN">
            <i class="vh-iconfont vh-weixinzhifu"></i>
            微信支付
          </el-radio>
        </div>
        <p class="btnsbox">
          <el-button
            type="primary"
            round
            :disabled="amount <= 0"
            class="start-btn"
            @click="redpacketSend"
          >
            塞钱进红包
          </el-button>
        </p>
        <div class="red-tips">
          <p>
            提示：未领取的红包将在24小时内退款到您的微吼账户/财务中心/财务收益[红包]收益（具体到账时间以银行流程为准）
          </p>
        </div>
      </div>
    </el-dialog>
    <!-- 二维码 -->
    <el-dialog
      :visible.sync="qrCodeDialogVisible"
      width="360px"
      :title="paySuccess ? '支付结果' : '支付方式'"
      custom-class="payment-dialog-wechat-qr"
    >
      <div class="complete" v-if="paySuccess">
        <div class="pay-success">
          <div class="content">
            <i class="vh-iconfont vh-line-circle-check"></i>
            <p>支付成功</p>
            <div class="total-money">
              ￥
              <span>{{ amount }}</span>
            </div>
          </div>
          <p class="btnsbox pay-suce">
            <el-button @click="close" type="primary-white" round>知道了</el-button>
          </p>
        </div>
      </div>
      <div v-else>
        <div class="title">
          ￥
          <span>{{ this.amount }}</span>
          <p>打开微信【扫一扫】付款</p>
        </div>
        <div class="code-img">
          <img :src="wechatPayImg" alt="微信付款二维码" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import QRcode from 'qrcode';
  import { useRedPacketServer, useMemberServer } from 'middle-domain';
  const RED_ENVELOPE_OK = 'red_envelope_ok'; // 支付成功消息
  export default {
    name: 'VmpRedPacketLive',
    data() {
      const memberServerState = this.memberServer.state;
      return {
        memberServerState,
        sendDialogVisible: false, // 发送红包的dialog界面
        qrCodeDialogVisible: false, // 微信支付和成功的弹窗
        paySuccess: false,
        paying: false,
        wechatPayImg: '',
        channel: 'WEIXIN',
        inputAmount: '',
        numbers: '',
        redcouponMaxNum: false,
        redcouponMaxNumError: false,
        redcouponType: 0,
        amount: '0.00',
        describe: '多谢大家支持',
        redcouponMinNum: false
      };
    },
    computed: {
      onlineAmount() {
        return this.memberServerState.totalNum;
      }
    },
    beforeCreate() {
      this.redPacketServer = useRedPacketServer();
      this.memberServer = useMemberServer();
    },
    created() {
      this.redPacketServer.$on(RED_ENVELOPE_OK, () => {
        this.paySuccess = true;
        this.qrCodeDialogVisible = true;
      });
    },
    methods: {
      open() {
        this.channel === 'ALIPAY';
        this.sendDialogVisible = true;
        this.qrCodeDialogVisible = false;
        this.paySuccess = false;
      },
      backPay() {
        this.qrCodeDialogVisible = false;
        this.paySuccess = false;
      },
      redpacketSend() {
        // 1. 数据验证
        if (this.numbers < 1 || !this.numbers) {
          this.$message.warning('红包个数应大于等于1');
          return false;
        }
        if (this.numbers > this.onlineAmount) {
          this.$message.warning('红包个数应小于等于在线人数');
          return false;
        }
        if (this.numbers > 1000) {
          this.$message.warning('红包个数应小于等于1000');
          return false;
        }
        if (this.amount === '0.00') {
          // 如果总金额为0 或者红包单个平均小于0.01元，不执行
          this.$message.warning('红包金额不能为空');
          return false;
        }
        if (this.redcouponType == 0) {
          // 拼手气
          if (this.redcouponMinNum) {
            this.$message.warning('每个红包的金额数不能少于0.01元');
            return false;
          }
        }
        if (this.amount > 20000) {
          this.$message.warning('红包的总金额数不能大于20000元');
          return false;
        }
        const serviceCode = this.channel === 'ALIPAY' ? 'CASHIER' : 'QR_PAY';
        this.redPacketServer
          .createRedPacket({
            type: this.redcouponType,
            describe: this.describe,
            number: this.numbers,
            amount: parseFloat(this.amount),
            channel: this.channel,
            service_code: serviceCode
          })
          .then(res => {
            this.paying = false;
            if (res.code === 200) {
              if (this.channel === 'ALIPAY') {
                window.open(res.data.pay_data);
              } else {
                QRcode.toDataURL(res.data.pay_data, (_, url) => {
                  this.qrCodeDialogVisible = true;
                  this.sendDialogVisible = false;
                  this.paySuccess = false;
                  this.wechatPayImg = url;
                });
              }
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(error => {
            this.$message.error(error.msg);
            console.log(error);
          });
      },
      changeType(val) {
        this.redcouponType = val;
        this.changeAmount();
      },
      inputNumbers() {
        const val = this.numbers;
        const num = isNaN(parseInt(val)) ? '' : parseInt(val);
        if (num === '') {
          this.amount = '0.00';
          this.numbers = num;
          return;
        }
        if (num > 1000) {
          this.numbers = 1000;
          this.redcouponMaxNumError = true;
          this.$emit('redcouponMaxNum');
          console.log('最多1000个');
        } else {
          this.numbers = num;
          this.redcouponMaxNumError = false;
        }
        this.changeAmount();
      },
      changeNumbers() {
        this.redcouponMaxNumError = false;
      },
      changeAmount() {
        this.redcouponMaxNum = false;
        const val = this.inputAmount;
        let num = isNaN(parseFloat(val)) ? '' : parseFloat(val);
        if (num === '') {
          this.amount = '0.00';
          return;
        }
        if (this.redcouponType === 0) {
          // 随机
          if (num > 20000) {
            num = 20000;
          }
          if (!this.numbers) {
            this.amount = '0.00';
            this.inputAmount = num.toFixed(2);
          } else {
            this.amount = this.inputAmount = num.toFixed(2);

            if (num / this.numbers < 0.01) {
              this.redcouponMaxNum = true;
              this.redcouponMinNum = true;
              this.$emit('redcouponMinNum', 0.01);
              return;
            }
          }
        } else {
          if (this.redcouponType === 1) {
            // 平均
            if (this.numbers > 1000) {
              this.numbers = 1000;
            }
            if (this.inputAmount * this.numbers > 20000) {
              this.amount = 20000;
              this.inputAmount = (20000 / this.numbers).toFixed(2);
            }
            this.amount = (this.inputAmount * this.numbers).toFixed(2);
          }
        }
      },
      /**
       * @description 金额的输入校验
       */
      inputAmounts() {
        const val = this.inputAmount;
        let num = isNaN(parseFloat(val)) ? '' : parseFloat(val);
        if (num === '') {
          this.amount = '0.00';
          this.inputAmount = '';
          return;
        }
        if (this.redcouponType === 0) {
          // 随机
          if (num > 20000) {
            this.redcouponMaxNum = true;
            this.$emit('MoneyMaxOver', 20000);
            console.log('最大20000');
            num = 20000;
          } else {
            this.redcouponMaxNum = false;
          }
          if (!this.numbers) {
            this.amount = '0.00';
          } else {
            if (num / this.numbers < 0.01) {
              this.redcouponMaxNum = true;
              this.redcouponMinNum = true;
              this.$emit('redcouponMinNum', 0.01);
              console.log('小于0.01');
              return;
            }
            this.redcouponMinNum = false;
            this.amount = num.toFixed(2);
          }
        } else {
          // 平均
          console.warn((num * this.numbers).toFixed(2));
          if ((num * this.numbers).toFixed(2) > 20000) {
            this.redcouponMaxNum = true;
            this.inputAmount = (20000 / this.numbers).toFixed(2);
          } else {
            this.amount = (num * this.numbers).toFixed(2);
          }
        }
      },
      async close() {
        this.qrCodeDialogVisible = false;
        this.sendDialogVisible = false;
      }
    }
  };
</script>
<style lang="less">
  .pay-form {
    .el-radio {
      margin-right: 20px;
      color: #1a1a1a;
    }
    .el-radio__input.is-checked .el-radio__inner {
      background-color: #fb3a32;
      border-color: #fb3a32;
    }
    .el-radio__label {
      padding-left: 0;
    }
    .el-radio__inner {
      width: 16px;
      height: 16px;
    }
    .el-radio__inner::after {
      width: 8px;
      height: 8px;
    }
    .el-radio__inner:hover {
      border-color: #fb3a32;
    }
    .el-radio__input.el-radio__label,
    .el-radio__input.is-checked + .el-radio__label {
      color: #1a1a1a;
    }
  }
  .payment-dialog-wechat-qr {
    .el-dialog__body {
      padding-bottom: 20px;
    }
  }
</style>
<style lang="less" scoped>
  &.qrCodeDialogVisible {
    width: 364px;
    height: 364px;
    background-color: #fff;
  }
  .header {
    color: #fff;
    line-height: 56px;
    position: relative;
    height: 56px;
    padding: 0 32px;
    .back {
      position: absolute;
      top: 0px;
      left: 14px;
      cursor: pointer;
      font-size: 12px;
    }
    h3 {
      text-align: left;
      font-weight: 500;
      font-size: 20px;
      color: #1a1a1a;
    }
    .close {
      position: absolute;
      top: 0px;
      right: 32px;
      cursor: pointer;
      font-size: 12px;
      color: #333;
    }
  }

  .pay-form {
    // padding: 20px 32px 0;
    text-align: center;
    background: #fff;
    line-height: 28px;
    .form-group {
      overflow: hidden;
      .label-left {
        width: 60px;
        float: left;
        display: block;
        color: #1a1a1a;
        font-size: 14px;
        font-weight: 400;
        text-align: right;
        line-height: 40px;
      }
      .labal-note {
        line-height: 55px;
      }
      input {
        display: block;
        line-height: 40px;
        height: 40px;
        width: 310px;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding-left: 10px;
        margin-left: 4px;
        float: left;
        outline: none;
      }
      .label-right {
        display: block;
        float: left;
        margin-left: -20px;
        font-size: 12px;
        margin-top: 7px;
      }
      .envelope-note {
        box-sizing: border-box;
        width: 310px;
        text-align: left;
        padding: 0 12px;
        margin-left: 5px;
        margin-top: 10px;
      }
    }
    .envelope-tips {
      font-size: 14px;
      color: #999;
      padding-left: 64px;
      text-align: left;
      .online {
        color: #fb3a32;
      }
      span {
        color: #3562fa;
        cursor: pointer;
      }
    }
    .total-money {
      font-size: 20px;
      background: none;
      text-align: center;
      margin: 15px 0;
      color: #fb3a32;
      padding-left: 45px;
      span {
        font-size: 32px;
        font-weight: 500;
      }
    }
    .pay-box {
      display: flex;
      font-size: 14px;
      color: #1a1a1a;
      margin-left: 113px;
      i {
        font-size: 24px;
        vertical-align: middle;
        padding: 0 3px;
      }
      .iconzhifubao {
        color: #0fa9f1;
      }
      .iconweixinzhifu {
        color: #30bb07;
      }
      label {
        display: flex;
        align-items: center;
        vertical-align: middle;
        span {
          margin-left: 5px;
        }
        img {
          margin-left: 5px;
        }
      }
    }
  }
  .btnsbox {
    padding: 20px 0;
    text-align: center;
    .start-btn {
      width: 312px;
      margin-left: 65px;
      line-height: 20px;
    }
    .btn {
      display: inline-block;
      width: 284px;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      background: #fc5659;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      &.disabled {
        opacity: 0.6;
        cursor: default;
      }
      &.btn-light-red:hover {
        background: #c51f1d;
      }
    }
  }
  .red-tips {
    padding-bottom: 24px;
    text-align: left;
    p {
      color: #999;
      font-size: 12px;
      line-height: 17px;
    }
  }
  .payment-dialog-wechat-qr {
    padding-bottom: 20px;
    .title {
      margin-top: 10px;
      font-size: 20px;
      display: block;
      background: none;
      color: #fb3a32;
      text-align: center;
      span {
        font-size: 34px;
      }
      p {
        margin: 5px 0 10px 0;
        color: #1a1a1a;
        font-size: 14px;
      }
    }
    .code-img {
      width: 140px;
      height: 140px;
      margin: 20px auto 0;
      border-radius: 4px;
      padding: 1px;
      border: 1px solid #e2e2e2;
      img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
    }
    .complete {
      text-align: center;
      .pay-success {
        padding-top: 5px;
        .content {
          padding-top: 30px;
          i {
            font-size: 50px;
            color: #14ba6a;
          }
          p {
            color: #666;
            font-size: 18px;
            line-height: 25px;
            padding: 10px 0;
          }
          .total-money {
            color: #1a1a1a;
            font-size: 14px;
            line-height: 40px;
            padding-bottom: 20px;
            span {
              font-size: 34px;
              font-weight: 500;
            }
          }
        }
        .pay-suce {
          .el-button {
            width: 160px;
          }
        }
      }
    }
  }
</style>
