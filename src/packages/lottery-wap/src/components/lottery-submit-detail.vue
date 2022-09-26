<template>
  <div class="lottery-submit-detail">
    <lottery-title title="中奖详情" />
    <div class="award-detail">
      <img class="award-img" :src="fitment.url || defaultLotteryImg" alt />
      <p class="award-name">参与观众获得“{{ fitment.name || '奖品' }}”</p>
    </div>
    <div class="submit-content">
      <div class="submit-content-item">蔡星</div>
      <div class="submit-content-item">13435464012</div>
      <div class="submit-content-item">北京市朝阳区紫檀大厦</div>
    </div>
    <button class="vmp-lottery-btn" v-if="showWinnerList" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  import props from './props';
  import LotteryTitle from './lottery-title.vue';
  export default {
    name: 'LotteryWinner',
    mixins: [props],
    components: {
      LotteryTitle
    },
    filters: {
      fmtSerial(val) {
        const serial = `${val + 1}`;
        return serial.padStart(2, '0');
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
  .lottery-submit-detail {
    position: relative;
    padding: 0 0 32px;
    text-align: center;
    background: linear-gradient(180deg, #fbf0e6 0%, #fcf1e7 100%);
    border-radius: 20px 20px 0px 0px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .award-detail {
      height: 144px;
      margin: 0 24px;
      padding: 0 32px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 28px 32px;
      background: #fff;
      border-radius: 12px;
    }

    .award-img {
      width: 80px;
      height: 80px;
      border-radius: 5px;
    }
    .award-name {
      margin-left: 12px;
      font-weight: 500;
      font-size: 30px;
      color: #fb2626;
    }
    .submit-content {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      margin: 12px 24px 36px;
      min-height: 100px;
    }
    .submit-content-item {
      font-size: 28px;
      line-height: 40px;
      color: #262626;
      text-align: left;
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }
  }
</style>
