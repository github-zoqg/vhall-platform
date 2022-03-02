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
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  const RED_ENVELOPE_OK = 'red_envelope_ok'; // 支付成功消息
  export default {
    name: 'LotteryIcon',
    data() {
      return {
        showIcon: true, //显示图标
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
    },
    destroyed() {
      this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_PUSH, this.handleNewLottery);
    },
    methods: {
      checkLotteryIcon() {
        this.showDot = false;
        this.$emit('clickIcon');
        // window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLotteryIcon'));
      },
      handleNewLottery() {
        this.showIcon = true;
        this.showDot = true;
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
</style>
