<template>
  <div class="icon-wrap">
    <img src="./images/exam_no.png" alt="" v-if="dotVisible" @click="clickExamIcon" />
    <img src="./images/exam.png" alt="" v-else @click="clickExamIcon" />
    <!-- 快问快答-列表弹框 -->
    <van-popup
      get-container="#otherPopupContainer"
      class="exam_base"
      v-model="examListDialogVisible"
      position="bottom"
      @close="closeExamListDialog"
    >
      <div class="vmp-exam-list_container">
        <div class="container-title">
          <span class="container-title-text">
            <span class="title_text">快问快答列表</span>
            <i class="container-title-text-line"></i>
          </span>
          <i class="vh-iconfont vh-line-close" @click="closeExamListDialog"></i>
        </div>
        <van-list
          class="container-data"
          @load="moreLoadData"
          :immediate-check="false"
          offset="30"
          :finished="finished"
          finished-text="没有更多了"
        >
          <ul v-show="examList && examList.length > 0">
            <li
              v-for="(item, index) in examList"
              :key="index"
              class="container-data__item"
              @click="checkExamInfo(item)"
            >
              <div class="container-data__left">
                <div class="container-data__left__item">{{ item.title }}</div>
                <div class="container-data__left__item">
                  <label>推送时间：</label>
                  <span>{{ item.push_time_str }}</span>
                </div>
                <div class="container-data__left__item">
                  <div>
                    <label>答题限时：</label>
                    <span>{{ item.limit_time_switch == 1 ? item.limit_time : '不限时' }}</span>
                  </div>
                  <div>
                    <label>总分：</label>
                    <span>{{ item.score }}</span>
                  </div>
                  <div>
                    <label>题数：</label>
                    <span>{{ item.question_num }}</span>
                  </div>
                </div>
              </div>
              <div class="container-data__right">
                <img src="./images/end.png" class="button_img" v-if="item && item.is_end" alt="" />
                <div class="button_text" v-else-if="item && item.total_score == item.score">
                  满分
                </div>
                <button class="button_answer" v-else>去答题</button>
              </div>
            </li>
          </ul>
        </van-list>
      </div>
    </van-popup>
  </div>
</template>
<script>
  export default {
    name: 'ExamIcon',
    data() {
      return {
        dotVisible: false,
        showExamList: false, // 是否展示快问快答列表
        examListDialogVisible: false,
        finished: true,
        examList: [],
        total: 0,
        examNum: 0,
        totalPages: 1, // 总页数
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        }
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 是否首次答题
      isFirstAnswer() {
        return false;
      }
    },
    methods: {
      async clickExamIcon() {
        if (this.showExamList) return false;
        await this.getExamList();
        // 获取未作答集合
        let arr = this.examList.filter(item => {
          if (item.limit_time_switch == 1) {
            // 未作答 且  答题未超时（开启了限时答题）
            return item.status == 0 && item.is_end == 0;
          } else {
            // 未作答（未开启限时答题）
            return item.status == 0;
          }
        });
        // 如果只有一份，直接进入到当前答题
        if (arr.length == 1) {
          this.toShowExam(arr[0]);
        } else if (this.examList && this.examList.length == 1) {
          let item = this.examList[0];
          if (item.status == 1) {
            // 已作答，已答题，直接查看个人成绩
            this.toShowExamRank(item);
          } else if (item.limit_time_switch == 1 && item.is_end == 1) {
            // 限时答题 & 已超时 & 未作答，toast提示 “很遗憾，您已错过本次答题机会！”
            this.$toast(this.$t('exam.exam_1010'));
            this.examListDialogVisible = false;
          }
        } else {
          this.showExamList = true;
          this.examListDialogVisible = true;
        }
      },
      moreLoadData() {
        if (this.pageInfo.pageNum >= this.totalPages) {
          return false;
        }
        this.pageInfo.pageNum++;
        this.pageInfo.pos = parseInt((this.pageInfo.pageNum - 1) * this.pageInfo.limit);
        this.getExamList(true);
      },
      // 查询 快问快答 - 列表
      getExamList(flag) {
        const params = {
          webinar_id: '活动ID',
          is_cache: 1,
          ...this.pageInfo
        };
        let result = {
          code: 200,
          data: {
            total: 4,
            list: [
              {
                paper_id: 1,
                title: 'Apple产品功能知识点①',
                push_time: '2022-11-07 20:10',
                score: 100, // 试卷总分
                question_num: 10, // 题目数量
                limit_time: 5, // 限制时间
                limit_time_switch: 1, // 限制时间开关 0.否 1.是
                total_score: '100', // 总得分
                right_rate: '100', // 正确率
                status: 1, // 是否作答 0.否 1.是
                is_end: false
              },
              {
                paper_id: 2,
                title: 'Apple产品功能知识点②',
                push_time: '2022-11-07 19:30',
                score: 100, // 试卷总分
                question_num: 10, // 题目数量
                limit_time: 0, // 限制时间
                limit_time_switch: 0, // 限制时间开关 0.否 1.是
                total_score: '', // 总得分
                right_rate: '', // 正确率
                status: 0, // 是否作答 0.否 1.是
                is_end: false
              },
              {
                paper_id: 3,
                title: 'Apple产品功能知识点③',
                push_time: '2022-11-07 19:30',
                score: 100, // 试卷总分
                question_num: 10, // 题目数量
                limit_time: 5, // 限制时间
                limit_time_switch: 1, // 限制时间开关 0.否 1.是
                total_score: '', // 总得分
                right_rate: '', // 正确率
                status: 0, // 是否作答 0.否 1.是
                is_end: true
              },
              {
                paper_id: 4,
                title: 'Apple产品功能知识点④',
                push_time: '2022-11-07 19:15',
                score: 100, // 试卷总分
                question_num: 10, // 题目数量
                limit_time: 0, // 限制时间
                limit_time_switch: 0, // 限制时间开关 0.否 1.是
                total_score: '', // 总得分
                right_rate: '', // 正确率
                status: 0, // 是否作答 0.否 1.是
                is_end: true
              }
            ]
          }
        };
        // TODO 接口调用
        this.renderListResult(result?.data || { total: 0, list: [] });
      },
      // 渲染列表查询结果
      renderListResult(resResult) {
        resResult.list.map(item => {
          item.push_time_str = dayjs(item.push_time).format('HH:mm');
        });
        this.examList = resResult.list;
        this.total = resResult.total;
        this.examNum = resResult.total;
      },
      // 关闭 快问快答 - 列表弹出框
      closeExamListDialog() {
        this.examList = [];
        this.pageInfo = {
          pos: 0,
          limit: 10,
          pageNum: 1
        };
        this.examListDialogVisible = false;
      },
      // 看成绩
      toShowExamRank(item) {
        this.closeExamList();
        this.$emit('clickIcon', {
          examId: item.paper_id,
          type: 'score'
        });
      },
      // 看答题逻辑
      toShowExam(item) {
        this.closeExamList();
        this.$emit('clickIcon', {
          examId: item.paper_id,
          type: 'answer'
        });
      },
      // 单个验证逻辑
      checkExamInfo(item) {
        if (item && item.is_end) {
          // 已结束
        } else if (item && item.total_score == item.score) {
          // 满分，看成绩
          this.toShowExamRank(item);
        } else {
          // 进入答题流程
          this.toShowExam(item);
        }
      },
      // 关闭问卷面板
      closeExamList() {
        this.showExamList = false;
        this.examListDialogVisible = false;
      },
      initExamEvents() {
        // 事件监听
      }
    },
    created() {
      // 第一步：检查快问快答 - 图标状态
    },
    mounted() {
      this.initExamEvents();
    }
  };
</script>

<style lang="less" scoped>
  .icon-wrap {
    width: 84px;
    height: 84px;
    position: relative;
    font-size: 28px;
    background-color: transparent;
    img {
      width: 84px;
      height: 84px;
    }
    .dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #ff0005;
      content: '';
    }
    .popup_base {
      height: 100vh;
      width: 100vw;
      background: rgba(0, 0, 0, 0.6);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 30;
    }
    .exam_base {
      max-height: 680px;
      background: transparent;
      background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
      border-radius: 30px 30px 0 0;
    }
    .vmp-exam-list_container {
      max-height: 680px;
      overflow: auto;
      .container-title {
        height: 142px;
        background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
        text-align: center;
        position: relative;
        .container-title-text {
          position: relative;
          top: 47px;
          z-index: 2;
          .title_text {
            font-weight: 600;
            text-shadow: 0 0.05333rem 0 #fff;
            font-size: 40px;
            line-height: 56px;
          }
        }
        .container-title-text-line {
          display: inline-block;
          width: 100%;
          height: 18px;
          position: absolute;
          bottom: 0px;
          left: 49%;
          transform: translate(-51%);
          background: rgba(255, 171, 166, 0.6);
          border-radius: 36px;
          content: '';
          z-index: -1;
        }
      }
      .container-data {
        max-height: calc(680px - 210px);
        padding: 0 40px;
        margin-bottom: 68px;
        position: relative;
        overflow: auto;
        color: @font-light-normal;
        z-index: 2;
        ul {
          li {
            color: @font-light-normal;
            font-size: 28px;
            line-height: 1.2;
            position: relative;
            &:last-child {
              .data-text_title {
                padding-bottom: 0;
              }
            }
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 0;
            border-bottom: 1px solid #e6e6e6;
            &:first-child {
              padding: 0 0 24px 0;
            }
            .container-data__left {
              &__item {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                margin-top: 4px;
                &:first-child {
                  font-weight: bold;
                  margin-top: 0;
                }
                span {
                  padding: 0 12px 0 0;
                }
              }
            }
            .container-data__right {
              .button_img {
                width: 136px;
                height: 136px;
              }
              .button_text {
                color: #fb2626;
                font-size: 34px;
                font-style: italic;
                font-weight: 500;
                text-align: center;
                width: 136px;
              }
              .button_answer {
                display: inline-block;
                padding: 9px 24px;
                min-width: 96px;
                height: 52px;
                line-height: 32px;
                border: 1px solid #fb2626;
                background-color: #fb2626 !important;
                border-radius: 32px;
                color: #ffffff;
                font-style: normal;
                font-weight: 400;
                font-size: 24px;
                text-align: center;
                background: transparent;
              }
            }
          }
        }
      }
      .vh-line-close {
        position: absolute;
        color: #8c8c8c;
        top: 37px;
        right: 30px;
        cursor: pointer;
      }
    }
  }
</style>
