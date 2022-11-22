<template>
  <vh-dialog
    :visible.sync="dialogVisible"
    width="544px"
    custom-class="result"
    class="vmp-rank-live"
    :before-close="handleClose"
  >
    <!-- 自定义头部 -->
    <span slot="title">
      <i class="el-icon-arrow-left" />
      成绩
      <span class="sub-title">公布成绩</span>
    </span>
    <!-- 内容 -->
    <div class="dialog-content">
      <div class="summary-panel">
        <div class="title-wrap std-title-lv1 std-border-bottom m-b-12">
          <span class="std-title-lv1 truncate title">
            {{ title }}
          </span>
          <el-tooltip effect="dark" content="" placement="top-start">
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
            <i class="iconfont-v3 saasicon_help_m" />
          </el-tooltip>
        </div>
        <el-row>
          <el-col :span="8" v-for="(item, idx) of summaryData" :key="idx">
            <div class="summary-item m-b-12">
              <h3 class="std-title-lv3">
                {{ item.label }}
                <el-tooltip v-if="item.tip" effect="dark" :content="item.tip" placement="top-start">
                  <i class="iconfont-v3 saasicon_help_m" />
                </el-tooltip>
              </h3>
              <p class="number">{{ item.value }}</p>
            </div>
          </el-col>
        </el-row>
      </div>
      <!-- 排行榜列表 -->
      <vh-table :data="rankList" class="m-t-16" size="mini">
        <vh-table-column label="排名" min-width="50">
          <template slot-scope="scope">
            <!-- <span>{{ scope.row.rank_no }}</span> -->
            <RankNo :ranking="scope.$index + 1" />
          </template>
        </vh-table-column>
        <vh-table-column label="用户" min-width="174">
          <template slot-scope="scope">
            <div class="avatar-wrap">
              <RankAvatar :src="scope.row.head_img" :ranking="scope.$index + 1" />
              <p class="nickname m-l-12 truncate">{{ scope.row.user_name }}</p>
            </div>
          </template>
        </vh-table-column>
        <vh-table-column prop="score" label="得分" min-width="64"></vh-table-column>
        <vh-table-column
          prop="right_rate"
          label="正确率"
          align="center"
          min-width="58"
        ></vh-table-column>
        <vh-table-column prop="use_time" label="用时" min-width="60"></vh-table-column>
      </vh-table>
      <p class="tip">最多展示前200名成绩，更多数据请查看「控制台-当前活动-互动统计-快问快答」</p>
      <vh-pagination
        background
        class="text-center ma m-t-16"
        layout="prev, pager, next"
        :total="total"
      ></vh-pagination>
    </div>
  </vh-dialog>
</template>
<script>
  import RankAvatar from './rank/avatar.vue';
  import RankNo from './rank/rank-no.vue';

  const summaryDataMap = {
    check: {
      label: '查看人数',
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
      tip: '（满分人数/提交人数）*100%',
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
      tip: '本次答题的总分数除以答题人数',
      value: 0
    }
  };
  // 组合统计数据
  const summaryData = Object.keys(summaryDataMap).reduce((result, key) => {
    result.push(summaryDataMap[key]);
    return result;
  }, []);

  export default {
    name: 'rank',
    components: {
      RankAvatar,
      RankNo
    },
    data() {
      return {
        dialogVisible: true,
        title: '',
        summaryData,
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
        const data = {
          title:
            '行显示超苹果2022年新品发布会极致行显示超苹果2022年新品发布会极致行显示超苹果2022年新品发布会极致',
          check_num: '123',
          answer_num: '33',
          full_score_rate: '4',
          full_score_count: '12',
          max_score: '100',
          min_score: '10',
          avg_score: '30'
        };
        this.title = data.title;
        summaryDataMap.check.value = data.check_num;
        summaryDataMap.answer.value = data.answer_num;
        summaryDataMap.rate.value = `${data.full_score_rate}%，${data.full_score_count}人`;
        summaryDataMap.max.value = data.max_score;
        summaryDataMap.min.value = data.min_score;
        summaryDataMap.avg.value = data.avg_score;
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
  .vmp-rank-live {
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
        }
      }
      &-item {
      }
    }

    .tip {
      font-size: 12px;
      line-height: 22px;
      color: #8c8c8c;
    }

    .avatar-wrap {
      .flex-mixin();
      height: 32px;
      .nickname {
        max-width: 140px;
      }
    }

    .number {
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
  }
</style>
