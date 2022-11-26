<template>
  <!-- 快问快答-排行榜 -->
  <vh-dialog
    :visible.sync="examRankVisible"
    width="380px"
    custom-class="result"
    :before-close="handleClose"
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
      <div class="rank-list-wrap">
        <ul class="rank-list">
          <li v-for="item of rankList" :key="item.id" class="rank-item">
            <RankItemWatch :item="item" />
          </li>
        </ul>
      </div>
      <div class="self-rank">
        <RankItemWatch class="ma" />
      </div>
      <div class="dialog-bottom">
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
</template>
<script>
  import RankTitleWatch from './rank-title.vue';
  import RankItemWatch from './rank-item.vue';
  import { useExamServer } from 'middle-domain';
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
      return {
        examRankVisible: false,
        examTitle: '',
        totalPages: 0, // 总页面
        targetPage: 1, // 当前目标页数
        queryParams: {
          limit: 10,
          pageNum: 1
        },
        rankList: [],
        total: 0,
        loading: false
      };
    },
    created() {
      this.examServer = useExamServer();
    },
    methods: {
      // 关闭 快问快打 - 排行榜手机弹出框
      handleClose() {
        this.examRankVisible = false;
      },
      async open(examId, examTitle = '') {
        this.examRankVisible = true;
        this.examId = examId;
        this.examTitle = examTitle;
        this.initData();
      },
      // 获取列表数据
      initData() {
        this.loading = true;
        this.targetPage = 1;
        this.getRankData();
      },
      getRankData() {
        const params = {
          pos: (this.queryParams.pos = parseInt((this.targetPage - 1) * this.queryParams.limit)),
          limit: this.queryParams.limit,
          paper_id: this.examId
        };
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
      handleChangePage(page) {
        this.targetPage = page;
        this.getRankData();
      }
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
      .vh-dialog__body {
        margin: 0;
        padding: 0;
        height: 386px;
      }
      .rank-max-title {
        width: 280px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
      }
    }
  }

  .vmp-rank-watch {
    height: 100%;
    position: relative;
    .rank-list-wrap {
      padding: 0 24px;
      padding-top: 52px;
      overflow-y: auto;
      height: 226px;
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
