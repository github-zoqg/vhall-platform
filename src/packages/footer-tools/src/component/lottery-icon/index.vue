<template>
  <div class="vmp-lottery-icon" v-if="lotteryServerState.iconVisible">
    <span class="vmp-icon-wrap" @click="throttleCheckLottery">
      <img class="lottery-icon" src="./images/lottery-icon.png" alt="" />
      <i class="vmp-dot" v-if="lotteryServerState.docVisible" />
    </span>
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useLotteryServer } from 'middle-domain';
  import { throttle } from 'lodash';
  export default {
    name: 'LotteryIcon',
    data() {
      const lotteryServerState = this.lotteryServer.state;
      return {
        lotteryServerState
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
        this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_PUSH, this.closeHistory);
        this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_RESULT_NOTICE, this.closeHistory);
      },
      removeEvent() {
        this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_PUSH, this.closeHistory);
        this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_RESULT_NOTICE, this.closeHistory);
      },
      checkLotteryIcon() {
        this.$emit('clickIcon');
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
        background: #fb2626;
        border: 1px solid #fb2626;
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
  }
</style>
