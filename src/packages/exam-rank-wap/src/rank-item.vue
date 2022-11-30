<template>
  <div class="vmp-rank-item">
    <div class="order-cell">
      <RankNo
        :ranking="item && item.rank_no ? item.rank_no || 0 : 0"
        v-if="item && item.rank_no > 0"
      />
      <span v-else>--</span>
    </div>
    <div class="user-cell">
      <div class="avatar-wrap">
        <RankAvatar :ranking="item.rank_no" />
        <p class="nickname truncate m-l-12">{{ formatName(item.user_name || '--') }}</p>
      </div>
    </div>
    <div class="score-cell">{{ item.score || '--' }}</div>
    <div class="rate-cell">
      {{ item.right_rate != null && item.right_rate != undefined ? item.right_rate + '%' : '--' }}
    </div>
    <div class="elapsed-time-cell">{{ item.use_time | fmtUseTime }}</div>
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
    },
    methods: {
      formatName(str) {
        if (str.length > 2) {
          return str.substr(0, 1) + ''.padEnd(str.length - 2, '*') + str.substr(str.length - 1, 1);
        } else {
          return str;
        }
      }
    }
  };
</script>
<style lang="less">
  // @import url('~@/app-shared/assets/css/mixin.less');
  .mixin clearfix {
    &:after {
      content: '';
      display: table;
      clear: both;
    }
  }

  .mixin relative {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .flex-mixin(@justify: flex-start, @align-items: center, @dir: row, @wrap: nowrap, @align-content: stretch) {
    display: flex;
    flex-flow: @dir @wrap;
    justify-content: @justify;
    align-items: @align-items;
    align-content: @align-content;
  }

  .bg-mixin(@size: contain, @repeat: no-repeat, @position: center, @origin: initial) {
    background-size: @size;
    background-repeat: @repeat;
    background-position: @position;
    background-origin: @origin;
  }

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
        max-width: 140px;
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
