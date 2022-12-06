<template>
  <!-- 快问快答-答题-->
  <van-popup
    get-container="body"
    class="vmp-exam-answer-wap"
    v-model="examAnswerVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examAnswerVisible"
  >
    <div :class="`exam-core__container exam-theme--${theme}`">
      <div id="examAnswerWap"></div>
    </div>
  </van-popup>
</template>
<script>
  import { useExamServer } from 'middle-domain';
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
        this.ExamInstance = useExamServer().ExamInstance;
        await this.$nextTick();
        this.ExamInstance.mount({ id: examId, el: '#examAnswerWap', type: 'wap', props: {} });
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less">
  .vmp-exam-answer-wap {
    width: 100%;
    height: 844px;
    padding-bottom: constant(safe-area-inset-bottom); /* 兼容IOS<11.2 */
    padding-bottom: env(safe-area-inset-bottom); /* 兼容IOS>11.2 */
    background: url('../images/bg_default.png') no-repeat;
    box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
    border-radius: 40px 40px 0px 0px;
    overflow: hidden;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    .exam-core__container {
      width: 100%;
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
  }
</style>
