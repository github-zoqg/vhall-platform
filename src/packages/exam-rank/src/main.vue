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
      <vh-tooltip
        class="vh-dialog__title rank-max-title"
        slot="title"
        effect="dark"
        :content="examTitle"
        placement="top-end"
      >
        <span>{{ examTitle }}</span>
      </vh-tooltip>
      <div class="vmp-rank-watch">
        <RankTitleWatch />
        <div
          :class="[
            'rank-list-wrap',
            ownerData ? '' : 'not-owner',
            total >= 200 ? 'max-total' : '',
            total <= queryParams.limit ? 'one-page' : ''
          ]"
        >
          <ul class="rank-list">
            <li v-for="item of rankList" :key="item.id" class="rank-item">
              <RankItemWatch :item="item" />
            </li>
          </ul>
        </div>
        <div class="self-rank" v-if="ownerData">
          <RankItemWatch class="ma" :item="ownerData" />
        </div>
        <div class="dialog-bottom" v-if="total > queryParams.limit">
          <div class="rank-list-more" v-if="total >= 200">
            {{ $t('exam.exam_1045') }}
          </div>
          <vh-pagination
            background
            slot="footer"
            class="text-center ma m-t-16 m-b-16"
            layout="prev, pager, next"
            :page-size="queryParams.limit"
            :pager-count="5"
            :total="total"
            :current-page="targetPage"
            @current-change="handleChangePage"
            v-if="total > 0"
          ></vh-pagination>
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
        this.initData();
      },
      // 获取列表数据
      initData() {
        this.targetPage = 1;
        // 获取成绩排名列表
        this.getRankData();
        // 获取个人成绩
        this.getOwnerRankData();
      },
      getRankData() {
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
              this.total = data.total;
              this.rankList = data.list;
              this.totalPages = Math.ceil(this.total / this.queryParams.limit);
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
      handleChangePage(page) {
        this.targetPage = page;
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
      &.one-page {
        height: 308px;
      }
      &.max-total {
        height: 226px;
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
