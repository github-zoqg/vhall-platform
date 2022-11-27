<template>
  <div class="vmp-exam-prev-live">
    <vh-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :title="title"
      width="380px"
      draggable
      :modal="false"
    >
      <div v-if="dialogVisible">
        <div ref="ExamPrev"></div>
      </div>
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
    .vh-dialog__body {
      padding: 0;
    }
  }
</style>
