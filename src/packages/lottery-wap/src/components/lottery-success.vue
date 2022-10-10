<template>
  <div class="submit-lottery">
    <div class="submit-success-icon"></div>

    <p class="submit-lottery-text">
      {{ $t('interact_tools.interact_tools_1013') }}
    </p>
    <button v-if="showWinnerList" class="vmp-lottery-btn" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  import props from './props';

  export default {
    name: 'LotterySuccess',
    mixins: [props],
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>
<style lang="less">
  .submit-lottery {
    background: linear-gradient(37.94deg, #fffbe8 3.86%, #fbf0e6 84.36%);
    border-radius: 20px 20px 0px 0px;
    text-align: center;
    padding: 60px;
    .submit-success-icon {
      margin: 20px auto 0;
      width: 185px;
      height: 195px;
      background-image: url('../img/submit-success.png');
      background-size: contain;
    }
    .submit-lottery-text {
      text-align: center;
      margin: 0 auto 64px;
      font-weight: 500;
      font-size: 36px;
      color: #262626;
    }
  }
</style>
