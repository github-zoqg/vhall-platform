<template>
  <div class="no-win-lottery">
    <div class="no-win-lottery-img" />
    <p class="lottery-result" :data-text="`很遗憾, ${$t('interact_tools.interact_tools_1010')}`">
      {{ `很遗憾, ${$t('interact_tools.interact_tools_1010')}` }}
    </p>
    <p class="no-win-tip">{{ $t('interact_tools.interact_tools_1011') }}!</p>
    <button class="vmp-lottery-btn" v-if="showWinnerList" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  import props from './props';
  export default {
    name: 'LotteryMiss',
    mixins: [props],
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>
<style lang="less">
  .no-win-lottery {
    width: 100vw;
    text-align: center;
    .no-win-lottery-img {
      width: 220px;
      height: 220px;
      margin: 20px auto 0;
      background-image: url('../img/lottery-miss.png');
      background-size: contain;
      background-repeat: no-repeat;
    }
    .lottery-result {
      position: relative;
      font-weight: 600;
      font-size: 54px;
      line-height: 64px;
      color: #fef8f4;
      -webkit-text-stroke: 12px #eb6a37;
      text-shadow: 0px 2px 2px rgba(197, 21, 14, 0.56);
      transform: matrix(0.99, 0, -0.15, 1, 0, 0);
      &::before {
        content: attr(data-text);
        position: absolute;
        -webkit-text-stroke: 0;
        color: #fef8f4;
      }
    }
    .no-win-tip {
      margin-top: 23px;
      font-size: 32px;
      line-height: 44px;
      color: #fce09e;
    }
    .vmp-lottery-btn {
      margin-top: 50px;
    }
  }
</style>
