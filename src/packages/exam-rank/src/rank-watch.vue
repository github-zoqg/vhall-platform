<template>
  <vh-dialog
    :visible.sync="dialogVisible"
    width="380px"
    title="Apple产品功能知识"
    custom-class="result"
    :before-close="handleClose"
  >
    <div class="vmp-rank-watch">
      <RankTitleWatch />
      <div class="rank-list-wrap">
        <ul class="rank-list">
          <li v-for="item of rankList" :key="item.id" class="rank-item">
            <RankItemWatch :item="item" />
          </li>
        </ul>
      </div>
      <div class="dialog-bottom">
        <div class="self-rank">
          <RankItemWatch class="ma" />
        </div>
        <vh-pagination
          background
          slot="footer"
          class="text-center ma m-t-16 m-b-16"
          layout="prev, pager, next"
          :total="total"
        ></vh-pagination>
      </div>
    </div>
  </vh-dialog>
</template>
<script>
  import RankTitleWatch from './rank-title.vue';
  import RankItemWatch from './rank-item.vue';

  export default {
    name: 'rank',
    components: {
      RankTitleWatch,
      RankItemWatch
    },
    data() {
      return {
        dialogVisible: true,
        title: '',
        rankList: [],
        total: 25
      };
    },
    created() {
      this.initData();
    },
    methods: {
      // 获取桌面
      initData() {
        this.initRankData();
      },
      initRankData() {
        const mockData = {
          rank_no: 1,
          user_name: 'user_name',
          head_img: '',
          score: '100',
          right_rate: '10%',
          use_time: '90:10'
        };
        const data = {
          total: 20,
          list: new Array(5).fill(mockData)
        };
        this.total = data.total;
        this.rankList = data.list;
      },
      handleClose() {}
    }
  };
</script>

<style lang="less">
  @import url('~@/app-shared/assets/css/mixin.less');

  .vh-dialog {
    &.result {
      .bg-mixin(@size: cover);
      background-image: url('./img/dialog-watch-bg.png');
      height: 460px;
      overflow: hidden;
    }

    .vh-dialog__body {
      margin: 0;
      padding: 0;
      height: 386px;
    }
  }

  .vmp-rank-watch {
    height: 100%;
    position: relative;

    .rank-list-wrap {
      padding: 0 24px;
    }
    .rank-list {
      background: #fff;
      border-radius: 4px;
      padding: 0 12px;
    }
    .rank-item:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
    .avatar-wrap {
      .flex-mixin();
      height: 32px;
      .nickname {
        max-width: 140px;
      }
    }

    .rank {
      .item {
        width: 100%;
        height: 55px;
        background: #fff;
        border-radius: 8px;
      }
    }

    .dialog-bottom {
      position: absolute;
      width: 100%;
      left: 0;
      bottom: 0;
    }
    .self-rank {
      padding: 0 12px;
      background: #f5f5f5;
    }
  }
</style>
