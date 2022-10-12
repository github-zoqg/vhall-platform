<template>
  <div class="lottery-box lottery-winner-list">
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
    <!-- 发起端的继续抽奖 -->
    <el-button v-if="mode === 'live'" @click="reStart" class="vmp-lottery-btn">继续抽奖</el-button>
  </div>
</template>
<script>
  import defaultAvatar from '@/app-shared/assets/img/default_avatar.png';
  import Ribbon from '../art/ribbon/winner.vue';
  import LotteryTitle from './lottery-title.vue';
  import props from './props';
  export default {
    name: 'LotteryWinner',
    mixins: [props],
    props: {
      mode: {
        // 是否显示结束抽奖(发起端)
        type: String,
        default() {
          return 'watch';
        }
      },
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
    },
    methods: {
      reStart() {
        this.$emit('reStart');
      }
    }
  };
</script>
<style lang="less">
  .lottery-winner-list {
    box-sizing: border-box;
    .ribbon-panel {
      width: 100%;
      height: 200px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
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
      width: 48px;
      height: 48px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
    }
    .award-name {
      margin-left: 15px;
      font-weight: 500;
      font-size: 15px;
      color: #fb2626;
    }
    .winner-content {
      margin-top: 4px;
      overflow-y: auto;
      height: 228px;
      overflow-x: hidden;
      border-radius: 4px;
      > div,
      > ul {
        min-height: 100%;
        box-sizing: border-box;
        background: #fff;
        padding: 4px 0;
        border-radius: 4px;
      }
    }
    .lottery-winner-wrap {
      padding: 4px;
    }
    .no-winner {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .no-win-lottery-img {
        width: 80px;
        height: 80px;
        background-image: url('../img/lottery-miss.png');
        background-size: contain;
        background-repeat: no-repeat;
      }
      .tip {
        height: 26px;
        font-weight: 500;
        font-size: 16px;
        color: #262626;
      }
    }

    .serial {
      display: inline-block;
      width: 24px;
      font-weight: 700;
      font-size: 14px;
    }
    .lottery-user {
      height: 44px;
      margin: 0 12px;
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
        margin: 0 12px;
      }
      .nickname {
        width: 248px;
        height: 28px;
        font-size: 14px;
        line-height: 28px;
        color: #1a1a1a;
        text-align: left;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .vmp-lottery-btn {
      margin-top: 15px;
    }
  }
</style>
