<template>
  <!-- 快问快答-预览-->
  <van-popup
    get-container="body"
    class="vmp-exam-preview-wap"
    v-model="examPreviewVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examPreviewVisible"
  >
    <div class="vmp-exam-preview-wap__panel">预览</div>
  </van-popup>
</template>
<script>
  export default {
    name: 'VmpExamPreviewWap',
    data() {
      return {
        examPreviewVisible: false, // 快问快答 - 答题
        examId: null
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    methods: {
      // 关闭 快问快答 - 预览
      closeDialog() {
        this.examPreviewVisible = false;
      },
      async open(examId) {
        this.examPreviewVisible = true;
        this.examId = examId;
      }
    },
    beforeCreate() {}
  };
</script>
<style lang="less" scoped>
  .vmp-exam-preview-wap {
    height: 844px;
    background: transparent;
    background: linear-gradient(54.82deg, #fdf1ed 12.42%, #f3f2ff 104.09%);
    border-radius: 40px 40px 0px 0px;
    &__panel {
      text-align: center;
    }
  }
</style>
