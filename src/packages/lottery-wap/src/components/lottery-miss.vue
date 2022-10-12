<template>
  <div class="no-win-lottery">
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
    background: linear-gradient(37.94deg, #fffbe8 3.86%, #fbf0e6 84.36%);
    border-radius: 20px;
    padding: 56px 0;
    text-align: center;
    width: 640px;
    // height: 524px;
    .no-win-lottery-img {
      width: 220px;
      height: 220px;
      margin: 0 auto;
      background-image: url('../img/lottery-miss.png');
      background-size: contain;
      background-repeat: no-repeat;
    }
    .no-win-result {
      color: #fce09e;
      font-weight: 500;
      font-size: 32px;
      line-height: 44px;
      text-align: center;
      color: #262626;
    }
    .no-win-tip {
      margin-top: 23px;
      font-size: 28px;
      line-height: 40px;
      color: #262626;
    }
    .vmp-lottery-btn {
      margin-top: 50px;
    }
  }
</style>
