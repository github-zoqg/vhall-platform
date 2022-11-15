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
            <span class="title_text">{{ $t('exam.exam_1022') }}</span>
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
          finished-text=""
        >
          <ul v-show="examList && examList.length > 0">
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
                    <van-button type="danger" size="mini" round>
                      {{ $t('exam.exam_1027') }}
                    </van-button>
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
      width: 100%;
      left: 0px;
      bottom: 0;
      background: url('./images/bg_exam_list.png') no-repeat;
      box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
      border-radius: 40px 40px 0px 0px;
      background-color: #ffffff;
      background-position: top;
      background-size: cover;
    }
    .vmp-exam-list_container {
      max-height: 680px;
      overflow: auto;
      .container-title {
        height: 100px;
        text-align: center;
        position: relative;
        // background-image: url('./images/bg_exam_list_header.png');
        // background-repeat: no-repeat;
        // background-size: cover;
        .container-title-text {
          position: absolute;
          top: 36px;
          left: 32px;
          .title_text {
            font-style: normal;
            font-weight: 500;
            font-size: 28px;
            line-height: 40px;
            color: #262626;
          }
        }
      }
      .container-data {
        max-height: calc(680px - 210px);
        padding: 0 32px;
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
            padding: 32px 32px;
            background: #ffffff;
            border-radius: 16px;
            margin-bottom: 16px;
            .container-data__title {
              margin-top: 0;
              margin-bottom: 16px;
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
                font-size: 28px;
                line-height: 40px;
                color: #262626;
                margin-right: auto;
              }
              .container-data__title__right {
                margin-left: 16px;
                flex-shrink: 0;
                .button_text {
                  span {
                    font-family: 'DINPro';
                    font-style: normal;
                    font-weight: 400;
                    font-size: 40px;
                    line-height: 40px;
                    /* identical to box height, or 100% */
                    text-align: right;
                    color: #fb2626;
                    &.mini-size {
                      font-size: 20px;
                      text-align: left;
                    }
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
                font-size: 20px;
                line-height: 28px;
                color: #595959;
              }
              div {
                span {
                  padding: 0 16px;
                }
                &:last-child {
                  span {
                    padding: 0 0 0 16px;
                  }
                }
              }
            }
            &.button_end_bg {
              // 结束情况下
              background-image: url('./images/end.png');
              background-size: 118px 118px;
              background-position: right bottom;
              background-repeat: no-repeat;
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
