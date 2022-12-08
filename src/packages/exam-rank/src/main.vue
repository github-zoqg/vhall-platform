<template>
  <div>
    <!-- 快问快答-排行榜 -->
    <vh-dialog
      :visible.sync="examRankVisible"
      width="380px"
      custom-class="result"
      :before-close="handleClose"
      draggable
      :modal="false"
      :part-block="true"
      :z-index="zIndexServerState.zIndexMap.examRank"
    >
      <span class="rank-max-title" slot="title">{{ examTitle }}</span>
      <div class="vmp-rank-watch">
        <RankTitleWatch />
        <div
          :class="['rank-list-wrap one-page', ownerData ? '' : 'not-owner']"
          v-infinite-scroll="loadRank"
          infinite-scroll-delay="500"
        >
          <ul class="rank-list">
            <li v-for="item of rankList" :key="item.id" class="rank-item">
              <RankItemWatch :item="item" />
            </li>
          </ul>
          <p class="exam-rank-center" v-if="loading">
            <span class="load-icon"></span>
            {{ $t('common.common_1001') }}
          </p>
          <p class="exam-rank-center" v-if="total < maxTotal && rankList.length == total">
            {{ $t('nav.nav_1043') }}
          </p>
          <div
            class="exam-rank-center rank-more"
            v-if="total > queryParams.limit && total >= maxTotal"
          >
            {{ $t('exam.exam_1045') }}
          </div>
        </div>
        <div
          :class="`self-rank ${rankList && rankList.length > 6 ? 'is-scroll' : ''}`"
          v-if="ownerData"
        >
          <RankItemWatch class="ma" :item="ownerData" />
        </div>
      </div>
    </vh-dialog>
  </div>
</template>
<script>
  import RankTitleWatch from './rank-title.vue';
  import RankItemWatch from './rank-item.vue';
  import { useZIndexServer, useExamServer } from 'middle-domain';
  export default {
    name: 'VmpExamRank',
    components: {
      RankTitleWatch,
      RankItemWatch
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        examRankVisible: false,
        examTitle: '',
        totalPages: 0, // 总页面
        targetPage: 1, // 当前目标页数
        queryParams: {
          limit: 10,
          pos: 0
        },
        rankList: [],
        total: 0,
        maxTotal: 200,
        showBottom: false,
        bottomText: '',
        loading: false,
        ownerData: {
          rank_no: 0
        }
      };
    },
    methods: {
      // 关闭 快问快打 - 排行榜手机弹出框
      handleClose() {
        this.examRankVisible = false;
      },
      async open(examId, examTitle = '') {
        this.zIndexServer.setDialogZIndex('examRank');
        this.examRankVisible = true;
        this.examId = examId;
        this.examTitle = examTitle;
        // 从第一页开始查询
        this.resetQueryRanklist();
        // 获取个人成绩
        this.getOwnerRankData();
      },
      resetQueryRanklist() {
        this.targetPage = 1;
        this.rankList = [];
        this.totalPages = 0;
        // 获取成绩排名列表
        this.getRankData();
      },
      getRankData() {
        if (this.targetPage > this.totalPages && this.totalPages > 0) {
          this.showBottom = true;
          return;
        }
        this.queryParams.pos = (this.targetPage - 1) * this.queryParams.limit;
        const params = {
          pos: this.queryParams.pos,
          limit: this.queryParams.limit,
          paper_id: this.examId,
          from_consumer: 1
        };
        this.loading = true;
        this.examServer
          .getExamRankList(params)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              const data = res.data;
              const rankList = data.list || [];
              if (this.rankList.length > 0) {
                this.rankList = this.rankList.concat(rankList);
              } else {
                this.rankList = data.list;
              }
              this.total = data.total;
              this.totalPages =
                this.maxTotal > this.total
                  ? Math.ceil(this.total / this.queryParams.limit)
                  : Math.ceil(this.maxTotal / this.queryParams.limit);
            }
          })
          .catch(res => {
            this.loading = false;
          });
      },
      getOwnerRankData() {
        this.examServer
          .getExamUserScope(this.examId)
          .then(res => {
            if (res.code === 200) {
              let data = res.data;
              data.rank_no = Number(data.rank) || 0;
              this.ownerData = data;
            }
          })
          .catch(res => {});
      },
      loadRank() {
        if (this.targetPage > this.totalPages && this.totalPages > 0) {
          return;
        }
        this.targetPage++;
        this.getRankData();
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.examServer = useExamServer();
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

  .vh-dialog {
    &.result {
      .bg-mixin(@size: cover);
      height: 468px;
      background: #ffffff;
      background: url('./img/dialog-watch-bg.png') no-repeat;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05), 0px 8px 16px rgba(51, 51, 51, 0.24);
      border-radius: 12px;
      background-color: #ffffff;
      background-position: top;
      background-size: cover;
      border-radius: 12px;
      overflow: hidden;
      .vh-dialog__header {
        padding: 24px 32px 8px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .vh-dialog__body {
        margin: 0;
        padding: 0;
        height: 412px;
      }
      .rank-max-title {
        width: 280px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: #262626;
      }
    }
  }

  .vmp-rank-watch {
    height: 100%;
    position: relative;
    .rank-list-wrap {
      padding: 0 24px;
      margin-top: 58px;
      overflow-y: auto;
      height: 248px;
      margin-right: 2px;
      &.one-page {
        height: 308px;
      }
      &.max-total {
        height: 274px;
      }
      &.not-owner {
        margin-top: 8px;
        height: 412px;
        .rank-item:last-child {
          padding-bottom: 66px;
        }
        &.max-total {
          height: 280px;
        }
      }
      .exam-rank-center {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        color: #8c8c8c;
        text-align: center;
      }
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
        max-width: 70px;
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
    .rank-list-more {
      text-align: center;
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: #8c8c8c;
      padding: 16px 24px;
    }
    .rank-more {
      padding: 16px 24px;
    }
    .dialog-bottom {
      position: absolute;
      width: 100%;
      left: 0;
      bottom: 0;
      background: #ffffff;
    }
    .self-rank {
      padding: 0 12px;
      background: #ffffff;
      position: absolute;
      left: 0;
      top: 44px;
      box-sizing: border-box;
      margin: 0 24px;
      background: linear-gradient(90.57deg, #eddeff -8.43%, #e9f5ff 118.78%);
      border-radius: 4px;
      &.is-scroll {
        max-width: 324px;
      }
    }
    .vh-pagination {
      padding: 16px 0;
    }
    .vh-pagination {
      li {
        height: 32px;
        line-height: 32px;
      }
      &--small {
        li {
          height: 22px;
          line-height: 22px;
        }
      }
    }
  }
</style>
