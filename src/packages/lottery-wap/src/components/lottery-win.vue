<template>
  <div class="win-lottery">
    <div class="award-img">
      <img :src="prizeInfo.image_url || defaultLotteryImg" alt srcset />
    </div>
    <div>{{ $t('interact_tools.interact_tools_1015') }}</div>
    <div>
      {{ $t('interact_tools.interact_tools_1016') }}"{{
        prizeInfo.award_name || $t('interact_tools.interact_tools_1009')
      }}"
    </div>
    <!-- <button @click="acceptLottery">{{ $t('interact_tools.interact_tools_1017') }}</button> -->
    <!-- 领奖 -->
    <button v-if="needTakeAward" @click="acceptLottery">
      {{ $t('interact_tools.interact_tools_1017') }}
    </button>
    <button v-else-if="showWinnerList" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  import props from './props';
  export default {
    name: 'LotteryWin',
    mixins: [props],
    methods: {
      acceptLottery() {
        this.$emit('navTo', 'LotteryAccept');
      },
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>
<style lang="less" scoped>
  .win-lottery {
    font-size: 32px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #ff5659;
    line-height: 46px;
    text-align: center;
    .win-lottery-icon {
      width: 200px;
      height: 200px;
      border-radius: 100px;
      // background: #eaeaea;
      margin: 0px auto;
      display: block;
    }
    .win-lottery-text {
      width: 100%;
      text-align: center;
      min-height: 20px;
      font-size: 32px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #fb3a32;
      line-height: 46px;
      margin-top: 32px;
    }
    button {
      display: inline-block;
      width: 364px;
      height: 90px;
      background: #fb3a32;
      border-radius: 14px;
      margin: 116px auto 0px auto;
      color: #fff;
      line-height: 90px;
      text-align: center;
    }
  }
  .award-img {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin: 0px auto;
    margin-bottom: 32px;
    img {
      display: block;
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }
  }
</style>
