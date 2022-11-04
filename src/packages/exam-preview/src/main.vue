<template>
  <el-dialog
    :visible.sync="dialogVisible"
    class="exam-preview-pc"
    width="1088px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 标题栏 -->
    <div slot="title" class="exam-execute-title" v-if="isDialogOpen && step != 2">
      <template v-if="answerType != 'show'">
        <div class="exam-execute--left">
          <i class="vh-iconfont vh-line-arrow-left title-icon"></i>
          <template v-if="answerFormat && (answerFormat.hour > 0 || answerFormat.minute > 0)">
            <ul v-if="previewVo && previewVo.limit_time_switch > 0">
              <li class="exam-css-text">剩余时间：</li>
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
      </template>
      <div class="exam-execute--right" v-if="pageVo && pageVo.total > 0">
        <i class="vh-iconfont vh-line-arrow-left title-icon"></i>
        <span>{{ answerType != 'show' ? '正在作答' : '正在查看' }}</span>
        <span>
          <strong>{{ pageVo.findIndex + 1 }}</strong>
          /{{ pageVo.total }}
        </span>
      </div>
    </div>
    <!-- 内容区域 -->
    <exam-info
      ref="examInfoDom"
      :id="currentRow.id"
      :answerType="answerType"
      :limit="2"
      v-if="currentRow && step != 2"
      @change="changeQuestion"
      @examData="previewInfo"
      @examCheckOption="examCheckOption"
    ></exam-info>
    <!-- 底部 -->
    <div slot="footer" class="exam-execute-footer" v-if="isDialogOpen && step != 2">
      <el-button
        type="default"
        size="medium"
        round
        @click="lastQuestion"
        v-if="pageVo && !pageVo.isFirst"
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
      <el-button
        type="primary"
        size="medium"
        round
        @click="close"
        v-if="pageVo && pageVo.isEnd && answerType == 'show'"
      >
        关闭
      </el-button>
    </div>
    <!-- 查看答案 -->
    <exam-result
      ref="examResultDom"
      :id="currentRow.id"
      :limit="2"
      v-if="currentRow && step == 2"
      @model="showExamResultInfo"
    ></exam-result>
  </el-dialog>
</template>
<script>
  import ExamInfo from './components/exam-info.vue';
  import ExamResult from './components/exam-result.vue';
  export default {
    name: 'VmpExamPreview',
    components: {
      ExamInfo,
      ExamResult
    },
    data() {
      return {
        currentRow: null,
        dialogVisible: false,
        answerType: 'show',
        isDialogOpen: true, // 是否弹出框形式打开
        pageVo: {
          total: 0,
          findIndex: 0
        },
        step: 1, // 当前步骤（1--填写步骤；2--得知答案步骤；3--查看填写结果）
        previewVo: null,
        answerTimer: null, // 倒计时-定时器
        answerTimeNum: 0, // 倒计时的时间（单位：分钟）
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
      openPreview(str, answerType) {
        if (!str) return;
        this.dialogVisible = true; // 展示弹出框
        this.currentRow = JSON.parse(str) || null;
        this.answerType = answerType || 'show';
        this.step = 1;
        this.timeLoaded = false;
        // 初始化预览页效果
        this.$refs.examInfoDom && this.$refs.examInfoDom.initComp();
      },
      nextQuestion() {
        this.$refs.examInfoDom && this.$refs.examInfoDom.nextQuestion();
      },
      lastQuestion() {
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
      showExamResultInfo() {
        this.answerType = 'show';
        this.step = 3;
        // 初始化预览页效果
        this.$refs.examInfoDom && this.$refs.examInfoDom.initComp();
      },
      // 关闭弹窗
      handleClose() {
        this.timeLoaded = false;
        this.initInterval();
        this.step = 1;
        this.dialogVisible = false; // 关闭弹出框
      }, // 快问快答详情
      previewInfo(previewInfo) {
        this.previewVo = previewInfo;
        this.answerTimeNum = previewInfo.limit_time; // 倒计时（数值单位分钟）
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
        this.answerTimeNum = this.previewVo?.limit_time || 0;
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
  /* 弹出框头部or底部 */
  .exam-execute-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .exam-execute--right {
      margin-right: 40px;
    }
    .exam-execute--left {
      ul {
        li {
          display: inline-block;
          vertical-align: middle;
          .exam-css-text {
            margin-right: 8px;
          }
          .exam-css-timer {
            color: #fb3a32;
          }
        }
      }
    }
  }
  .exam-execute-footer {
    text-align: center;
  }
</style>
