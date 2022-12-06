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
        <p class="nickname truncate m-l-12">{{ item.user_name || '--' }}</p>
      </div>
    </div>
    <div class="score-cell">{{ item.score || '--' }}</div>
    <div
      class="rate-cell"
      v-text="
        item.right_rate != null && item.right_rate != undefined
          ? Number(item.right_rate).toFixed(1) + '%'
          : '--'
      "
    ></div>
    <div class="elapsed-time-cell">
      {{ item.use_time | fmtUseTime }}
    </div>
  </div>
</template>
<script>
  import RankAvatar from './rank/avatar.vue';
  import RankNo from './rank/rank-no.vue';

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
    width: 308px;
    height: 44px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: #262626;
    .order-cell {
      width: 20px;
    }
    .user-cell {
      margin-left: 12px;
      width: 116px;
    }

    .avatar-wrap {
      .flex-mixin();
      .nickname {
        max-width: 70px;
      }
    }

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    .score-cell {
      margin-left: 12px;
      width: 38px;
    }
    .rate-cell {
      margin-left: 12px;
      width: 56px;
    }
    .elapsed-time-cell {
      margin-left: 12px;
      width: 44px;
    }
  }
</style>
