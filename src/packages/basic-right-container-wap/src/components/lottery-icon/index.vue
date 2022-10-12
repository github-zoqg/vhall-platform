<template>
  <div class="icon-wrap" v-if="lotteryServerState.iconVisible">
    <img
      class="icon"
      src="./images/icon_no.png"
      alt=""
      @click="checkLotteryIcon"
      v-if="lotteryServerState.docVisible"
    />
    <img class="icon" src="./images/icon.png" alt="" @click="checkLotteryIcon" v-else />
    <!-- <i class="dot" v-if="lotteryServerState.docVisible" /> -->
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
  .icon-wrap {
    margin-bottom: 10px;
    width: 84px;
    height: 84px;
    position: relative;
    background-color: transparent;
    .icon {
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
