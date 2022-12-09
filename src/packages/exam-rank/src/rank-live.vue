<template>
  <vh-dialog
    :visible.sync="dialogVisible"
    width="544px"
    modal
    custom-class="result"
    class="vmp-rank-live"
    :close-on-click-modal="false"
    append-to-body
  >
    <!-- 自定义头部 -->
    <label slot="title">
      <i
        class="vh-iconfont vh-line-arrow-left cursor-pointer std-color-icon"
        @click="dialogVisible = false"
      />
      <span class="std-panvh-title m-l-8">成绩</span>
    </label>
    <!-- 内容 -->
    <div
      class="dialog-content"
      v-loading="loading"
      element-loading-text="成绩统计中，请耐心等待.."
      element-loading-background="#fff"
    >
      <div class="summary-panel">
        <div class="title-wrap std-title-lv1 std-border-bottom m-b-12">
          <span class="std-title-lv1 truncate title">
            {{ title }}
          </span>
          <vh-tooltip effect="dark" content="" placement="top-start">
            <div slot="content">
              1.成绩排名按照得分展示，未设置分数时按照正确率展示
              <br />
              2.得分或者正确率相同时，按照答题用时排名
              <br />
              3.得分、正确率、答题用时相同时，按照用户提交答题时间排序
              <br />
              4.用时：用户开始答题至提交答题所用时间
              <br />
              5.主动交卷：用户自己点击提交为主动交卷
            </div>
            <i class="iconfont-v3 saasicon_help_m m-l-6" />
          </vh-tooltip>
        </div>
        <vh-row>
          <vh-col :span="8" v-for="(item, idx) of summaryData" :key="idx">
            <div class="summary-item m-b-12">
              <h3 class="std-title-lv3">
                {{ item.label }}
                <vh-tooltip v-if="item.tip" effect="dark" :content="item.tip" placement="top-start">
                  <i class="iconfont-v3 saasicon_help_m" />
                </vh-tooltip>
              </h3>
              <p class="summary-number">{{ item.value }}</p>
            </div>
          </vh-col>
        </vh-row>
      </div>
      <!-- 排行榜列表 -->
      <vh-table :data="rankList" class="m-t-16" size="mini">
        <vh-table-column label="排名" min-width="50">
          <template slot-scope="scope">
            <RankNo :ranking="scope.row.rank_no" />
          </template>
        </vh-table-column>
        <vh-table-column label="用户" width="174">
          <template slot-scope="scope">
            <div class="avatar-wrap">
              <RankAvatar :src="scope.row.head_img" :ranking="scope.row.rank_no" />
              <p class="nickname m-l-12 truncate">{{ scope.row.user_name }}</p>
            </div>
          </template>
        </vh-table-column>
        <vh-table-column prop="score" label="得分" min-width="64" align="center">
          <template slot-scope="scope">
            {{ scope.row | fmtScore }}
          </template>
        </vh-table-column>
        <vh-table-column label="正确率" align="center" min-width="58">
          <template slot-scope="scope">
            {{ scope.row.right_rate | fmtRightRate }}
          </template>
        </vh-table-column>
        <vh-table-column label="用时" min-width="65">
          <template slot-scope="scope">
            {{ scope.row.use_time | fmtUseTime }}
          </template>
        </vh-table-column>
      </vh-table>
      <p v-if="totalLimitTip" class="tip">
        最多展示前200名成绩，更多数据请查看「控制台-当前活动-互动统计-快问快答」
      </p>
      <div class="m-t-16">
        <vh-pagination
          class="ma text-center"
          background
          layout="prev, pager, next"
          :page-size="queryParams.limit"
          :total="total"
          hide-on-single-page
          :current-page="queryParams.pageNum"
          @current-change="handleChangePage"
        ></vh-pagination>
      </div>
    </div>
  </vh-dialog>
</template>
<script>
  import RankAvatar from './rank/avatar.vue';
  import RankNo from './rank/rank-no.vue';
  import { roundRate } from '@/app-shared/utils/math';

  const summaryDataMap = {
    unAnswer: {
      label: '未答人数',
      tip: '主办方推送快问快答至观看端，仅查看题目未进行作答的人数，人数排重',
      value: 0
    },
    answer: {
      label: '答题人数',
      tip: '主办方推送快问快答至观看端，参与答题的人数（包含主动交卷、人工及系统收卷），人数排重',
      value: 0
    },
    rate: {
      label: '满分率',
      tip: '（满分人数/答题人数）*100%',
      value: 0
    },
    max: {
      label: '最高分',
      value: 0
    },
    min: {
      label: '最低分',
      value: 0
    },
    avg: {
      label: '平均分',
      tip: '本次答题的总分数/答题人数',
      value: 0
    }
  };
  // 组合统计数据
  const summaryData = Object.keys(summaryDataMap).reduce((result, key) => {
    result.push(summaryDataMap[key]);
    return result;
  }, []);
  export default {
    name: 'VMPRankLive',
    inject: ['examServer'],
    components: {
      RankAvatar,
      RankNo
    },
    data() {
      return {
        queryParams: {
          limit: 5,
          pageNum: 1
        },
        examId: '',
        dialogVisible: false,
        title: '',
        summaryData,
        rankList: [],
        total: 0,
        loading: true,
        totalLimitTip: false
      };
    },
    filters: {
      fmtUseTime(time) {
        time = parseInt(time) || 0;
        const mm = `${Math.floor(time / 60)}`.padStart(2, '0');
        const ss = `${Math.floor(time % 60)}`.padStart(2, '0');
        return `${mm}:${ss}`;
      },
      fmtScore(examObj) {
        return examObj.total_score ? examObj.score : '-';
      },
      fmtRightRate(rate) {
        return roundRate(rate) + '%';
      }
    },
    methods: {
      open(examObj) {
        this.examId = examObj.id;
        this.initComp();
        this.dialogVisible = true;
      },
      initComp() {
        this.loading = true;
        this.queryParams.pageNum = 1;
        this.getSummary()
          .then(() => {
            this.getRankData();
          })
          .finally(() => {
            this.loading = false;
          });
      },
      // 获取桌面
      getSummary() {
        return this.examServer.getExamSummary(this.examId).then(res => {
          if (res.code !== 200) return;
          const data = res.data;
          this.title = data.title;
          summaryDataMap.unAnswer.value = data.un_answered_num;
          summaryDataMap.answer.value = data.answer_num;
          summaryDataMap.rate.value = `${roundRate(data.full_score_rate)}%，${
            data.full_score_num
          }人`;
          summaryDataMap.max.value = data.max_score;
          summaryDataMap.min.value = data.min_score;
          summaryDataMap.avg.value = roundRate(data.avg_score);
        });
      },
      getRankData() {
        const pos = (this.queryParams.pageNum - 1) * this.queryParams.limit;
        let limit = this.queryParams.limit;
        // 前端控制的分页最多显示200条(入口级别限制,前后端逻辑都不是太严谨,好在问题也不严重)
        if (pos + limit > 200) {
          limit = Math.abs(200 - (pos + limit));
        }
        const params = {
          pos,
          limit,
          paper_id: this.examId,
          from_consumer: 1,
          is_desensitization: 0
        };
        this.examServer.getExamRankList(params).then(res => {
          if (res.code === 200) {
            const data = res.data;
            const originalTotal = data.total;
            this.total = originalTotal;
            this.totalLimitTip = false;
            if (originalTotal > 200) {
              this.total = 200;
              if (this.queryParams.pageNum * this.queryParams.limit >= 200) {
                this.totalLimitTip = true;
              }
            }
            this.rankList = data.list;
          }
        });
      },
      handleChangePage(page) {
        this.queryParams.pageNum = page;
        this.getRankData();
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
  .vmp-rank-live {
    // reset vhall-ui
    .vh-table th:first-child .cell {
      // padding-left: 0 !important;
    }
    .iconfont-v3 {
      font-size: 14px;
    }

    .vh-dialog {
      &.result {
        .bg-mixin(@position: top);
        background-image: url('./img/dialog-bg.png');
      }
    }

    .sub-title {
      font-size: 14px;
      color: #1e4edc;
    }

    .dialog-content {
      background: #fff;
      border-radius: 4px 4px 0px 0px;
    }

    .summary {
      &-panel {
        padding: 0 24px;
        .title-wrap {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          height: 40px;
        }
        .title {
          display: inline-block;
          max-width: 410px;
          margin-right: 5px;
        }
      }
      &-item {
      }
    }

    .tip {
      font-size: 12px;
      line-height: 22px;
      color: #8c8c8c;
      text-align: center;
    }

    .avatar-wrap {
      .flex-mixin();
      height: 32px;
      .nickname {
        max-width: 70px;
      }
    }

    .summary-number {
      font-weight: 700;
      font-size: 20px;
      line-height: 22px;
      color: #262626;
    }

    .rank {
      .item {
        width: 100%;
        height: 55px;
        background: #fff;
        border-radius: 8px;
      }
    }
    // 覆盖vhall-ui
    tr td:first-child .cell {
      padding-left: 0 !important;
    }
  }
</style>
