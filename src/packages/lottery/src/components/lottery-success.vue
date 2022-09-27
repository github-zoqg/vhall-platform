<template>
  <div class="lottery-box submit-lottery">
    <div class="submit-success-icon"></div>
    <p class="submit-lottery-text">
      {{ $t('interact_tools.interact_tools_1013') }}
    </p>
    <button class="vmp-lottery-btn" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  export default {
    name: 'LotterySuccess',
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>
<style lang="less">
  .submit-lottery {
    max-width: 380px;
    min-height: 224px;
    .submit-success-icon {
      margin: 10px auto 0;
      width: 95px;
      height: 98px;
      background-image: url('../img/submit-success.png');
      background-size: contain;
    }
    .submit-lottery-text {
      text-align: center;
      margin: 0 auto 24px;
      font-weight: 500;
      font-size: 18px;
      color: #262626;
    }
  }
</style>
