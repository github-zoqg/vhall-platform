<template>
  <!-- 快问快答-成绩结果 -->
  <vh-dialog title="" :visible.sync="examScoreVisible" width="500px" custom-class="vmp-exam-score">
    <div class="vmp-exam-score__panel">成绩结果</div>
  </vh-dialog>
</template>
<script>
  export default {
    name: 'VmpExamScore',
    data() {
      return {
        examScoreVisible: false, // 快问快答 - 成绩结果
        examId: null
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    methods: {
      // 关闭 快问快打 - 排行榜手机弹出框
      closeDialog() {
        this.examScoreVisible = false;
      },
      async open(examId) {
        this.examScoreVisible = true;
        this.examId = examId;
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less" scoped>
  .vmp-exam-score {
    height: 844px;
    background: transparent;
    background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
    border-radius: 40px 40px 0px 0px;
    &__panel {
      text-align: center;
    }
  }
</style>
