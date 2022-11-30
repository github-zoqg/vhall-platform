<template>
  <div class="rank-title">
    <div class="user-cell">{{ $t('exam.exam_1034') }}</div>
    <div class="score-cell">{{ $t('exam.exam_1048') }}</div>
    <div class="rate-cell">{{ $t('exam.exam_1035') }}</div>
    <div class="elapsed-time-cell">{{ $t('exam.exam_1049') }}</div>
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
    height: 22px;
    padding: 8px 0;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 22px;
    color: #595959;
    .user-cell {
      width: 156px;
      margin-left: 12px;
    }
    .score-cell {
      margin-left: 12px;
      width: 38px;
    }
    .rate-cell {
      margin-left: 12px;
      width: 54px;
    }
    .elapsed-time-cell {
      margin-left: 12px;
      width: 64px;
    }
  }
</style>
