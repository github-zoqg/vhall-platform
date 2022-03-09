<template>
  <div class="lottery-losing-dialog" :class="{ 'lottery-losing-dialog__no-list': !showWinnerList }">
    <span class="lottery-res">{{ $t('interact_tools.interact_tools_1074') }}</span>
    <p class="lottery-title">{{ $t('interact_tools.interact_tools_1010') }}</p>
    <p class="lottery-title">{{ $t('interact_tools.interact_tools_1011') }}</p>
    <div v-if="showWinnerList" class="lottery-check-ret-btn" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </div>
    <i class="lottery__close-btn vh-iconfont vh-line-circle-close" @click="close"></i>
  </div>
</template>
<script>
  /**
   * 没有中奖
   */
  export default {
    name: 'LotteryMiss',
    props: {
      showWinnerList: {
        type: Boolean,
        default() {
          return false;
        }
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>

<style lang="less" scoped>
  .lottery-losing-dialog {
    width: 424px;
    height: 334px;
    background: url(../img/lose-lottery.png);
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 66px;
    position: relative;
    .lottery-res {
      position: absolute;
      line-height: 46px;
      top: 2px;
      color: #fff;
    }
    .lottery-title {
      line-height: 22px;
      font-size: 16px;
      color: #ffffff;
    }
    .lottery-check-ret-btn {
      margin-top: 183px;
      width: 160px;
      height: 40px;
      text-align: center;
      line-height: 40px;
      color: #fb3a32;
      font-size: 14px;
      user-select: none;
      cursor: pointer;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.9);
    }
    &.lottery-losing-dialog__no-list {
      background: url(../img/lose-lottery-no-list.png);
      height: 314px;
      padding-top: 86px;
      .lottery-check-ret-btn {
        display: none;
      }
    }
  }
</style>
