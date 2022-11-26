<template>
  <!-- 快问快答-用户信息收集 -->
  <vh-dialog
    title=""
    :visible.sync="examCollectVisible"
    width="500px"
    custom-class="vmp-exam-collect"
  >
    <div class="vmp-exam-collect__panel">用户信息收集</div>
  </vh-dialog>
</template>
<script>
  export default {
    name: 'VmpExamCollect',
    data() {
      return {
        examCollectVisible: false, // 快问快答 - 用户信息收集
        examId: null
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    methods: {
      // 关闭 快问快打 - 用户信息手机弹出框
      closeDialog() {
        this.examCollectVisible = false;
        this.$emit('close');
      },
      async open(examId) {
        this.examCollectVisible = true;
        this.examId = examId;
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less" scoped>
  .vmp-exam-collect-wap {
    height: 844px;
    background: transparent;
    background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
    border-radius: 40px 40px 0px 0px;
    &__panel {
      text-align: center;
    }
  }
</style>
