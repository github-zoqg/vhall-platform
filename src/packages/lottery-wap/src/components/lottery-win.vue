<template>
  <div class="win-lottery">
    <div class="award-wrap">
      <img class="award-img" :src="prizeInfo.image_url || defaultLotteryImg" alt srcset />
    </div>
    <div class="win-tip">{{ $t('interact_tools.interact_tools_1015') }}</div>
    <div class="win-award-tip">
      {{ $t('interact_tools.interact_tools_1016') }}"{{
        prizeInfo.award_name || $t('interact_tools.interact_tools_1009')
      }}"
    </div>
    <!-- 领奖 -->
    <button class="vmp-lottery-btn" v-if="needTakeAward" @click="acceptLottery">
      {{ $t('interact_tools.interact_tools_1017') }}
    </button>
    <button class="vmp-lottery-btn" v-else-if="showWinnerList" @click="navToWinnerList">
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
<style lang="less">
  .win-lottery {
    text-align: center;
    padding: 60px;
    background: linear-gradient(55.05deg, #fdf1ed 9.38%, #f3f2ff 101.37%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .award-wrap {
      width: 180px;
      height: 180px;
      margin: 0px auto;
      margin-top: 58px;
      margin-bottom: 12px;
      .award-img {
        display: block;
        border-radius: 50%;
        width: 100%;
        height: 100%;
      }
    }
    .win-tip {
      font-weight: 500;
      font-size: 32px;
      line-height: 45px;
      text-align: center;
      color: #5b3521;
    }
    .win-award-tip {
      text-align: center;
      margin-top: 20px;
      font-size: 28px;
      line-height: 39px;
      color: #e75427;
      margin-bottom: 48px;
    }
  }
</style>
