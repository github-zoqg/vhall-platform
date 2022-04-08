<template>
  <div class="vmp-questionnaire-icon" v-if="questionnaireServerState.iconVisible">
    <img src="./images/questionnaire.png" alt="" @click="checkQuestionnaireIcon" />
    <i class="vmp-dot" v-if="questionnaireServerState.dotVisible" />
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useQuestionnaireServer } from 'middle-domain';
  export default {
    name: 'QuestionnaireIcon',
    data() {
      const questionnaireServerState = this.questionnaireServer.state;
      return {
        questionnaireServerState
      };
    },
    beforeCreate() {
      this.questionnaireServer = useQuestionnaireServer({
        mode: 'watch'
      });
    },
    created() {
      this.questionnaireServer.checkIconStatus();
    },
    methods: {
      checkQuestionnaireIcon() {
        this.$emit('clickIcon', this.questionnaireServerState.lastQuestionnaireId);
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-questionnaire-icon {
    color: #fff;
    position: relative;
    .vmp-dot {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      right: -3px;
      position: absolute;
    }
    img {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
  }
</style>
