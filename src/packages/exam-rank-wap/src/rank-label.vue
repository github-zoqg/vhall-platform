<template>
  <div class="rank-label">
    <div class="user-cell">{{ $t('exam.exam_1034') }}</div>
    <div class="score-cell">{{ $t('exam.exam_1048') }}</div>
    <div class="rate-cell">{{ $t('exam.exam_1035') }}</div>
    <div class="elapsed-time-cell">{{ $t('exam.exam_1049') }}</div>
  </div>
</template>
<script>
  export default {
    name: 'RankLabelWap',
    data() {
      return {
        show: true
      };
    }
  };
</script>
<style lang="less">
  .rank-label {
    width: 664px;
    height: 40px;
    margin: 0 auto 8px auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 24px;
    color: #595959;
    .user-cell {
      width: 296px;
      margin-left: 24px;
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
      width: 88px;
    }
  }
</style>
