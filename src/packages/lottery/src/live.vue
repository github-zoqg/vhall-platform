<template>
  <div class="vhall-lottery" v-if="dialogVisible">
    <!-- 抽奖中 -->
    <lottery-pending
      v-if="prizeShow"
      mode="live"
      :fitment="fitment"
      :prize-info="prizeInfo"
      :lottery-id="lotteryInfoId"
      :lottery-info="lotteryInfo"
      @close="close"
      @end="handleEndLottery"
    />
    <lottery-winner
      mode="live"
      v-else-if="lotteryResultShow"
      :prize-info="prizeInfo"
      :winner-list="winLotteryUserList"
      @reStart="reStart"
      @close="close"
    />
    <!-- 发起抽奖 -->
    <div v-else-if="lotteryContentShow" class="payment-dialog">
      <div class="payment-title lottery-headleft">
        <span class="payment-title--text">抽奖</span>
        <span class="payment-title--close vh-iconfont vh-line-close" @click="close"></span>
      </div>
      <lottery-form @startLottery="handleStartLottery" />
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
    data() {
      return {
        dialogVisible: false, // 整个组件的显隐(包括背景遮罩)
        fitment: {}, // 正在进行中的抽奖信息
        prizeShow: false, // 趣味抽奖
        lotteryContentShow: false, // 发起抽奖
        lotteryResultShow: false, // 抽奖结果
        lotteryInfoId: null, // 抽奖的信息(接口返回)
        winLotteryUserList: [], // 抽奖的结果
        prizeInfo: {}, // 奖品信息
        lotteryInfo: {}
      };
    },
    provide() {
      return {
        lotteryServer: this.lotteryServer
      };
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({
        mode: 'live'
      });
    },
    methods: {
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
              this.lotteryInfoId = null;
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
      // 结束抽奖
      handleEndLottery() {
        if (!this.lotteryInfoId) return;
        return this.lotteryServer.endLottery(this.lotteryInfoId).then(res => {
          if (res.code === 200) {
            this.winLotteryUserList = res.data.lottery_users;
            // console.warn('抽奖完成', res.data, res.data.award_snapshoot);
            // this.closeShow = true;
            // this.lotteryResultShow = true;
            // this.lotteryEndResult = res.data.lottery_users; // 中奖用户人信息列表
            // this.lotteryResultObj.url =
            //   res.data.award_snapshoot && res.data.award_snapshoot.image_url
            //     ? res.data.award_snapshoot.image_url
            //     : '';
            // this.lotteryResultObj.text =
            //   res.data.award_snapshoot && res.data.award_snapshoot.award_name
            //     ? res.data.award_snapshoot.award_name
            //     : '';
            this.prizeShow = false;
            this.lotteryResultShow = true;
          }
        });
      },
      /**
       * @description 重新开始一轮抽奖
       */
      reStart() {
        this.lotteryContentShow = true;
        this.lotteryResultShow = false;
        this.lotteryInfoId = null;
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
        this.prizeObj = payload.award_snapshoot;
        this.prizeShow = true;
        this.lotteryContentShow = false;
        this.lotteryInfo = payload;
      }
    }
  };
</script>
<style lang="less">
  @fontRegular: ' PingFangSC-Regular';

  .vhall-lottery {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 30;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
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
      margin-left: -300px;
      top: 50%;
      max-height: 80%;
      overflow: auto;
      margin-top: -200px;
      background: #fff;
      border-radius: 6px;
      z-index: 777;
      padding: 10px 0;

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
          // padding-top: 10px;
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
            font-family: @fontRegular;
            font-weight: 400;
            color: #222222;
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
            font-family: @fontRegular;
            font-weight: 400;
            color: #222222;
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
              font-family: @fontRegular;
              font-weight: 400;
              color: #222222;
              line-height: 22px;
              margin-bottom: 48px;
            }
            .winning-status {
              color: #fc5659;
            }
          }
        }
      }

      .recive-prize {
        .title {
          font-size: 14px;
          font-family: @fontRegular;
          font-weight: 400;
          color: #222222;
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
    border: 1px solid #cccccc;
    padding: 9px 48px;
    color: #666666;
    &:hover {
      color: #fff;
      background: #fb3a32;
      border: 1px solid #fb3a32;
    }
    &:active {
      color: #ffffff;
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
