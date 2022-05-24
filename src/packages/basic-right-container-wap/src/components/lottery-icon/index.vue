<template>
  <div class="icon-wrap" v-if="showIcon" @click="checkLotteryIcon">
    <img src="./images/icon.png" alt="" />
    <i class="dot" v-if="dotVisible" />
    <!-- 关闭的遮罩层 -->
    <div
      class="transparent-layer"
      v-if="lotteryListoryVisible"
      @click="lotteryListoryVisible = false"
    >
      <lottery-history />
    </div>
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useLotteryServer } from 'middle-domain';
  import lotteryHistory from './lottery-history.vue';
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
  .vmp-red-packet-icon {
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
  .icon-wrap {
    margin-bottom: 10px;
    width: 84px;
    height: 84px;
    position: relative;
    background-color: transparent;
    img {
      width: 84px;
      height: 84px;
    }
    .dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #ff0005;
      content: '';
    }
  }
</style>
