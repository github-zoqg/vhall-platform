<template>
  <!-- 快问快答-答题-->
  <van-popup
    get-container="#otherPopupContainer"
    class="vmp-exam-answer-wap"
    v-model="examAnswerVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examAnswerVisible"
  >
    <div :class="`exam-core__container exam-theme--${theme}`">
      <i class="vh-iconfont vh-line-close exam-close" @click="closeDialog"></i>
      <div id="examAnswerWap" v-show="isFill"></div>
      <div id="userFormWap" v-show="!isFill"></div>
    </div>
  </van-popup>
</template>
<script>
  import { useExamServer } from 'middle-domain';
  export default {
    name: 'VmpExamWap',
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
        this.ExamInstance = this.examServer.ExamInstance;
        // 答题前置检查
        await this.examServer.checkExam();
        this.examAnswerVisible = true;
        await this.$nextTick();
        if (this.examServer?.state?.userCheckVo?.is_fill == 1) {
          // 需要填写表单
          this.ExamInstance.mount({ id: examId, el: '#userFormWap', type: 'wap', props: {} });
        } else if (this.examServer?.state?.userCheckVo?.is_answer == 1) {
          // 已答题，查看个人成绩单结果（可以点击去查看答题结果）
        } else {
          // 未答题，直接答题
          this.ExamInstance.mount({ id: examId, el: '#examAnswerWap', type: 'wap', props: {} });
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
  .vmp-exam-answer-wap {
    width: 100%;
    height: 844px;
    background: url('../images/bg_default.png') no-repeat;
    box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
    border-radius: 40px 40px 0px 0px;
    overflow: hidden;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    .exam-execute-body {
      height: calc(844px - 100px) !important;
      max-height: calc(844px - 100px) !important;
    }
    .exam-core__container {
      width: 100%;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
      // 统一定位close
      .exam-close {
        position: absolute;
        right: 32px;
        top: 48px;
        font-size: 24px;
        z-index: 30;
        cursor: pointer;
      }
    }
    .exam-zdy-progress {
      &.van-progress {
        background: var(--theme-exam-progress-bgColor) !important;
        border-radius: 4px;
        .van-progress__portion {
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
    .exam-execute-footer {
      button.van-button--danger {
        background: var(--theme-exam-next-button-bg) !important ;
        color: var(--theme-exam-next-button-color) !important ;
        border: 1px solid var(--theme-exam-next-button-border) !important;
        &:hover,
        &.active {
          background: var(--theme-exam-next-button-active-bg) !important ;
          color: var(--theme-exam-next-button-active-color) !important ;
          border: 1px solid var(--theme-exam-next-button-active-border) !important;
        }
      }
      button.van-button--default {
        background: var(--theme-exam-last-button-bg) !important ;
        color: var(--theme-exam-last-button-color) !important ;
        border: 1px solid var(--theme-exam-last-button-border) !important;
        &:hover,
        &.active {
          background: var(--theme-exam-last-button-active-bg) !important ;
          color: var(--theme-exam-last-button-active-color) !important ;
          border: 1px solid var(--theme-exam-last-button-active-border) !important;
        }
      }
    }
  }
</style>
