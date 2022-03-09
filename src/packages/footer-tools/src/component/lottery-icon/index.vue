<template>
  <div class="vmp-lottery-icon" v-if="showIcon" @click="checkLotteryIcon">
    <img src="./images/lottery-icon.png" alt="" />
    <i class="vmp-dot" v-if="showDot" />
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useLotteryServer } from 'middle-domain';
  export default {
    name: 'LotteryIcon',
    data() {
      return {
        showIcon: false, //显示图标
        showDot: false // 显示小红点
      };
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({
        mode: 'watch'
      });
    },
    created() {
      this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_PUSH, this.handleNewLottery);
      this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_WIN, this.handleLotteryWin);
      this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_MISS, this.handleLotteryMiss);
      this.checkLotteryStatus();
    },
    destroyed() {
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_PUSH, this.handleNewLottery);
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_WIN, this.handleLotteryWin);
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_MISS, this.handleLotteryMiss);
    },
    methods: {
      checkLotteryIcon() {
        this.$emit('clickIcon');
      },
      handleNewLottery() {
        this.showIcon = true;
        this.showDot = true;
      },
      handleLotteryWin() {
        this.showDot = true;
      },
      handleLotteryMiss() {
        this.showDot = false;
      },
      /**
       * @description 房间初始化检查当前是否应该显示抽奖按钮
       */
      checkLotteryStatus() {
        this.lotteryServer.checkLottery().then(res => {
          const data = res.data;
          // 初始进入的时候只要发过抽奖,,就显示icon和dot
          if (data?.id) {
            this.showIcon = true;
            this.showDot = true;
          }
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-lottery-icon {
    color: #fff;
    margin-left: 16px;
    position: relative;
    .vmp-dot {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      top: 10px;
      right: -3px;
      position: absolute;
    }
    img {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
  }
</style>
