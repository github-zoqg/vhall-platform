<template>
  <div class="lottery-list">
    <div class="award-info">
      <img :src="prizeInfo.image_url || defaultLotteryImg" alt="" />
    </div>
    <span>{{ prizeInfo.award_name }}</span>
    <div class="table-title">{{ $t('interact_tools.interact_tools_1020') }}</div>
    <div class="table-content">
      <div class="lottery-user" v-for="(item, index) in winnerList" :key="index">
        <img :src="item.lottery_user_avatar || defaultAvatar" alt />
        <span>{{ item.lottery_user_nickname }}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import props from './props';
  export default {
    name: 'LotteryWinner',
    mixins: [props],
    data() {
      return {
        defaultAvatar: require('../img/avatar_min.png')
      };
    }
  };
</script>
<style lang="less">
  .lottery-list {
    font-size: 32px;
    color: #222;
    text-align: center;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    .award-info {
      width: 120px;
      height: 120px;
      border-radius: 100px;
      background: #eaeaea;
      margin: 0px auto;
      margin-bottom: 32px;
      text-align: center;
      img {
        display: inline-block;
        width: 100%;
        height: 100%;
        border-radius: 100px;
      }
    }
    .table-title {
      box-sizing: border-box;
      width: 100%;
      height: 70px;
      line-height: 70px;
      text-align: center;
      font-size: 28px;
      border-top-right-radius: 16px;
      border-top-left-radius: 16px;
      background: #f5f5f5;
      margin-top: 28px;
      margin-bottom: 2px;
    }
    .table-content {
      height: 320px;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      overflow-y: scroll;
      touch-action: pan-y;
      background: #f5f5f5;
      .lottery-user {
        width: 100%;
        height: 80px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border;
        padding: 8px 20px;
        font-size: 22px;
        img {
          display: inline-block;
          width: 64px;
          height: 64px;
          border-radius: 32px;
          margin-right: 16px;
        }
      }
    }
  }
</style>
