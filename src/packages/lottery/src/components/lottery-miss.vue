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
    text-align: center;
    .no-win-lottery-img {
      width: 110px;
      height: 110px;
      margin: 10px auto 0;
      background-image: url('../img/lottery-miss.png');
      background-size: contain;
      background-repeat: no-repeat;
    }
    .lottery-result {
      position: relative;
      font-weight: 600;
      font-size: 27px;
      line-height: 32px;
      color: #fef8f4;
      -webkit-text-stroke: 6px #eb6a37;
      text-shadow: 0px 1px 1px rgba(197, 21, 14, 0.56);
      transform: matrix(0.99, 0, -0.15, 1, 0, 0);
      &::before {
        content: attr(data-text);
        position: absolute;
        -webkit-text-stroke: 0;
        color: #fef8f4;
      }
    }
    .no-win-tip {
      margin-top: 12px;
      font-size: 16px;
      line-height: 22px;
      color: #fce09e;
    }
    .vmp-lottery-btn {
      margin-top: 25px;
    }
  }
</style>
