<template>
  <el-dialog :visible.sync="dialogVisible" class="exam-preview-pc" width="1088px">
    <!-- 标题栏 -->
    <div slot="title" class="exam-execute-title" v-if="isDialogOpen && step != 2">
      <template v-if="answerType != 'show'">
        <div class="exam-execute--left">
          <i class="vh-iconfont vh-line-arrow-left title-icon"></i>
          <span>不限时</span>
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
      >
        下一题
      </el-button>
      <el-button
        type="primary"
        size="medium"
        round
        @click="submit"
        v-if="pageVo && pageVo.isEnd && answerType != 'show'"
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
        step: 1 // 当前步骤（1--填写步骤；2--得知答案步骤；3--查看填写结果）
      };
    },
    methods: {
      openPreview(str, answerType) {
        if (!str) return;
        this.dialogVisible = true; // 展示弹出框
        this.currentRow = JSON.parse(str) || null;
        this.answerType = answerType;
        this.step = 1;
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
      close() {
        this.dialogVisible = false; // 关闭弹出框
        this.step = 1;
      }
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
  }
  .exam-execute-footer {
    text-align: center;
  }
</style>
