<template>
  <div class="vhall-lottery" v-if="dialogVisible">
    <!-- 抽奖中 -->
    <div class="postion-container" v-if="prizeShow || lotteryResultShow">
      <i
        :class="['vh-iconfont', lotteryResultShow ? 'vh-line-close' : 'vh-line-circle-close']"
        @click="close"
      />
      <lottery-pending
        v-if="prizeShow"
        mode="live"
        :fitment="fitment"
        :prize-info="prizeInfo"
        :lottery-id="lotteryInfoId"
        :lottery-info="lotteryInfo"
        :disabled-time="disabledTime"
        :winnerList="[]"
        @end="endLottery"
      />
      <lottery-winner
        v-else-if="lotteryResultShow"
        mode="live"
        :fitment="fitment"
        :lottery-id="lotteryInfoId"
        :prize-info="prizeInfo"
        :winner-list="winLotteryUserList"
        @reStart="reStart"
      />
    </div>
    <!-- 发起抽奖 -->
    <div v-else-if="lotteryContentShow" class="payment-dialog">
      <div class="payment-title lottery-headleft">
        <span class="payment-title--text">抽奖</span>
        <span class="payment-title--close vh-iconfont vh-line-close" @click="close"></span>
      </div>
      <lottery-form @startLottery="startLottery" />
    </div>
  </div>
</template>
<script>
  import { useLotteryServer } from 'middle-domain';
  import lotteryForm from './components/lottery-form.vue';
  import lotteryPending from './components/lottery-pending.vue';
  import lotteryWinner from './components/lottery-winner.vue';
  export default {
    components: { lotteryForm, lotteryPending, lotteryWinner },
    name: 'VmpLotteryLive',
    provide() {
      return {
        lotteryServer: this.lotteryServer
      };
    },
    data() {
      return {
        visible: true,
        dialogVisible: false, // 整个组件的显隐(包括背景遮罩)
        fitment: {}, // 正在进行中的抽奖信息
        prizeShow: false, // 趣味抽奖
        lotteryContentShow: false, // 发起抽奖
        lotteryResultShow: false, // 抽奖结果
        lotteryInfoId: '', // 抽奖的信息(接口返回)
        winLotteryUserList: [], // 抽奖的结果
        prizeInfo: {}, // 奖品信息
        lotteryInfo: {},
        disabledTime: 0 // 5秒禁止点击
      };
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({
        mode: 'live'
      });
    },
    created() {
      this.initMsgEvent();
    },
    mounted() {
      if (this.mode === 'live') {
        this.coutDown();
      }
    },
    destroyed() {
      this.removeMsgEvent();
      this.clearTimer();
    },
    methods: {
      initMsgEvent() {
        //监听结束抽奖
        this.lotteryServer.$on(
          this.lotteryServer.Events.LOTTERY_RESULT_NOTICE,
          this.callBackResultNotice
        );
      },
      removeMsgEvent() {
        this.lotteryServer.$off(
          this.lotteryServer.Events.LOTTERY_RESULT_NOTICE,
          this.callBackResultNotice
        );
      },
      // 抽奖结束(需要同步助理/嘉宾)
      callBackResultNotice(msg) {
        const lotteryId = msg.data.lottery_id;
        this.lotteryServer.getWinnerList(lotteryId).then(res => {
          this.winLotteryUserList = res.data.list;
          this.prizeShow = false;
          this.lotteryResultShow = true;
        });
      },
      // 开始计时
      coutDown() {
        this.clearTimer();
        this.disabledTime = 5;
        this.timer = setInterval(() => {
          this.disabledTime--;
          if (this.disabledTime <= 0) {
            this.clearTimer();
          }
        }, 1000);
      },
      // 清除计时
      clearTimer() {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      handleLottery(flag) {
        flag ? this.open() : this.close();
      },
      /**
       * @description 打开整个抽奖组件
       */
      async open() {
        // this.lotteryContentShow = true; // 发起抽奖
        // this.prizeShow = true;
        this.checkLottery().then(() => {
          this.dialogVisible = true;
        });
      },
      /**
       * @description 检查当前状态(抽奖是否开始?结束?)
       */
      checkLottery() {
        return this.lotteryServer
          .checkLottery()
          .then(res => {
            const data = res.data;
            if (data.lottery_status === 0) {
              // 抽奖进行中
              this.handleStartLottery(data);
            } else {
              // 上一轮抽奖已结束
              this.lotteryContentShow = true;
              this.lotteryInfoId = '';
            }
          })
          .catch(err => {
            this.$message.error(err.msg);
          });
      },
      // 关闭整个抽奖界面
      close() {
        this.lotteryResultShow = false; // 抽奖结果
        this.lotteryContentShow = false; // 发起抽奖
        this.prizeShow = false; // 抽奖中
        this.dialogVisible = false;
      },
      // 结束抽奖()
      endLottery() {
        if (!this.lotteryInfoId) return;
        const callback = res => {
          const code = res.code;
          if (code !== 200) {
            if (code === 516703) {
              // 抽奖已结束
              this.close();
            } else {
              this.$message.error(this.$tec(code) || res.msg);
            }
          }
        };
        return this.lotteryServer
          .endLottery(this.lotteryInfoId)
          .then(res => callback(res))
          .catch(err => callback(err));
      },
      /**
       * @description 重新开始一轮抽奖
       */
      reStart() {
        this.lotteryContentShow = true;
        this.lotteryResultShow = false;
        this.lotteryInfoId = '';
      },
      /**
       * @description 主动发起抽奖(倒计时)
       */
      startLottery(payload) {
        this.coutDown();
        this.handleStartLottery(payload);
      },
      /**
       * @description 抽奖按钮
       */
      handleStartLottery(payload) {
        this.lotteryInfoId = payload.id;
        this.fitment = {
          url: payload.icon,
          text: payload.remark,
          title: payload.title,
          img_order: payload.img_order
        };
        this.prizeInfo = payload.award_snapshoot || {};
        this.prizeShow = true;
        this.lotteryContentShow = false;
        this.lotteryInfo = payload;
      }
    }
  };
</script>
<style lang="less">
  .vhall-lottery {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 102;
    .postion-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    .el-form-item__label {
      color: #1a1a1a;
    }
    .el-input__inner {
      padding: 0 12px;
    }
    .payment-dialog {
      width: 440px;
      min-height: 310px;
      position: fixed;
      left: 50%;
      top: 50%;
      left: 50%;
      max-height: 80%;
      overflow: auto;
      background: #fff;
      border-radius: 6px;
      z-index: 777;
      padding: 10px 0;
      transform: translate(-50%, -50%);
      .payment-title {
        font-weight: 500;
        background: #f4f4f4;
        font-size: 14px;
        position: relative;
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
        background: white;
        &--text {
          text-align: left;
          padding: 0 32px;
          color: #1a1a1a;
          font-size: 20px;
          font-weight: 600;
          line-height: 56px;
        }
        &--close {
          position: absolute;
          right: 15px;
          /* top: 50%; */
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          right: 30px;
          top: 55%;
          cursor: pointer;
        }

        .lottery-headleft {
          background: #6d6d6d;
          color: #fff;
          justify-content: flex-start;
        }
      }

      .lottery-result {
        background: #fff;
        margin-bottom: 32px;
        .result-img {
          text-align: center;
          img {
            width: 80px;
            height: 80px;
            margin: 32px auto 8px;
            border-radius: 50%;
          }
          p {
            font-size: 14px;
            font-weight: 400;
            color: #222;
            line-height: 22px;
            margin-bottom: 12px;
          }
        }
        .result-table-head {
          text-align: center;
          color: #333;
          background: #f5f5f5;
          width: 396px;
          line-height: 42px;
          margin: 0 auto;
          border-radius: 8px 8px 0px 0px;
          border-bottom: 1px solid #fff;
        }
        ul {
          width: 396px;
          margin: 0 auto;
          margin-bottom: 16px;
          max-height: 500px;
          overflow-y: auto;
          background: #f5f5f5;
          li {
            width: 240px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: 42px;
            padding-left: 20px;
            line-height: 42px;
            font-size: 14px;
            font-weight: 400;
            color: #222;
            img {
              width: 24px;
              height: 24px;
              vertical-align: middle;
              border-radius: 50%;
              margin-right: 8px;
            }
          }
        }

        .lottery-chat {
          width: 100%;
          text-align: center;
          .Audience-one {
            img {
              margin: 42px auto 24px;
              display: block;
              width: 100px;
              height: 100px;
            }
            p {
              font-size: 16px;
              font-weight: 400;
              color: #222;
              line-height: 22px;
              margin-bottom: 48px;
            }
            .winning-status {
              color: #fb3a32;
            }
          }
        }
      }

      .recive-prize {
        .title {
          font-size: 14px;
          font-weight: 400;
          color: #222;
          line-height: 20px;
          margin: 32px auto 14px;
          text-align: left;
          width: 356px;
        }
        .form-style {
          width: 356px;
          margin: 0 auto;
        }
      }

      .vh-line-close {
        color: #000;
        &:hover {
          color: #000;
        }
      }
    }
    .vmp-lottery-btn {
      width: 160px;
      height: 40px;
      text-align: center;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      border-radius: 20px;
      background: #fb2626;
      border: 0;
    }
    .vh-line-close {
      position: absolute;
      top: 24px;
      right: 32px;
      cursor: pointer;
      color: #f6c667;
      z-index: 10;
      &:hover {
        color: #fc9600;
      }
    }
    .vh-line-circle-close {
      position: absolute;
      bottom: -45px;
      color: #fff;
      font-size: 27px;
      display: inline-block;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
    }
    .lottery-box {
      position: relative;
      box-sizing: border-box;
      width: 424px;
      background: linear-gradient(37.94deg, #fffbe8 3.86%, #fbf0e6 84.36%);
      border-radius: 12px;
      text-align: center;
      padding: 24px 32px;
    }
  }
  .el-select-dropdown__list .el-select-dropdown__item {
    line-height: 36px !important;
    height: 36px;
  }
  .el-button {
    /* 默认按钮 */
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    line-height: 20px;
    border: 1px solid #ccc;
    padding: 9px 48px;
    color: #666;
    &:hover {
      color: #fff;
      background: #fb3a32;
      border: 1px solid #fb3a32;
    }
    &:active {
      color: #fff;
      background: #e2332c;
      border: 1px solid #e2332c;
    }
    &.is-disabled {
      background: transparent;
      border: 1px solid #e6e6e6;
      cursor: not-allowed;
      color: #b3b3b3;
      background: #fff;
      &:hover,
      &:active {
        color: #b3b3b3;
        background: #fff;
        border: 1px solid #e6e6e6;
      }
    }
  }
</style>
