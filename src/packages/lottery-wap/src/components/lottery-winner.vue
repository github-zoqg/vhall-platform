<template>
  <div class="lottery-winner-list">
    <lottery-title :title="$t('interact_tools.interact_tools_1020')" />
    <div class="award-detail">
      <img
        class="award-img"
        :src="(fitment.award_snapshoot && fitment.award_snapshoot.icon) || defaultLotteryImg"
      />
      <p class="award-name">
        参与观众获得“
        {{ fitment.name || '奖品' }}
        ”
      </p>
    </div>
    <div class="winner-content">
      <ul class="lottery-winner-wrap">
        <li class="lottery-user" v-for="(item, index) in winnerList" :key="index">
          <span class="serial">{{ index | fmtSerial }}</span>
          <img class="avatar" :src="item.lottery_user_avatar || defaultAvatar" alt />
          <p class="nickname">{{ item.lottery_user_nickname }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  import defaultAvatar from '@/app-shared/assets/img/default_avatar.png';
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
    data() {
      return {
        defaultAvatar
      };
    }
  };
</script>
<style lang="less">
  .lottery-winner-list {
    position: relative;
    padding: 0 0 32px;
    text-align: center;
    background: linear-gradient(180deg, #ffebd9 0%, #fcf1e7 100%);
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
    .winner-content {
      margin-top: 12px;
      padding: 0 24px;
      overflow-y: auto;
      touch-action: pan-y;
    }
    .lottery-winner-wrap {
      min-height: 300px;
      max-height: 352px;
      background: #fff;
      border-radius: 16px;
      overflow: auto;
    }
    .serial {
      display: inline-block;
      width: 56px;
      font-weight: 700;
      font-size: 26px;
    }
    .lottery-user {
      height: 100px;
      margin: 0 32px;
      padding: 16px 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      &:not(:last-child) {
        // TODO: border的颜色
        border-bottom: 1px solid rgba(#c8c8c8, 0.4);
      }
      .avatar {
        display: block;
        width: 56px;
        height: 56px;
        margin-left: 32px;
        border-radius: 50%;
      }
      .nickname {
        float: left;
        width: 550px;
        height: 56px;
        margin-left: 16px;
        font-size: 28px;
        line-height: 56px;
        color: #1a1a1a;
        text-align: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
</style>
