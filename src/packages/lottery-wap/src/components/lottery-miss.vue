<template>
  <div class="no-win-lottery">
    <img class="no-win-lottery-img" :src="noLotteryImg" alt srcset />
    <p class="lottery-result">{{ $t('interact_tools.interact_tools_1022') }}</p>
    <p class="no-win-tip">
      {{
        `${$t('interact_tools.interact_tools_1010')},${$t(
          'interact_tools.interact_tools_1011'
        ).toLocaleLowerCase()}`
      }}!
    </p>
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
    padding: 60px;
    text-align: center;
    background: linear-gradient(55.05deg, #fdf1ed 9.38%, #f3f2ff 101.37%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .no-win-lottery-img {
      display: inline-block;
      width: 256.83px;
      height: 158px;
      margin: 46px auto 15px;
    }
    .lottery-result {
      font-weight: 500;
      font-size: 32px;
      line-height: 45px;
      text-align: center;
      color: #5b3521;
      margin-bottom: 10px;
    }
    .no-win-tip {
      font-size: 28px;
      line-height: 39px;
      text-align: center;
      color: #5b3521;
      margin-bottom: 74px;
    }
  }
</style>
