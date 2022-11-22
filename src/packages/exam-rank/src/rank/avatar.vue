<template>
  <div
    :class="['rank-avatar relative', rankingClass]"
    :style="{
      backgroundImage: `url('${avatarImg}')`
    }"
  >
    <img v-if="[1, 2, 3].includes(ranking)" class="crown absolute" :src="crownImg" />
  </div>
</template>
<script>
  /**
   * @description 观看端
   */
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import goldCrown from './img/gold.png';
  import silverCrown from './img/silver.png';
  import bronzeCrown from './img/bronze.png';

  const crownMap = [null, goldCrown, silverCrown, bronzeCrown];
  const rankingMap = ['', 'gold', 'silver', 'bronze'];

  export default {
    name: 'RankAvatar',
    props: {
      ranking: {
        type: Number,
        default() {
          return 2;
        }
      },
      src: {
        type: String,
        default() {
          return '';
        }
      }
    },
    computed: {
      avatarImg() {
        return this.src || defaultAvatar;
      },
      crownImg() {
        return crownMap[this.ranking] || '';
      },
      rankingClass() {
        return rankingMap[this.ranking] || '';
      }
    }
  };
</script>
<style lang="less" scoped>
  @import url('~@/app-shared/assets/css/mixin.less');

  .rank-avatar {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-repeat: no-repeat;
    background-size: contain;
    border: 2px solid transparent;
    border-radius: 50%;
    .bg-mixin();

    &.gold {
      border-color: #ffcd5c;
    }

    &.silver {
      border-color: #aeb7d4;
    }

    &.bronze {
      border-color: #f4a37a;
    }

    .crown {
      width: 12px;
      height: 12px;
      top: -6px;
      right: -5px;
    }
  }
</style>
