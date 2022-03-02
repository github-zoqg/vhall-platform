<template>
  <div class="lottery-pending">
    <img :src="fitment.url" alt />
    <p class="lottery-start-text">
      {{ fitment.text || `${$t('interact_tools.interact_tools_1002')}....` }}
    </p>
    <button v-show="showCodeLottery" @click="joinLottery">
      {{ $t('interact_tools.interact_tools_1008') }}
    </button>
  </div>
</template>
<script>
  import props from './props';
  export default {
    name: 'LotteryPending',
    mixins: [props],
    computed: {
      showCodeLottery() {
        return false;
      }
    },
    data() {
      return {
        loading: false
      };
    },
    methods: {
      //
      joinLottery() {
        if (this.loading) return;
        this.loading = true;
      }
    }
  };
</script>
<style lang="less" scoped>
  .lottery-pending {
    width: 100%;
    height: 100%;
    font-size: 32px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #444444;
    img {
      width: 440px;
      height: 440px;
      margin: 0px auto;
      display: block;
    }
    p {
      text-align: center;
      margin: 40px 0px;
    }
    .lottery-start-text {
      color: #ff5659;
      line-height: 40px;
    }
    button {
      display: block;
      width: 364px;
      height: 90px;
      background: #fc5659;
      border-radius: 14px;
      margin: 0px auto;
      // padding-bottom: 20px;
      color: #fff;
      line-height: 90px;
      text-align: center;
    }
  }
</style>
