<template>
  <div class="icon-wrap" v-if="showIcon" @click="checkRedPacketIcon">
    <img src="./images/questionnaire.png" alt="" />
    <i class="dot" v-if="showDot" />
  </div>
</template>
<script>
  export default {
    name: 'QuestionnaireIcon',
    data() {
      return {
        showIcon: true,
        showDot: true
      };
    },
    methods: {
      checkRedPacketIcon() {}
    }
  };
</script>
