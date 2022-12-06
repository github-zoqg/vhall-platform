<template>
  <div>
    <vh-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="380px"
      draggable
      modal
      class="vmp-exam-prev-live"
      custom-class="vmp-exam-prev-live-dialog"
      append-to-body
    >
      <div class="vh-dialog-title" slot="title"></div>
      <div v-if="dialogVisible" class="content webkit-scrollbar">
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
    .vmp-exam-prev-live-dialog {
      min-height: 287px;
      background: url('../img/dialog-watch-bg.png') no-repeat;
      border-radius: 12px;
      background-color: #fff;
      background-position: top;
      background-size: cover;
      // 重置内部元素
      .exam-execute-body {
        height: calc(460px - 113px) !important;
        max-height: calc(460px - 113px) !important;
        margin-right: 2px;
      }
    }
    .vh-dialog__header {
      position: absolute;
      right: 0;
      top: 0;
      left: 0;
      z-index: 2;
    }
    .content {
      padding-top: 25px !important;
      // height: 465px;
      overflow-y: auto;
      &::-webkit-scrollbar-track-piece {
        opacity: 0;
      }

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #ccc;
        background-clip: padding-box;
        border-radius: 3px;
      }
    }
    .vh-dialog__body {
      padding: 0 !important;
    }
    .vmp-transcripts {
      &.vmp-transcripts-other {
        // 百分比 or 正确率
        height: 409px;
        padding-top: 27px;
        button.vh-button--primary {
          margin: 57px auto 64px auto;
        }
      }
      &.vmp-transcripts-extreme {
        // 满分 or 0分
        button.vh-button--primary {
          margin: 24px auto 24px auto;
        }
        .trophy-wrap {
          margin-top: 30px;
        }
      }
    }
  }
</style>
