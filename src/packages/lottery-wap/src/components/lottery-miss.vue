<template>
  <div class="noLottery">
    <img class="no-lottery-img" :src="prizeInfo.img_url || noLotteryImg" alt srcset />
    <p class="gongxi">{{ $t('interact_tools.interact_tools_1022') }}</p>
    <p class="gongxi" style="margin-top: 8px">
      {{
        `${$t('interact_tools.interact_tools_1010')}，${$t('interact_tools.interact_tools_1011')}`
      }}!
    </p>
    <button v-if="showWinnerList" @click="navToWinnerList">
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
<style lang="less" scoped>
  .noLottery {
    width: 100%;
    height: 100%;
    font-size: 32px;
    font-weight: 400;
    color: #222;
    .no-lottery-img {
      display: block;
      width: 200px;
      height: 200px;
      border-radius: 120px;
      margin: 6px auto 32px;
    }
    p {
      text-align: center;
    }
    button {
      display: block;
      width: 364px;
      height: 90px;
      background: #fc5659;
      border-radius: 14px;
      margin: 70px auto 0px auto;
      color: #fff;
      line-height: 90px;
      text-align: center;
    }
  }
</style>
