<template>
  <div class="submit-lottery">
    <ribbon class="ribbon-panel" />
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
  import ribbon from '../art/ribbon/success.vue';
  export default {
    name: 'LotterySuccess',
    components: {
      ribbon
    },
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
    .ribbon-panel {
      position: absolute;
      left: 50%;
      transform: translate(-50%);
    }
    .submit-success-icon {
      margin: 16px auto 0;
      width: 185px;
      height: 400px;
      width: 248px;
      height: 176px;
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
