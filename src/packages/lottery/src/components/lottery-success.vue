<template>
  <div class="lottery-box submit-lottery">
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
  import ribbon from '../art/ribbon/success.vue';
  export default {
    name: 'LotterySuccess',
    components: {
      ribbon
    },
    props: {
      showWinnerList: {
        type: Boolean,
        default() {
          return false;
        }
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
  .submit-lottery {
    max-width: 380px;
    min-height: 224px;

    .ribbon-panel {
      position: absolute;
      background: red;
      top: 30px;
      left: 50%;
      transform: translate(-50%);
    }

    .submit-success-icon {
      position: relative;
      left: 5px; // 图片问题,手动偏移
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
