<template>
  <div class="lottery-box no-win-lottery">
    <div class="no-win-lottery-img" />
    <p class="no-win-result">{{ text }}</p>
    <p class="no-win-tip">{{ $t('interact_tools.interact_tools_1011') }}</p>
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
    computed: {
      text() {
        return `${this.$t('interact_tools.interact_tools_1074')},${this.$t(
          'interact_tools.interact_tools_1010'
        )}`;
      }
    },
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>
<style lang="less">
  .no-win-lottery {
    max-width: 380px;
    min-height: 224px;
    text-align: center;
    .no-win-lottery-img {
      width: 95px;
      height: 98px;
      margin: 10px auto 0;
      background-image: url('../img/lottery-miss.png');
      background-size: contain;
      background-repeat: no-repeat;
    }
    .no-win-result {
      font-size: 16px;
      height: 26px;
      color: #fce09e;
      font-weight: 500;
      font-size: 16px;
      line-height: 26px;
      text-align: center;
      color: #262626;
    }
    .no-win-tip {
      font-size: 16px;
      height: 22px;
      font-size: 14px;
      line-height: 26px;
      text-align: center;
      color: #262626;
    }
    .vmp-lottery-btn {
      margin-top: 25px;
    }
  }
</style>
