<template>
  <div class="icon-wrap" v-if="showIcon" @click="checkLotteryIcon">
    <img src="./images/icon.png" alt="" />
    <i class="dot" v-if="showDot" />
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
      this.checkLotteryStatus();
    },
    destroyed() {
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_PUSH, this.handleNewLottery);
    },
    methods: {
      checkLotteryIcon() {
        this.$emit('clickIcon');
      },
      handleNewLottery() {
        this.showIcon = true;
        this.showDot = true;
      },
      /**
       * @description 房间初始化检查当前是否应该显示抽奖按钮
       */
      checkLotteryStatus() {
        this.lotteryServer.checkLottery().then(res => {
          const data = res.data;
          if (data.id) {
            this.showIcon = true;
            if (data.win) {
              this.showDot = true;
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
