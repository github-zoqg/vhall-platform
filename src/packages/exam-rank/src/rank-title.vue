<template>
  <div class="rank-title">
    <div class="user-cell">用户</div>
    <div class="score-cell">得分</div>
    <div class="rate-cell">正确率</div>
    <div class="elapsed-time-cell">用时</div>
  </div>
</template>
<script>
  export default {
    name: 'RankTitleWatch',
    data() {
      return {
        show: true
      };
    }
  };
</script>
<style lang="less">
  .rank-title {
    width: 332px;
    height: 44px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 12px;
    color: #595959;
    .user-cell {
      width: 148px;
      margin-left: 12px;
    }
    .score-cell {
      margin-left: 12px;
      width: 38px;
    }
    .rate-cell {
      margin-left: 12px;
      width: 40px;
    }
    .elapsed-time-cell {
      margin-left: 12px;
      width: 44px;
    }
  }
</style>
