<template>
  <div class="lottery-winner-list">
    <lottery-title :title="$t('interact_tools.interact_tools_1020')" />
    <div class="winner-content">
      <ul class="lottery-winner-wrap">
        <li class="lottery-user" v-for="(item, index) in winnerList" :key="index">
          <img class="avatar" :src="item.lottery_user_avatar || defaultAvatar" alt />
          <p class="nickname">{{ item.lottery_user_nickname }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
  import props from './props';
  import LotteryTitle from './lottery-title.vue';
  export default {
    name: 'LotteryWinner',
    mixins: [props],
    components: {
      LotteryTitle
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
    padding: 40px 0 60px;
    text-align: center;
    background: linear-gradient(53.35deg, #fdf1ed 14.39%, #f3f2ff 104%);
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .winner-content {
      overflow-y: scroll;
      touch-action: pan-y;
      margin-top: 37px;
      padding: 0 24px;
    }
    .lottery-winner-wrap {
      height: 440px;
      background: rgba(#fff, 0.8);
      border-radius: 16px;
    }
    .lottery-user {
      height: 87px;
      margin: 0 32px;
      padding: 16px 0;
      &:not(:last-child) {
        border-bottom: 1px solid rgba(#fcc7c7, 0.6);
      }
      &:after {
        clear: left;
      }
      .avatar {
        float: left;
        display: block;
        width: 56px;
        height: 56px;
        border-radius: 50%;
      }
      .nickname {
        float: left;
        height: 56px;
        margin-left: 16px;
        font-size: 28px;
        line-height: 56px;
        color: #1a1a1a;
      }
    }
  }
</style>
