<template>
  <div class="lottery-box lottery-winner-list">
    <lottery-title :title="$t('interact_tools.interact_tools_1020')" />
    <div class="award-detail">
      <img
        class="award-img"
        :src="(fitment.award_snapshoot && fitment.prizeInfo.icon) || defaultLotteryImg"
      />
      <p class="award-name">
        参与观众获得“
        {{ (fitment && fitment.name) || '奖品' }}
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
  import LotteryTitle from './lottery-title.vue';
  export default {
    name: 'LotteryWinner',
    props: {
      winnerList: {
        required: true,
        type: Array,
        default() {
          return [];
        }
      },
      fitment: {
        required: true,
        type: Object,
        default() {
          return {};
        }
      }
    },
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
    box-sizing: border-box;
    .award-detail {
      box-sizing: border-box;
      height: 72px;
      padding: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      background: #fff;
      border-radius: 4px;
    }

    .award-img {
      width: 45px;
      height: 45px;
      border-radius: 4px;
    }
    .award-name {
      margin-left: 6px;
      font-weight: 500;
      font-size: 15px;
      color: #fb2626;
    }
    .winner-content {
      margin-top: 6px;
      overflow-y: auto;
      touch-action: pan-y;
    }
    .lottery-winner-wrap {
      box-sizing: border-box;
      min-height: 150px;
      max-height: 177px;
      background: #fff;
      border-radius: 4px;
      overflow: auto;
    }
    .serial {
      display: inline-block;
      width: 28px;
      font-weight: 700;
      font-size: 13px;
    }
    .lottery-user {
      height: 44px;
      margin: 0 16px;
      padding: 8px 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      &:not(:last-child) {
        border-bottom: 1px solid rgba(#c8c8c8, 0.4);
      }
      color: #595959;
      .avatar {
        display: block;
        width: 24px;
        height: 24px;
        margin-left: 12px;
        border-radius: 50%;
      }
      .nickname {
        height: 28px;
        margin-left: 8px;
        font-size: 14px;
        line-height: 28px;
        color: #1a1a1a;
        text-align: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
</style>
