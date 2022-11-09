<template>
  <div class="vh-exam-model-panel">
    <!-- 标题栏 -->
    <div class="exam-execute-title" v-if="step != 2">
      <template v-if="answerType != 'show'">
        <div class="exam-execute--time">
          <img src="./images/icon_exam_time.png" class="exam_time__icon" alt="" />
          <div class="exam_time__text">
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
        </div>
      </template>
      <div class="exam-execute--status" v-if="pageVo && pageVo.total > 0">
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
    <van-progress :percentage="percentage" :show-pivot="false" class="exam-zdy-progress" />
    <!-- 内容区域 -->
    <exam-info
      ref="examInfoDom"
      :id="examId.id"
      :answerType="answerType"
      :limit="2"
      v-if="examId && step != 2"
      @change="changeQuestion"
      @examData="previewInfo"
      @examCheckOption="examCheckOption"
    ></exam-info>
    <!-- 底部 -->
    <div class="exam-execute-footer" v-if="step != 2">
      <van-button
        type="default"
        size="medium"
        round
        @click="lastQuestion"
        v-if="pageVo && !pageVo.isFirst"
      >
        上一题
      </van-button>
      <van-button
        type="danger"
        size="medium"
        round
        @click="nextQuestion"
        v-if="pageVo && !pageVo.isEnd"
        :disabled="isDisabledSave"
      >
        下一题
      </van-button>
      <van-button
        type="danger"
        size="medium"
        round
        @click="submit"
        v-if="pageVo && pageVo.isEnd && answerType != 'show'"
        :disabled="isDisabledSave"
      >
        提交
      </van-button>
      <van-button
        type="primary"
        size="medium"
        round
        @click="close"
        v-if="pageVo && pageVo.isEnd && answerType == 'show'"
      >
        关闭
      </van-button>
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
          total: 0,
          findIndex: 0
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
    props: {
      // 界面最大宽度
      maxWidth: {
        required: false,
        type: String,
        default: '1088px'
      },
      // 界面最大宽度
      maxHeight: {
        required: false,
        type: String,
        default: '500px'
      }
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
      maxSonWidth() {
        let maxWidthNum = this.maxWidth.substring(0, this.maxWidth.length - 2);
        return `${Number(maxWidthNum) - 64}px`;
      },
      maxSonHeight() {
        let maxHeightNum = this.maxHeight.substring(0, this.maxHeight.length - 2);
        return `${Number(maxHeightNum) - 100}px`;
      }
    },
    methods: {
      async open(examId, answerType) {
        if (!examId) return;
        this.examId = examId;
        this.answerType = answerType || 'show';
        this.step = 1;
        this.timeLoaded = false;
        await this.$nextTick(() => {});
        // 初始化预览页效果
        this.$refs.examInfoDom && this.$refs.examInfoDom.initComp();
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
        this.step = 2;
      },
      // 查看答案
      async showExamResultInfo() {
        this.answerType = 'show';
        this.step = 3;
        // 初始化预览页效果
        await this.$nextTick(() => {});
        this.$refs.examInfoDom && this.$refs.examInfoDom.initComp();
      },
      // 关闭弹窗
      handleClose() {
        this.timeLoaded = false;
        this.initInterval();
        this.step = 1;
        this.$emit('close');
      },
      // 快问快答详情
      previewInfo(previewInfo) {
        this.previewVo = previewInfo;
        this.answerTimeNum = previewInfo.limit_time_second; // 倒计时（数值单位秒）
        this.timeLoaded = true;
        this.executeInterval();
      },
      // 是否允许执行答题
      examCheckOption(status) {
        this.isDisabledSave = status;
      },
      // 倒计时 -- 初始化
      initInterval() {
        clearInterval(this.answerTimer);
        this.answerTimer = null;
        this.answerTimeNum = this.previewVo?.limit_time_second || 0;
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
        console.log(`${hour}时${minute}分钟`);
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
            // 如果是mock模拟的时候，倒计时一停止，直接关闭弹窗
            if (this.answerType == 'mock' && this.timeLoaded) {
              this.handleClose();
            } else {
              this.initInterval();
            }
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
    }
    .exam-execute--time {
      text-align: center;
      .exam_time__icon {
        width: 32px;
        height: 16px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .exam_time__text {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-size: 22px;
        line-height: 27px;
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
          font-size: 22px;
          line-height: 27px;
          color: #000000;
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
        font-size: 28px;
        line-height: 34px;
        color: #000000;
      }
    }
    .exam-execute--close {
      margin-left: 32px;
      width: 28px;
      height: 28px;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .exam-execute-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    text-align: center;
    background: #ffffff;
    padding: 24px 32px;
    z-index: 20;
    width: 100%;
    button {
      padding: 22px 102px;
    }
    button + button {
      margin-left: 24px;
    }
  }
  /* 会被重置的样式 */
  .exam-zdy-progress {
    &.van-progress {
      background: rgba(0, 0, 0, 0.06);
      border-radius: 4px;
      .van-progress__portion {
        background: rgba(251, 38, 38, 1);
        border-radius: 3px;
      }
    }
  }
</style>
