<template>
  <div class="vh-exam-model-panel">
    <div class="exam-execute-header">
      <!-- 标题栏 -->
      <div class="exam-execute-title" v-if="step != 2">
        <template>
          <div class="exam-execute--time">
            <img src="./images/icon_exam_time.png" class="exam_time__icon" alt="" />
            <div class="exam_time__text" v-if="answerType != 'show'">
              <!-- 答题（答题倒计时） -->
              <template v-if="answerFormat && (answerFormat.hour > 0 || answerFormat.minute > 0)">
                <ul v-if="previewVo && previewVo.limit_time_switch > 0">
                  <li class="exam-css-timer" v-if="answerFormat && answerFormat.hour > 0">
                    {{ answerFormat.hour > 9 ? answerFormat.hour : `0${answerFormat.hour}` }}
                  </li>
                  <li class="exam-css-timer" v-else>00</li>
                  <li class="exam-css-timer">:</li>
                  <li class="exam-css-timer" v-if="answerFormat && answerFormat.minute > 0">
                    {{ answerFormat.minute > 9 ? answerFormat.minute : `0${answerFormat.minute}` }}
                  </li>
                  <li class="exam-css-timer" v-else>00</li>
                </ul>
                <span v-else>不限时</span>
              </template>
              <template v-else><span>加载中</span></template>
            </div>
            <div class="exam_time__text" v-else>
              <!-- 查看结果（答题时间） -->
              <ul v-if="answerFormat && (answerFormat.hour > 0 || answerFormat.minute > 0)">
                <li class="exam-css-timer" v-if="answerFormat && answerFormat.hour > 0">
                  {{ answerFormat.hour > 9 ? answerFormat.hour : `0${answerFormat.hour}` }}
                </li>
                <li class="exam-css-timer" v-else>00</li>
                <li class="exam-css-timer">:</li>
                <li class="exam-css-timer" v-if="answerFormat && answerFormat.minute > 0">
                  {{ answerFormat.minute > 9 ? answerFormat.minute : `0${answerFormat.minute}` }}
                </li>
                <li class="exam-css-timer" v-else>00</li>
              </ul>
            </div>
          </div>
        </template>
        <div class="exam-execute--status" v-if="isLoadingEnd && pageVo && pageVo.total > 0">
          <strong>{{ pageVo.findIndex + 1 }}</strong>
          <span>/{{ pageVo.total }}</span>
        </div>
        <div class="exam-execute--close">
          <img
            src="./images/icon_exam_close.png"
            class="exam_close__icon"
            alt=""
            @click="handleClose"
          />
        </div>
      </div>
      <!-- 进度条 -->
      <el-progress :percentage="percentage" :show-text="false" class="exam-zdy-progress" />
      <!-- 分割条 -->
      <div class="exam-padding-line"></div>
    </div>
    <!-- 内容区域 -->
    <exam-info
      class="exam-execute-body"
      ref="examInfoDom"
      :id="examId.id"
      :answerType="answerType"
      v-if="examId && step != 2"
      :limit="1"
      @change="changeQuestion"
      @examData="previewInfo"
      @examCheckOption="examCheckOption"
      @timerControl="changeTimerIsOpen"
    ></exam-info>
    <!-- 底部 -->
    <div class="exam-execute-footer" v-if="step != 2">
      <el-button
        type="default"
        size="medium"
        plain
        round
        @click="lastQuestion"
        v-if="pageVo && !pageVo.isFirst"
        class="gray--button"
      >
        上一题
      </el-button>
      <el-button
        type="primary"
        size="medium"
        round
        @click="nextQuestion"
        v-if="pageVo && !pageVo.isEnd"
        :disabled="isDisabledSave"
      >
        下一题
      </el-button>
      <el-button
        type="primary"
        size="medium"
        round
        @click="submit"
        v-if="pageVo && pageVo.isEnd && answerType != 'show'"
        :disabled="isDisabledSave"
      >
        提交
      </el-button>
    </div>
    <!-- 查看答案 -->
    <exam-result
      ref="examResultDom"
      :id="examId"
      :limit="2"
      v-if="examId && step == 2"
      @model="showExamResultInfo"
    ></exam-result>
  </div>
</template>
<script>
  import ExamInfo from './components/exam-info.vue';
  import ExamResult from './components/exam-result.vue';
  export default {
    name: 'VmpExamCore',
    components: {
      ExamInfo,
      ExamResult
    },
    data() {
      return {
        examId: null,
        answerType: 'show',
        pageVo: {
          total: 0
        },
        step: 1, // 当前步骤（1--填写步骤；2--得知答案步骤；3--查看填写结果）
        previewVo: null,
        answerTimer: null, // 倒计时-定时器
        answerTimeNum: 0, // 倒计时的时间（单位：时间转换为秒）
        answerFormat: {
          day: 0, // 天
          hour: 0, // 时
          minute: 0, // 分
          second: 0, // 秒
          hourCycle: 0 // 毫秒
        },
        timeLoaded: false, // 时间未查询出结果
        isDisabledSave: true
      };
    },
    computed: {
      percentage() {
        if (this.pageVo && this.pageVo.total > 0) {
          return (
            (Number((this.pageVo?.findIndex || 0) + 1) / Number(this.pageVo?.total || 0)) * 100
          );
        } else {
          return 0;
        }
      },
      isLoadingEnd() {
        // 是否获取到加载所需要的数据
        return this.previewVo != null && this.pageVo && this.pageVo.total > 0;
      }
    },
    methods: {
      async open(examId, answerType) {
        if (!examId) return;
        this.examId = examId;
        this.answerType = answerType || 'show';
        this.step = 1;
        // 每次打开重置计时器 - 启动时间为数据拿取完毕
        this.changeTimerIsOpen(false);
        this.$nextTick(() => {
          // 初始化预览页效果
          this.$refs.examInfoDom && this.$refs.examInfoDom.initComp();
        });
      },
      async nextQuestion() {
        await this.$nextTick(() => {});
        this.$refs.examInfoDom && this.$refs.examInfoDom.nextQuestion();
      },
      async lastQuestion() {
        await this.$nextTick(() => {});
        this.$refs.examInfoDom && this.$refs.examInfoDom.lastQuestion();
      },
      // 题目变更
      changeQuestion(vo) {
        this.pageVo = vo;
      },
      // 提交记录后，展示下一个面板
      submit() {
        // 提交的时候，停止答题倒计时
        this.changeTimerIsOpen(false);
        this.step = 2;
      },
      // 查看答案
      async showExamResultInfo() {
        this.answerType = 'show';
        this.$forceUpdate();
        this.step = 3;
        // 初始化预览页效果
        this.$nextTick(() => {
          this.$refs.examInfoDom && this.$refs.examInfoDom.initComp();
        });
      },
      // 关闭弹窗
      handleClose() {
        this.changeTimerIsOpen(false);
        this.step = 1;
        this.$emit('close');
      },
      // 快问快答详情
      previewInfo(previewInfo) {
        this.previewVo = previewInfo;
        this.answerTimeNum =
          this.answerType == 'show' ? previewInfo.number_second : previewInfo.limit_time_second; // 倒计时（数值单位秒）
        this.changeTimerIsOpen(this.answerType == 'show' ? false : true);
      },
      // 是否允许执行答题
      examCheckOption(status) {
        this.isDisabledSave = status;
      },
      // 计时器控制
      changeTimerIsOpen(isOpen = false) {
        if (isOpen) {
          // 开启计时器
          this.executeInterval();
        } else {
          // 关闭计时器
          this.initInterval();
        }
      },
      // 倒计时 -- 初始化
      initInterval() {
        clearInterval(this.answerTimer);
        this.answerTimer = null;
        this.answerTimeNum =
          this.answerType == 'show'
            ? this.previewVo?.number_second || 0
            : this.previewVo?.limit_time_second || 0;
        this.answerFormat = {
          day: 0, // 天
          hour: 0, // 时
          minute: 0, // 分
          second: 0, // 秒
          hourCycle: 0 // 毫秒
        };
      },
      // 倒计时 -- 换算
      computeAnswerTime() {
        let timer = this.answerTimeNum;
        let hour = Math.floor(timer / 60);
        let minute = timer - hour * 60;
        this.answerFormat.hour = hour;
        this.answerFormat.minute = minute;
      },
      // 倒计时 -- 执行
      executeInterval() {
        this.initInterval();
        this.answerTimer = setInterval(() => {
          this.answerTimeNum--;
          if (this.answerTimeNum > 0) {
            this.computeAnswerTime();
          }
          if (this.answerTimeNum === 0) {
            // 倒计时一停止，直接关闭弹窗
            this.handleClose();
          }
        }, 1000);
      }
    },
    beforeDestroy() {
      this.initInterval();
    }
  };
</script>
<style lang="less">
  .vh-exam-model-panel {
    width: 100%;
    .exam-execute-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px 0 16px 0;
      line-height: 8px;
    }
    .exam-execute--time {
      text-align: center;
      .exam_time__icon {
        width: 17.2px;
        height: 9.2px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .exam_time__text {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 1;
        color: #000000;
        margin-top: 2px;
        ul {
          li {
            display: inline-block;
            vertical-align: middle;
          }
        }
        .exam-css-timer {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 500;
          font-size: 10px;
          line-height: 8px;
          transform: scale(0.8);
        }
      }
    }
    .exam-execute--status {
      margin-left: auto;
      span,
      strong {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 17px;
        color: #000000;
      }
    }
    .exam-execute--close {
      margin-left: 16px;
      width: 12px;
      height: 12px;
      line-height: 12px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .exam-padding-line {
      width: 100%;
      height: 2px;
      margin-top: 18px;
      background: unset;
    }
  }
  .exam-execute-header {
    width: 100%;
    // height: 63px;
    .exam-execute-title,
    .exam-zdy-progress {
      margin: 0 32px;
    }
  }
  .exam-execute-body {
    height: 337px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0 32px;
  }
  .exam-execute-footer {
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 20;
    text-align: center;
    padding: 12px 32px 24px 32px;
    background: #ffffff;
    width: 100%;
    button + button {
      margin-left: 12px;
    }
  }
  /* 会被重置的样式 */
  .exam-zdy-progress {
    .el-progress-bar__outer {
      background: rgba(0, 0, 0, 0.06);
      background-color: rgba(0, 0, 0, 0.06);
      border-radius: 4px;
      .el-progress-bar__inner {
        background: rgba(251, 38, 38, 1);
        background-color: rgba(251, 38, 38, 1);
        border-radius: 3px;
      }
    }
  }
</style>
