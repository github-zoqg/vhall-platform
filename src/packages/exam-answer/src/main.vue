<template>
  <!-- 快问快答-答题-->
  <el-dialog
    title=""
    :visible.sync="examAnswerVisible"
    width="380px"
    custom-class="vmp-exam-answer"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div :class="`exam-core__container exam-theme--${theme}`">
      <div id="examanswer"></div>
    </div>
  </el-dialog>
</template>
<script>
  import { useExamServer } from 'middle-domain';
  export default {
    name: 'VmpExamAnswer',
    data() {
      return {
        examAnswerVisible: false, // 快问快答 - 答题
        examId: null
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      theme() {
        const themeMap = {
          1: 'black',
          2: 'white',
          3: 'red',
          4: 'golden',
          5: 'blue'
        };
        let skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        let skin_json_wap = {};
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return themeMap[skin_json_wap?.backGroundColor || 3];
      }
    },
    methods: {
      // 关闭 快问快答 - 答题
      closeDialog() {
        this.examAnswerVisible = false;
      },
      async open(examId) {
        this.examAnswerVisible = true;
        this.examId = examId;
        this.ExamInstance = useExamServer().examInstance;
        await this.$nextTick();
        this.ExamInstance.mount({
          examId: examId,
          el: '#examanswer',
          componentName: 'exampc',
          config: { pageSize: 1 }
        });
        // await this.$nextTick(() => {});
        // this.$refs.vmpExamCoreDom && this.$refs.vmpExamCoreDom.open(examId, 'release');
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less">
  .el-dialog.vmp-exam-answer {
    .el-dialog__header {
      padding: 0 0;
    }
    .el-dialog__body {
      padding: 0 0;
    }
    height: 460px;
    background: url('../images/bg_default.png') no-repeat;
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    .exam-core__container {
      width: 100%;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
    }
    .exam-zdy-progress {
      &.el-progress {
        background: var(--theme-exam-progress-bgColor) !important;
        border-radius: 4px;
        .el-progress__portion {
          background: var(--theme-exam-progress-active-bgColor) !important;
          border-radius: 3px;
        }
      }
    }
    .vmp-exam-info--question {
      .zdy-exam-question-type {
        background: var(--theme-exam-question-type-bgColor) !important;
        color: var(--theme-exam-question-type-color) !important;
      }
    }
    // .exam-execute-footer {
    //   button.el-button--primary {
    //     background: var(--theme-exam-next-button-bg) !important ;
    //     color: var(--theme-exam-next-button-color) !important ;
    //     border: 1px solid var(--theme-exam-next-button-border) !important;
    //     &:hover,
    //     &.active {
    //       background: var(--theme-exam-next-button-active-bg) !important ;
    //       color: var(--theme-exam-next-button-active-color) !important ;
    //       border: 1px solid var(--theme-exam-next-button-active-border) !important;
    //     }
    //   }
    //   button.el-button--default {
    //     background: var(--theme-exam-last-button-bg) !important ;
    //     color: var(--theme-exam-last-button-color) !important ;
    //     border: 1px solid var(--theme-exam-last-button-border) !important;
    //     &:hover,
    //     &.active {
    //       background: var(--theme-exam-last-button-active-bg) !important ;
    //       color: var(--theme-exam-last-button-active-color) !important ;
    //       border: 1px solid var(--theme-exam-last-button-active-border) !important;
    //     }
    //   }
    // }
  }
</style>
