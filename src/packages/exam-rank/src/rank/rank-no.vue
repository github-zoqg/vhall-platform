<template>
  <div :class="['rank-no', rankingClass]">
    {{ rankNo }}
  </div>
</template>
<script>
  /**
   * @description 观看端
   */

  const rankingMap = ['', 'gold', 'silver', 'bronze'];

  export default {
    name: 'RankNo',
    props: {
      ranking: {
        type: Number,
        default() {
          return 0;
        }
      }
    },
    computed: {
      rankingClass() {
        return rankingMap[this.ranking] || '';
      },
      rankNo() {
        if (this.ranking) return `${this.ranking}`.padStart(2, '0');
        return '--';
      }
    }
  };
</script>
<style lang="less" scoped>
  @import url('~@/app-shared/assets/css/mixin.less');
  @import url('~@/app-shared/assets/css/D-DIN-Bold/stylesheet.css');

  .rank-no {
    font-family: 'D-DIN';
    font-weight: 700;
    font-size: 14px;
    line-height: 22px;
    color: #8c8c8c;
    transform: matrix(1, 0, -0.09, 1, 0, 0);

    &.gold {
      color: #ffcd5c;
    }

    &.silver {
      color: #aeb7d4;
    }

    &.bronze {
      color: #f4a37a;
    }
  }
</style>
