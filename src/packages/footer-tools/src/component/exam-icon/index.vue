<template>
  <div class="vmp-exam-icon">
    <img src="./images/exam_no.png" alt="" v-if="dotVisible" @click="throttleCheckExam" />
    <img src="./images/exam.png" alt="" v-else @click="throttleCheckExam" />
    <!-- <img src="./images/questionnaire.png" alt="" @click="throttleCheckExam" />
    <i class="vmp-dot" v-if="dotVisible" /> -->
    <!-- 快问快答-列表弹框 -->
    <vh-dialog
      custom-class="exam_base"
      :visible.sync="examListDialogVisible"
      :close-on-click-modal="false"
      :show-close="true"
      width="420px"
      @close="closeExamListDialog"
    >
      <div slot="title" class="container-title">
        <span class="container-title-text">
          <span class="title_text">{{ $t('exam.exam_1022') }}</span>
        </span>
      </div>
      <div class="vmp-exam-list_container">
        <div class="container-data">
          <ul v-show="examList && examList.length > 0" v-infinite-scroll="moreLoadData">
            <li
              v-for="(item, index) in examList"
              :key="index"
              :class="`container-data__item ${item && item.is_end ? 'button_end_bg' : ''}`"
              @click="checkExamInfo(item)"
            >
              <div class="container-data__title">
                <div class="container-data__title__left">{{ item.title }}</div>
                <div class="container-data__title__right">
                  <template v-if="item && item.is_end">
                    <div class="button_text gray" v-text="$t('exam.exam_1028')"></div>
                  </template>
                  <template v-else-if="item && item.total_score > 0">
                    <div class="button_text">
                      <!-- 试卷总分>0，展示得分情况；否则展示正确率 -->
                      <span
                        class="score"
                        v-text="
                          item.total_score > 0
                            ? item.total_score == item.score
                              ? $t('exam.exam_1042')
                              : item.total_score
                            : item.right_rate
                        "
                      ></span>
                      <span
                        class="mini-size"
                        v-if="item.total_score != item.score"
                        v-text="item.total_score > 0 ? '分' : '%'"
                      ></span>
                    </div>
                  </template>
                  <div
                    class="button_answer"
                    v-if="!(item && item.total_score > 0) && !(item && item.is_end)"
                  >
                    <el-button type="danger" size="mini" round class="exam-answer-btn">
                      {{ $t('exam.exam_1027') }}
                    </el-button>
                  </div>
                </div>
              </div>
              <div class="container-data__info">
                <div>
                  <label v-text="`${$t('exam.exam_1023')}:`"></label>
                  <span v-text="item.push_time_str"></span>
                </div>
                <div>
                  <label v-text="`${$t('exam.exam_1024')}:`"></label>
                  <span
                    v-text="
                      `${
                        item.limit_time_switch == 1 ? item.limit_time_str : $t('exam.exam_1006')
                      }  `
                    "
                  ></span>
                </div>
                <div>
                  <label v-text="`${$t('exam.exam_1025')}:`"></label>
                  <span class="color-red" v-text="item.score"></span>
                </div>
                <div>
                  <label v-text="`${$t('exam.exam_1026')}:`"></label>
                  <span v-text="item.question_num"></span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </vh-dialog>
  </div>
</template>
<script>
  import { useExamServer } from 'middle-domain';
  import { throttle } from 'lodash';
  export default {
    name: 'ExamIcon',
    data() {
      return {
        dotVisible: false,
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
                title:
                  'Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点Apple产品功能知识点①',
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
              },
              {
                paper_id: 5,
                title: 'Apple产品功能知识点①',
                push_time: '2022-11-07 20:10',
                score: 100, // 试卷总分
                question_num: 10, // 题目数量
                limit_time: 5, // 限制时间
                limit_time_switch: 1, // 限制时间开关 0.否 1.是
                total_score: '60', // 总得分
                right_rate: '60', // 正确率
                status: 1, // 是否作答 0.否 1.是
                is_end: false
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
          item.limit_time_str =
            item.limit_time_switch == 1 ? this.formatStrByMinute(item.limit_time) : '';
        });
        this.examList = resResult.list;
        this.total = resResult.total;
        this.examNum = resResult.total;
      },
      // 格式化日期
      formatStrByMinute(str) {
        let hour = Math.floor(str / 60);
        let minute = str - hour * 60;
        return `${hour > 9 ? hour : `0${hour}`}:${minute > 9 ? minute : `0${minute}`}`;
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
        this.examListDialogVisible = false;
      },
      initExamEvents() {
        // 事件监听
      }
    },
    created() {
      this.examServer = useExamServer();
      // 第一步：检查快问快答 - 图标状态
      this.throttleCheckExam = throttle(this.clickExamIcon, 2000, { trailing: false });
    },
    mounted() {
      this.initExamEvents();
    }
  };
</script>

<style lang="less" scoped>
  .vmp-exam-icon {
    color: #fff;
    position: relative;
    width: 32px;
    height: 32px;
    line-height: 32px;
    background: linear-gradient(180deg, #5ac1ff 0%, #2578ff 100%);
    border-radius: 16px;
    cursor: pointer;
    margin-left: 16px;
    img.show_img {
      width: 32px;
      height: 32px;
      -webkit-transform-origin: left center;
      transform-origin: left center;
      margin: -1px 0 0 0;
    }
    .vmp-dot {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb2626;
      border: 1px solid var(--footer-icon-tip-border-color);
      border-radius: 50%;
      right: -3px;
      position: absolute;
    }
    img {
      width: 32px;
      height: 32px;
      cursor: pointer;
      margin: 0;
    }
  }
  /deep/.vh-dialog.exam_base {
    height: 460px;
    width: 100%;
    left: 0px;
    bottom: 0;
    background: url('./images/pc_bg_exam_list.png') no-repeat;
    box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    border-radius: 12px;
    .vh-dialog__header {
      padding: 0 0;
    }
    .vh-dialog__body {
      padding: 0 0;
      height: calc(100% - 88px);
    }
  }
  .container-title {
    height: 80px;
    text-align: center;
    position: relative;
    .container-title-text {
      position: absolute;
      top: 24px;
      left: 32px;
      .title_text {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: #262626;
      }
    }
  }
  .vmp-exam-list_container {
    height: 100%;
    overflow: hidden;
    .container-data {
      padding: 0 16px;
      position: relative;
      color: @font-light-normal;
      z-index: 2;
      overflow-x: hidden;
      overflow-y: auto;
      height: 100%;
      ul {
        width: 388px;
        li {
          color: @font-light-normal;
          position: relative;
          &:last-child {
            .data-text_title {
              padding-bottom: 0;
            }
          }
          padding: 16px 16px;
          background: #ffffff;
          border-radius: 4px;
          margin-bottom: 8px;
          .container-data__title {
            margin-top: 0;
            margin-bottom: 4px;
            width: 100%;
            display: flex;
            justify-content: space-around;
            align-items: center;
            .container-data__title__left {
              text-align: left;
              overflow: hidden;
              word-break: break-all;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              font-weight: bold;
              font-size: 14px;
              line-height: 22px;
              color: #262626;
              margin-right: auto;
            }
            .container-data__title__right {
              margin-left: 8px;
              flex-shrink: 0;
              .button_text {
                span {
                  font-family: 'DINPro';
                  font-style: normal;
                  font-weight: 400;
                  font-size: 18px;
                  line-height: 20px;
                  /* identical to box height, or 100% */
                  text-align: right;
                  color: #fb2626;
                  &.mini-size {
                    font-size: 9px;
                    text-align: left;
                  }
                }
              }
              .exam-answer-btn {
                border: 1px solid var(--theme-more-status-button-border);
                background: var(--theme-more-status-button-bg);
                color: var(--theme-more-status-button-color);
                &:hover {
                  background: var(--theme-more-status-button-hover-bg);
                  border: 1px solid var(--theme-more-status-button-hover-border);
                  color: var(--theme-more-status-button-hover-color);
                }
                &:active {
                  background: var(--theme-more-status-button-active-bg);
                  border: 1px solid var(--theme-more-status-button-active-border);
                  color: var(--theme-more-status-button-active-color);
                }
                &.is-disabled {
                  background: var(--theme-more-status-button-disabled-bg) !important;
                  border: 1px solid var(--theme-more-status-button-disabled-border) !important;
                  color: var(--theme-more-status-button-disabled-color) !important;
                }
              }
            }
          }
          .container-data__info {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex-wrap: wrap;
            span,
            label {
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
              line-height: 20px;
              color: #595959;
            }
            div {
              span {
                padding: 0 8px 0 0;
              }
              &:last-child {
                span {
                  padding: 0 0 0 8px;
                }
              }
            }
          }
          &.button_end_bg {
            // 结束情况下
            background-image: url('./images/pc_end.png');
            background-size: 35px 35px;
            background-position: right bottom;
            background-repeat: no-repeat;
          }
          &:last-child {
            margin-bottom: 24px;
          }
        }
      }
    }
    .vh-line-close {
      position: absolute;
      color: #8c8c8c;
      top: 24px;
      right: 32px;
      cursor: pointer;
      font-size: 12px;
    }
  }
</style>
