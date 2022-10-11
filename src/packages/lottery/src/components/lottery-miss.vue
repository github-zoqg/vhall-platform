<template>
  <div class="no-win-lottery">
    <div class="no-win-lottery-img" />
    <wordart :text="text" />
    <p class="no-win-tip">{{ $t('interact_tools.interact_tools_1011') }}!</p>
    <button class="vmp-lottery-btn" v-if="showWinnerList" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  import wordart from '../art/wordart/index.vue';
  import props from './props';
  export default {
    name: 'LotteryMiss',
    mixins: [props],
    components: {
      wordart
    },
    computed: {
      text() {
        return `${this.$t('interact_tools.interact_tools_1074')},${this.$t(
          'interact_tools.interact_tools_1010'
        )}`;
      }
    },
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>
<style lang="less">
  .no-win-lottery {
    text-align: center;
    .no-win-lottery-img {
      width: 110px;
      height: 110px;
      margin: 10px auto 0;
      background-image: url('../img/lottery-miss.png');
      background-size: contain;
      background-repeat: no-repeat;
    }
    .no-win-tip {
      margin-top: 12px;
      font-size: 16px;
      line-height: 22px;
      color: #fce09e;
    }
    .vmp-lottery-btn {
      margin-top: 25px;
    }
  }
</style>
