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
      <vmp-exam-core ref="vmpExamCoreDom" @close="closeDialog"></vmp-exam-core>
    </div>
  </van-popup>
</template>
<script>
  export default {
    name: 'VmpExamAnswerWap',
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

        await this.$nextTick(() => {});
        this.$refs.vmpExamCoreDom && this.$refs.vmpExamCoreDom.open(examId, 'release');
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less">
  .vmp-exam-answer-wap {
    width: 100%;
    height: 844px;
    background: url('../images/gradient_bg.png') repeat-x;
    background-size: cover;
    box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
    border-radius: 40px 40px 0px 0px;
    overflow: hidden;
    .exam-core__container {
      width: calc(100% - 64px);
      margin: 0 auto;
      overflow: hidden;
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
