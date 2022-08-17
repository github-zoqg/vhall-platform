<template>
  <div class="vmp-lottery-icon" v-if="lotteryServerState.iconVisible">
    <span class="vmp-icon-wrap" @click="throttleCheckLottery">
      <img class="lottery-icon" src="./images/lottery-icon.png" alt="" />
      <i class="vmp-dot" v-if="lotteryServerState.docVisible" />
    </span>
    <!-- 关闭的遮罩层 -->
    <div class="transparent-layer" v-if="lotteryListoryVisible" @click.stop="closeHistory"></div>
    <div class="vmp-lottery-history-container" v-if="lotteryListoryVisible">
      <lottery-history
        :win-lottery-history="winLotteryHistory"
        @takeAward="handleTakeAward"
        @close="closeHistory"
      />
    </div>
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useLotteryServer } from 'middle-domain';
  import lotteryHistory from './lottery-history.vue';
  import { throttle } from 'lodash';
  export default {
    name: 'LotteryIcon',
    components: {
      lotteryHistory
    },
    data() {
      const lotteryServerState = this.lotteryServer.state;
      return {
        lotteryServerState,
        winLotteryHistory: [], // 中奖的抽奖历史
        lotteryListoryVisible: false
      };
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({
        mode: 'watch'
      });
    },
    created() {
      this.lotteryServer.initIconStatus();
      this.initEvent();
      this.throttleCheckLottery = throttle(this.checkLotteryIcon, 1000, { trailing: false });
    },
    beforeDestroy() {
      this.removeEvent();
    },
    methods: {
      initEvent() {
        this.lotteryServer.$on('ShowHistory', this.handleShowHistory);
        this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_PUSH, this.closeHistory);
        this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_RESULT_NOTICE, this.closeHistory);
      },
      removeEvent() {
        this.lotteryServer.$off('ShowHistory', this.handleShowHistory);
        this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_PUSH, this.closeHistory);
        this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_RESULT_NOTICE, this.closeHistory);
      },
      handleShowHistory(list = []) {
        this.winLotteryHistory = list;
        this.lotteryListoryVisible = true;
      },
      checkLotteryIcon() {
        this.$emit('clickIcon');
      },
      // 传递到外组件做事件驱动
      handleTakeAward(lottery) {
        this.lotteryListoryVisible = false;
        this.$emit('takeAward', lottery);
      },
      closeHistory() {
        this.lotteryListoryVisible = false;
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-icon {
    margin-left: 16px; //撑开左间距
    .vmp-icon-wrap {
      color: #fff;
      position: relative;
      display: inline;
      .vmp-dot {
        position: absolute;
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #fb3a32;
        border: 1px solid #2a2a2a;
        border-radius: 50%;
        right: -3px;
        position: absolute;
      }
      .lottery-icon {
        width: 32px;
        height: 32px;
        cursor: pointer;
      }
    }
    .transparent-layer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 11;
      background: transparent;
    }
    .vmp-lottery-history-container {
      position: absolute;
      right: 12px;
      bottom: 60px;
      z-index: 12;
    }
  }
</style>
