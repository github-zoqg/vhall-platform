<template>
  <div class="icon-wrap" v-if="questionnaireServerState.iconVisible">
    <img src="./images/questionnaire.png" alt="" @click="clickQuestionnaireIcon" />
    <i class="dot" v-if="questionnaireServerState.dotVisible" />
  </div>
</template>
<script>
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
    methods: {
      clickQuestionnaireIcon() {
        this.$emit('clickIcon', this.questionnaireServerState.lastQuestionnaireId);
      }
    }
  };
</script>

<style lang="less" scoped>
  .icon-wrap {
    margin-bottom: 10px;
    width: 84px;
    height: 84px;
    position: relative;
    background-color: transparent;
    img {
      width: 84px;
      height: 84px;
    }
    .dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #ff0005;
      content: '';
    }
  }
</style>
