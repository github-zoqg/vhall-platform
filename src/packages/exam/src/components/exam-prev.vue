<template>
  <div class="vmp-exam-prev-live">
    <vh-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :title="title"
      width="380px"
      draggable
      :modal="false"
      custom-class="vmp-exam-prev-live-dialog"
      v-if="dialogVisible"
    >
      <div ref="ExamPrev"></div>
    </vh-dialog>
  </div>
</template>
<script>
  export default {
    name: 'ExamPrev',
    inject: ['examServer'],
    data() {
      return {
        dialogVisible: false,
        prevExamId: '',
        title: ''
      };
    },
    mounted() {
      // this.initComp();
    },
    methods: {
      open(examId, examTitle = '') {
        this.title = examTitle;
        this.prevExamId = examId;
        this.dialogVisible = true;
        this.$nextTick(() => {
          this.initComp();
        });
      },
      initComp() {
        const el = this.$refs.ExamPrev;
        this.examServer.mount({
          examId: this.prevExamId,
          el,
          componentName: 'exampc',
          configs: {
            role: 1,
            pageSize: 1,
            answerType: '1'
          }
        });
      }
    }
  };
</script>
.
<style lang="less">
  .vmp-exam-prev-live {
    .vmp-exam-prev-live-dialog {
      height: 468px;
      background: #ffffff;
      background: url('../img/dialog-watch-bg.png') no-repeat;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05), 0px 8px 16px rgba(51, 51, 51, 0.24);
      border-radius: 12px;
      background-color: #ffffff;
      background-position: top;
      background-size: cover;
      border-radius: 12px;
      overflow: hidden;
      .vh-dialog__title {
        width: 280px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
      }
      .vh-dialog__body {
        padding: 0 0;
        height: calc(100% - 77.5px);
      }
      .exam-execute-body {
        height: calc(100% - 113px);
        max-height: calc(100% - 113px);
        overflow: auto;
        padding: 0 0;
        overflow-x: hidden;
        overflow-y: auto;
        padding: 0 32px;
        margin-right: 2px;
      }
    }
  }
</style>
