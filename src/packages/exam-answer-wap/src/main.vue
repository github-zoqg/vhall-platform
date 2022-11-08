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
    <div class="vmp-exam-answer-wap__panel">答题</div>
  </van-popup>
</template>
<script>
  export default {
    name: 'VmpExamAnswerWap',
    data() {
      return {
        examAnswerVisible: false, // 快问快答 - 答题
        examItem: null
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    methods: {
      // 关闭 快问快答 - 答题
      closeDialog() {
        this.examAnswerVisible = false;
      },
      async open(item) {
        this.examAnswerVisible = true;
        this.examItem = item;
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less" scoped>
  .vmp-exam-answer-wap {
    height: 844px;
    background: transparent;
    background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
    border-radius: 40px 40px 0px 0px;
    &__panel {
      text-align: center;
    }
  }
</style>
