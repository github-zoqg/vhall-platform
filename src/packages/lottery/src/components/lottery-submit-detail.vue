<template>
  <div class="lottery-box lottery-submit-detail">
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
    inject: ['lotteryServer'],
    components: {
      LotteryTitle
    },
    filters: {
      fmtSerial(val) {
        const serial = `${val + 1}`;
        return serial.padStart(2, '0');
      }
    },
    created() {
      this.getLotteryUserDetail();
    },
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      },
      getLotteryUserDetail() {
        this.lotteryServer.getLotteryUserDetail(this.lotteryId).then(res => {
          console.log(res);
        });
      }
    }
  };
</script>
<style lang="less">
  .lottery-submit-detail {
    .award-detail {
      box-sizing: border-box;
      height: 72px;
      padding: 0 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 14px 16px;
      background: #fff;
      border-radius: 4px;
    }

    .award-img {
      width: 45px;
      height: 45px;
      border-radius: 5px;
    }
    .award-name {
      margin-left: 6px;
      font-weight: 500;
      font-size: 15px;
      color: #fb2626;
    }
    .submit-content {
      background: #fff;
      border-radius: 4px;
      padding: 12px;
      margin-top: 4px;
      min-height: 50px;
    }
    .submit-content-item {
      font-size: 14px;
      line-height: 22px;
      color: #262626;
      text-align: left;
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
    .vmp-lottery-btn {
      margin-top: 42px;
    }
  }
</style>
