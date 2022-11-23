<template>
  <!-- 快问快答-pc答题-->
  <vh-dialog
    title=""
    :visible.sync="examAnswerVisible"
    width="380px"
    custom-class="vmp-exam-answer"
    :close-on-click-modal="false"
    :show-close="false"
    :z-index="20"
  >
    <div :class="`exam-core__container exam-theme--${theme}`">
      <i class="vh-iconfont vh-line-close exam-close" @click="closeDialog"></i>
      <div id="examAnswer" v-show="isFill"></div>
      <div id="userForm" v-show="!isFill"></div>
    </div>
  </vh-dialog>
</template>
<script>
  import { useExamServer } from 'middle-domain';
  export default {
    name: 'VmpExamPc',
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
      },
      isFill() {
        return this.examServer?.state?.userCheckVo?.isFill == 1;
      }
    },
    methods: {
      // 关闭 快问快答 - 答题
      closeDialog() {
        this.examAnswerVisible = false;
      },
      async open(examId) {
        this.examId = examId;
        // 答题前置检查
        await this.examServer.checkExam();
        this.examAnswerVisible = true;
        await this.$nextTick();
        if (this.examServer?.state?.userCheckVo?.is_fill == 1) {
          // 需要填写表单
          this.examServer.mount({ examId, el: '#userForm', components: 'pc' });
        } else if (this.examServer?.state?.userCheckVo?.is_answer == 1) {
          // 已答题，查看个人成绩单结果（可以点击去查看答题结果）
        } else {
          // 未答题，直接答题
          this.examServer.mount({
            examId: 17 || examId,
            el: '#examAnswer',
            componentName: 'exampc',
            configs: {
              role: 2,
              pageSize: 1,
              answerType: 'release'
            }
          });
        }
      }
    },
    created() {
      this.examServer = useExamServer();
    },
    beforeCreate() {}
  };
</script>
<style lang="less">
  .vh-dialog.vmp-exam-answer {
    .vh-dialog__header {
      padding: 0 0;
    }
    .vh-dialog__body {
      padding: 0 0;
    }
    height: 460px;
    background: url('../images/bg_default.png') no-repeat;
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    // 重置内部元素
    .exam-execute-body {
      height: calc(460px - 72px) !important;
      max-height: calc(460px - 72px) !important;
    }
    .exam-core__container {
      width: 100%;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
      // 统一定位close
      .exam-close {
        position: absolute;
        right: 32px;
        top: 22px;
        font-size: 12px;
        z-index: 30;
        cursor: pointer;
      }
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
