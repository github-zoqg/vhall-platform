<template>
  <div class="lottery-winner-list">
    <ribbon v-if="winnerList.length" class="ribbon-panel" />
    <lottery-title :title="$t('interact_tools.interact_tools_1020')" />
    <div class="award-detail">
      <img class="award-img" :src="(prizeInfo && prizeInfo.image_url) || defaultLotteryImg" />
      <p class="award-name">
        <i18n path="interact_tools.interact_tools_1093">
          <span class="n" place="n">{{ (prizeInfo && prizeInfo.award_name) || '奖品' }}</span>
        </i18n>
      </p>
    </div>
    <div class="winner-content">
      <ul v-if="winnerList.length" class="lottery-winner-wrap">
        <li class="lottery-user" v-for="(item, index) in winnerList" :key="index">
          <span class="serial">{{ index | fmtSerial }}</span>
          <img class="avatar" :src="item.lottery_user_avatar || defaultAvatar" alt />
          <p class="nickname">{{ item.lottery_user_nickname }}</p>
        </li>
      </ul>
      <div v-else class="no-winner">
        <div class="no-win-lottery-img"></div>
        <p class="tip">{{ $t('interact_tools.interact_tools_1094') }}</p>
      </div>
    </div>
  </div>
</template>
<script>
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import props from './props';
  import LotteryTitle from './lottery-title.vue';
  import Ribbon from '../art/ribbon/winner.vue';
  import '@/app-shared/assets/css/D-DIN-Bold/stylesheet.css';
  export default {
    name: 'LotteryWinner',
    mixins: [props],
    components: {
      LotteryTitle,
      Ribbon
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
    background: linear-gradient(37.94deg, #fffbe8 3.86%, #fbf0e6 84.36%);
    border-radius: 20px 20px 0px 0px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .ribbon-panel {
      width: 100%;
      height: 400px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
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
      border-radius: 8px;
      border: 1px solid #d9d9d9;
      object-fit: contain;
    }
    .award-name {
      margin-left: 30px;
      font-weight: 500;
      font-size: 30px;
      color: #fb2626;
    }
    .winner-content {
      margin-top: 12px;
      height: 352px;
      padding: 0 24px;
      overflow-y: auto;
      touch-action: pan-y;
      > div,
      > ul {
        min-height: 100%;
        box-sizing: border-box;
        background: #fff;
        border-radius: 16px;
      }
    }
    .no-winner {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .no-win-lottery-img {
        width: 160px;
        height: 160px;
        background-image: url('../img/lottery-miss.png');
        background-size: contain;
        background-repeat: no-repeat;
      }
      .tip {
        height: 48px;
        font-weight: 500;
        font-size: 36px;
      }
    }
    .serial {
      display: inline-block;
      width: 56px;
      font-weight: 700;
      font-size: 26px;
      font-family: 'D-DIN';
    }
    .lottery-user {
      height: 100px;
      margin: 0 32px;
      padding: 16px 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      &:not(:last-child) {
        border-bottom: 1px solid rgba(#c8c8c8, 0.4);
      }
      .avatar {
        display: block;
        width: 56px;
        height: 56px;
        margin: 0 32px;
        border-radius: 50%;
      }
      .nickname {
        width: 550px;
        height: 56px;
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
