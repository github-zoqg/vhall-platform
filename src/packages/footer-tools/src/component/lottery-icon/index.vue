<template>
  <div class="vmp-lottery-icon" v-if="lotteryServerState.iconVisible" @click="checkLotteryIcon">
    <img class="lottery-icon" src="./images/lottery-icon.png" alt="" />
    <i class="vmp-dot" v-if="lotteryServerState.docVisible" />
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
    },
    methods: {
      checkLotteryIcon() {
        this.$emit('clickIcon');
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-icon {
    color: #fff;
    position: relative;
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
</style>
