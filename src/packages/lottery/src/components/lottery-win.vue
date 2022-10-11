<template>
  <div class="win-lottery">
    <div class="award-container">
      <div class="wordart-wrap">
        <wordart class="wordart nowarp" :text="$t('interact_tools.interact_tools_1015')" />
      </div>
      <div class="award-annulus"></div>
      <div class="gold-cion-bg"></div>
      <img class="award-img" :src="(prizeInfo && prizeInfo.image_url) || defaultLotteryImg" alt />
      <div class="award-img-inner-annular"></div>
      <div class="award-img-outer-annular"></div>
      <p class="win-award-tip-container">
        <span class="win-award-tip">
          {{ $t('interact_tools.interact_tools_1016') }}"{{
            prizeInfo.award_name || $t('interact_tools.interact_tools_1009')
          }}"
        </span>
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
  import wordart from '../art/wordart/index.vue';
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
    // 环状外观
    .award-annulus {
      width: 100%;
      height: 100%;
      position: absolute;
      background-image: url('../img/lottery-win-annulus.png');
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      animation: rotation 0.8s 1;
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
      animation: magnify 0.4s linear 1;
    }
    .win-award-tip-container {
      width: 100%;
      height: 26px;
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
    }
    .win-award-tip {
      display: inline-block;
      line-height: 26px;
      font-size: 14px;
      color: #fce09e;
      white-space: nowrap;
      padding: 0 20px;
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
      width: 122px;
      height: 122px;
      border: 17px solid rgba(255, 255, 255, 0.1);
    }
    .award-img-inner-annular {
      .center-mixin;
      .annular;
      width: 104px;
      height: 105px;
      border: 9px solid rgba(255, 255, 255, 0.15);
      overflow: hidden;
    }

    .award-img {
      .center-mixin;
      .annular;
      border-radius: 50%;
      display: inline-block;
      width: 104px;
      height: 104px;
      object-fit: contain;
    }
    .award-wrap {
      width: 90px;
      height: 90px;
      margin: 29px auto 6px;

      .award-img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }

    .vmp-lottery-btn {
      margin-top: -15px;
    }
    @keyframes magnify {
      from {
        transform: scale(0.8);
      }
      to {
      }
    }
    @keyframes rotation {
      from {
        transform: rotate(90deg);
      }
      to {
      }
    }
    // 扫光动画
    .award-img-inner-annular::before {
      content: '';
      display: inline-block;
      position: absolute;
      width: 120px;
      height: 15px; /**光标的宽度，可根据实际调整**/
      background-color: #fff;
      transform: rotate(45deg);
      animation: searchLights 0.8s ease-in 1s 1;
    }
    @keyframes searchLights {
      from {
        left: -50px;
        top: 80px;
      }
      to {
        left: 50px;
        top: 10px;
      }
    }
  }
</style>
