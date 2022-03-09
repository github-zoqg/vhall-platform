<template>
  <div class="vmp-red-packet-icon" v-if="showIcon" @click="checkquestionIcon">
    <img src="./images/question.png" alt="" />
    <i class="vmp-dot" v-if="showDot" />
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useQuestionnaireServer } from 'middle-domain';
  const QUESTIONNAIRE_PUSH = 'questionnaire_push'; // 支付成功消息
  export default {
    name: 'QuestionIcon',
    data() {
      return {
        showIcon: false, //显示图标
        showDot: false, // 显示小红点
        lastUUID: ''
      };
    },
    beforeCreate() {
      this.questionServer = useQuestionnaireServer({
        mode: 'watch'
      });
    },
    created() {
      // this.initStatus();
      this.questionServer.$on(QUESTIONNAIRE_PUSH, this.handleNewquestion);
    },
    destroyed() {
      this.questionServer.$off(QUESTIONNAIRE_PUSH, this.handleNewquestion);
    },
    methods: {
      initStatus() {
        // const questionInfo = this.$domainStore.state.roomBaseServer;
        // console.log(questionInfo, 'questionInfo');
      },
      checkquestionIcon() {
        this.$emit('clickIcon', this.lastUUID);
        this.showDot = false;
      },
      handleNewquestion(msg) {
        this.lastUUID = msg.questionnaire_id;
        this.showIcon = true;
        this.showDot = true;
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-red-packet-icon {
    color: #fff;
    margin-left: 16px;
    position: relative;
    .vmp-dot {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      top: 10px;
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
