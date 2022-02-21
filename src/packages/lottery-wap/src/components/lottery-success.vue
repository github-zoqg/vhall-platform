<template>
  <div class="win-lottery">
    <img class="win-lottery-icon" :src="submitImg" alt="" />
    <p class="win-lottery-text" v-if="showWinnerList">
      {{ $t('interact_tools.interact_tools_1013') }}
    </p>
    <button v-if="showWinnerList" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  import props from './props';
  export default {
    name: 'LotterySuccess',
    mixins: [props],
    data() {
      return {
        submitImg: require('../img/summit.png')
      };
    },
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>
<style lang="less">
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
      color: #fc5659;
      line-height: 46px;
      margin-top: 32px;
    }
    button {
      display: inline-block;
      width: 364px;
      height: 90px;
      background: #fc5659;
      border-radius: 14px;
      margin: 116px auto 0px auto;
      color: #fff;
      line-height: 90px;
      text-align: center;
    }
  }
</style>
