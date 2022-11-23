<template>
  <div class="vmp-rank-item">
    <div class="order-cell">
      <RankNo :ranking="item.rank_no" />
    </div>
    <div class="user-cell">
      <div class="avatar-wrap">
        <RankAvatar :ranking="item.rank_no" />
        <p class="nickname truncate m-l-12">{{ item.user_name }}</p>
      </div>
    </div>
    <div class="score-cell">{{ item.score }}</div>
    <div class="rate-cell">{{ item.right_rate }}</div>
    <div class="elapsed-time-cell">{{ item.use_time }}</div>
  </div>
</template>
<script>
  import RankAvatar from './rank-avatar.vue';
  import RankNo from './rank-no.vue';

  export default {
    name: 'VmpRankItemWatch',
    props: {
      item: {
        type: Object,
        default() {
          return {
            rank_no: 0,
            user_name: '',
            head_img: '',
            score: 0,
            right_rate: '',
            use_time: ''
          };
        }
      }
    },
    components: {
      RankAvatar,
      RankNo
    }
  };
</script>
<style lang="less">
  @import url('~@/app-shared/assets/css/mixin.less');

  .vmp-rank-item {
    width: 616px;
    height: 88px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 24px;
    .order-cell {
      width: 40px;
    }
    .user-cell {
      margin-left: 24px;
      width: 232px;
    }

    .avatar-wrap {
      .flex-mixin();
      .nickname {
        max-width: 168px;
      }
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    .score-cell {
      margin-left: 24px;
      width: 76px;
    }
    .rate-cell {
      margin-left: 24px;
      width: 80px;
    }
    .elapsed-time-cell {
      margin-left: 24px;
      width: 8px;
    }
  }
</style>
