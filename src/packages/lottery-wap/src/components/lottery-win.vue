<template>
  <div class="win-lottery">
    <div class="award-container">
      <div class="wordart-wrap">
        <span class="star star-1"></span>
        <span class="star star-2"></span>
        <span class="star star-3"></span>
        <wordart class="wordart nowarp" :text="$t('interact_tools.interact_tools_1015')" />
      </div>
      <div class="award-annulus"></div>
      <div class="gold-cion-bg"></div>
      <img class="award-img" :src="(prizeInfo && prizeInfo.image_url) || defaultLotteryImg" alt />
      <div class="award-img-outer-annular"></div>
      <div class="award-img-inner-annular"></div>
      <ribbon class="ribbon-container" />
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
  import ribbon from '../art/ribbon/win.vue';
  export default {
    name: 'LotteryWin',
    mixins: [props],
    components: {
      wordart,
      ribbon
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
      width: 600px;
      height: 600px;
      position: relative;
    }
    .wordart-wrap {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);

      .star {
        display: inline-block;
        position: absolute;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        z-index: 2;
      }
      .star-1 {
        top: 12px;
        left: -40px;
        width: 28px;
        height: 36px;
        background-image: url('../img/star-1.png');
      }
      .star-2 {
        top: 24px;
        right: -40px;
        width: 32px;
        height: 44px;
        background-image: url('../img/star-1.png');
      }
      .star-3 {
        top: -4px;
        right: -60px;
        width: 20px;
        height: 30px;
        background-image: url('../img/star-2.png');
      }
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
      height: 52px;
      position: absolute;
      bottom: 96px;
      left: 50%;
      transform: translateX(-50%);
    }
    .win-award-tip {
      line-height: 52px;
      font-size: 28px;
      color: #fce09e;
      white-space: nowrap;
      padding: 0 40px;
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
      width: 284px;
      height: 284px;
      border: 12px solid rgba(255, 255, 255, 0.1);
    }
    .award-img-inner-annular {
      .center-mixin;
      .annular;
      width: 260px;
      height: 260px;
      border: 10px solid rgba(255, 255, 255, 0.15);
      overflow: hidden;
    }

    .award-img {
      .center-mixin;
      .annular;
      border-radius: 50%;
      display: inline-block;
      width: 240px;
      height: 240px;
      object-fit: contain;
    }
    .award-wrap {
      width: 180px;
      height: 180px;
      margin: 0px auto;
      margin-top: 58px;
      margin-bottom: 12px;

      .award-img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }

    .vmp-lottery-btn {
      margin-top: -30px;
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
    // 擦亮动画
    .award-img-inner-annular::before {
      content: '';
      display: inline-block;
      position: absolute;
      width: 240px;
      height: 30px; /**光标的宽度，可根据实际调整**/
      background-color: #fff;
      transform: rotate(45deg);
      animation: searchLights 0.8s ease-in 1s 1;
    }
    @keyframes searchLights {
      from {
        left: -100px;
        top: 160px;
      }
      to {
        left: 100px;
        top: 20px;
      }
    }
  }
</style>
