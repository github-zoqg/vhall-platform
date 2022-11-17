<template>
  <!-- 快问快答-排行榜 -->
  <vh-dialog title="" :visible.sync="examRankVisible" width="500px" custom-class="vmp-exam-rank">
    <div class="vmp-exam-rank__panel">排行榜</div>
  </vh-dialog>
</template>
<script>
  export default {
    name: 'VmpExamRank',
    data() {
      return {
        examRankVisible: false, // 快问快答 - 排行榜
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
        this.examRankVisible = false;
      },
      async open(examId) {
        this.examRankVisible = true;
        this.examId = examId;
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less" scoped>
  .vmp-exam-rank-wap {
    height: 844px;
    background: transparent;
    background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
    border-radius: 40px 40px 0px 0px;
    &__panel {
      text-align: center;
    }
  }
</style>
