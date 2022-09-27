<template>
  <div class="win-lottery">
    <div class="award-container">
      <div class="wordart-wrap">
        <wordart class="wordart" :text="$t('interact_tools.interact_tools_1015')" />
      </div>
      <div class="award-annulus"></div>
      <div class="gold-cion-bg"></div>
      <div class="award-img-outer-annular"></div>
      <div class="award-img-inner-annular"></div>
      <img class="award-img" :src="(prizeInfo && prizeInfo.icon) || defaultLotteryImg" alt />
      <p class="win-award-tip">
        {{ $t('interact_tools.interact_tools_1016') }}"{{
          prizeInfo.award_name || $t('interact_tools.interact_tools_1009')
        }}"
      </p>
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
  import wordart from './wordart';
  export default {
    name: 'LotteryWin',
    mixins: [props],
    components: {
      wordart
    },
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
  // 完全局职工
  .center-mixin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .annular {
    display: inline-block;
    border-radius: 50%;
  }
  .win-lottery {
    text-align: center;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .award-container {
      width: 300px;
      height: 300px;
      position: relative;
    }
    .wordart-wrap {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .wordart {
      letter-spacing: 10px;
    }
    // 环状外观
    .award-annulus {
      width: 100%;
      height: 100%;
      position: absolute;
      background-image: url('../img/lottery-win-annulus.png');
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
    }
    // 金币背景图
    .gold-cion-bg {
      position: absolute;
      background-image: url('../img/lottery-win-gold-coin.png');
      background-size: contain;
      background-repeat: no-repeat;
      width: 100%;
      height: 100%;
      background-position: center 80%;
    }
    .win-award-tip {
      display: inline-block;
      width: 275px;
      height: 26px;
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      line-height: 26px;
      font-size: 14px;
      color: #fce09e;
      background: linear-gradient(
        270deg,
        rgba(255, 119, 73, 0) 2.54%,
        #d00011 32.61%,
        #d50013 59.83%,
        rgba(255, 119, 73, 0) 94.2%
      );
    }
    .award-img-outer-annular {
      .center-mixin;
      .annular;
      width: 142px;
      height: 142px;
      border: 6px solid rgba(255, 255, 255, 0.1);
    }
    .award-img-inner-annular {
      .center-mixin;
      .annular;
      width: 130px;
      height: 130px;
      border: 5px solid rgba(255, 255, 255, 0.15);
    }

    .award-img {
      .center-mixin;
      .annular;
      border-radius: 50%;
      display: inline-block;
      width: 120px;
      height: 120px;
      object-fit: contain;
    }
    .award-wrap {
      width: 90px;
      height: 90px;
      margin: 0px auto;
      margin-top: 29px;
      margin-bottom: 6px;

      .award-img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }

    .vmp-lottery-btn {
      margin-top: -15px;
    }
  }
</style>
