<template>
  <div class="vmp-lottery-icon" v-if="showIcon" @click="checkLotteryIcon">
    <img src="./images/lottery-icon.png" alt="" class="show_img" />
    <i class="vmp-dot" v-if="dotVisible" />
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
        dotVisible: false // 显示小红点
      };
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({
        mode: 'watch'
      });
    },
    created() {
      this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_PUSH, this.handleNewLottery);
      this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_WIN, this.showDot);
      this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_MISS, this.hideDot);
      this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_SUBMIT, this.hideDot);
      this.checkLotteryStatus();
    },
    destroyed() {
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_PUSH, this.handleNewLottery);
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_WIN, this.showDot);
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_MISS, this.hideDot);
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_SUBMIT, this.hideDot);
    },
    methods: {
      checkLotteryIcon() {
        this.$emit('clickIcon');
        this.dotVisible = false;
      },
      handleNewLottery() {
        this.showIcon = true;
        this.dotVisible = true;
      },
      showDot() {
        this.dotVisible = true;
      },
      hideDot() {
        this.dotVisible = false;
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
            if (data.lottery_status === 0) {
              // 抽奖中
              this.dotVisible = true;
            } else if (data.win === 1 && data.take_award === 0) {
              // 中奖未领奖
              this.dotVisible = true;
            }
          }
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-lottery-icon {
    color: #fff;
    position: relative;
    width: 32px;
    height: 32px;
    line-height: 32px;
    background: linear-gradient(180deg, #fca810 0%, #ff9e31 100%);
    border-radius: 16px;
    cursor: pointer;
    margin-left: 16px;
    img.show_img {
      width: 32px;
      height: 32px;
      -webkit-transform-origin: left center;
      transform-origin: left center;
      margin: -1px 0 0 0;
    }

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
    img {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
  }
</style>
