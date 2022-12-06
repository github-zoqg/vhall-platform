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
      <!-- 图片预览区域 -->
      <img-preview
        ref="imgPreview"
        v-if="imgPreviewVisible"
        :images="previewImgList"
        :zIndex="previewImgIndex"
        @closeImgPreview="onClosePreviewImg"
      ></img-preview>
    </vh-dialog>
  </div>
</template>
<script>
  import ImgPreview from '@/packages/img-preview-pc/main.vue';
  import { cl_previewImg } from '@/app-shared/client/client-methods.js';
  export default {
    name: 'ExamPrev',
    inject: ['examServer'],
    components: {
      ImgPreview
    },
    data() {
      return {
        dialogVisible: false,
        prevExamId: '',
        title: '',
        previewImgList: [], // 预览图片集合
        imgPreviewVisible: false, // 是否打开预览图片弹窗
        previewImgIndex: 2003
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
            answerType: '1',
            preview: true
          }
        });
        this.examServer.examInstance.$on('PREVIEW', this.previewImg);
      },
      /**
       * 聊天图片预览
       * */
      // 预览聊天图片
      previewImg(...args) {
        // //处理掉图片携带的查询参数，只保留主要链接
        this.previewImgList = args[1] || [];
        if (this.$route.query.assistantType) {
          cl_previewImg({ list: this.previewImgList, index: args[0] });
          return;
        }
        this.imgPreviewVisible = true;
        this.$nextTick(() => {
          let dialogIndex = document.querySelector('.vmp-exam-prev-live').style?.zIndex || 2003;
          console.log('当前层级', this.previewImgIndex);
          this.previewImgIndex = Number(dialogIndex) + 4;
          this.$refs.imgPreview.jumpToTargetImg(args[0]);
        });
      },
      //关闭预览图片弹窗之后的处理
      onClosePreviewImg() {
        this.imgPreviewVisible = false;
      }
    },
    beforeDestroy() {
      this.examServer?.examInstance?.$off('PREVIEW');
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
