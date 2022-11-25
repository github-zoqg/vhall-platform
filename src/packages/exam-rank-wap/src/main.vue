<template>
  <!-- 快问快答-排行榜 -->
  <van-popup
    get-container="#otherPopupContainer"
    class="vmp-exam-rank-wap"
    v-model="examRankVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examRankVisible"
  >
    <RankTitle :title="examTitle" />
    <div class="vmp-rank-wap">
      <RankLabel />
      <div class="rank-list-wrap">
        <ul class="rank-list">
          <van-list v-model="loading" :finished="finished" finished-text="" @load="onLoad">
            <li v-for="item of rankList" :key="item.id" class="rank-item">
              <RankItemWap :item="item" />
            </li>
          </van-list>
        </ul>
      </div>
    </div>
    <div class="dialog-bottom">
      <div class="≈">
        <RankItemWap class="ma" />
      </div>
    </div>
  </van-popup>
</template>
<script>
  import RankTitle from './rank-title.vue';
  import RankLabel from './rank-label.vue';
  import RankItemWap from './rank-item.vue';
  import { useExamServer } from 'middle-domain';
  export default {
    name: 'VmpExamRankWap',
    components: {
      RankTitle,
      RankLabel,
      RankItemWap
    },

    data() {
      return {
        examRankVisible: false,
        examTitle: '',
        totalPages: 0, // 总页面
        targetPage: 0, // 当前目标页数
        queryParams: {
          pos: 0,
          limit: 10
        },
        rankList: [],
        examId: '',
        loading: false,
        finished: false
      };
    },
    created() {
      this.examServer = useExamServer();
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
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
      // 获取桌面
      initData() {
        this.getRankData();
      },
      // 加载更多
      onLoad() {
        if (this.targetPage >= this.totalPages) {
          this.finished = true;
          this.loading = false;
          return false;
        }
        this.loading = true;
        this.targetPage++;
        this.queryParams.pos = parseInt((this.targetPage - 1) * this.queryParams.limit);
        this.getRankData();
      },
      getRankData() {
        const params = {
          pos: this.queryParams.pos,
          limit: this.queryParams.limit,
          paper_id: this.examId
        };
        this.loading = true;
        this.examServer
          .getExamRankList(params)
          .then(res => {
            this.loading = false;
            if (res.code === 200) {
              res.data.list = res.data.list || [];
              this.total = res.data.total || 0;
              if (this.rankList && this.rankList.length > 0) {
                this.rankList.concat(res.data.list);
              } else {
                this.rankList = res.data.list || [];
              }
              this.totalPages = Math.ceil(this.total / this.queryParams.limit);
              if (this.targetPage >= this.totalPages) {
                this.finished = true;
              }
            }
          })
          .catch(res => {
            this.loading = false;
          });
      },
      closeDialog() {
        this.examRankVisible = false;
      }
    }
  };
</script>
<style lang="less">
  @import url('~@/app-shared/assets/css/mixin.less');

  .vmp-exam-rank-wap {
    height: 844px;
    background: transparent;
    background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
    border-radius: 40px 40px 0px 0px;

    .vmp-rank-wap {
      height: calc(100% - 116px);
      overflow: auto;
      position: relative;

      .rank-list-wrap {
        padding: 0 32px;
      }
      .rank-list {
        background: #fff;
        border-radius: 16px 16px 0px 0px;
        padding: 0 24px;
      }
      .rank-item:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
      .avatar-wrap {
        .flex-mixin();
        height: 64px;
        .nickname {
          max-width: 280px;
        }
      }

      .rank {
        .item {
          width: 100%;
          height: 110px;
          background: #fff;
          border-radius: 16px;
        }
      }
    }
    .dialog-bottom {
      position: absolute;
      width: 100%;
      left: 0;
      bottom: 0;
      z-index: 2;
      background: #f5f5f5;
    }
    .self-rank {
      padding: 0 24px;
    }
  }
</style>
