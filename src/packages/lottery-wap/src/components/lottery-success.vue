<template>
  <div class="submit-lottery">
    <i class="vh-iconfont vh-line-circle-check submit-success-icon"></i>
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
    text-align: center;
    padding: 60px;
    .submit-success-icon {
      margin-top: 79px;
      font-size: 120px;
      color: #0fba5a;
    }
    .submit-lottery-text {
      color: #000;
      font-size: 28px;
      line-height: 39px;
      text-align: center;
      margin: 20px auto 62px;
    }
  }
</style>
